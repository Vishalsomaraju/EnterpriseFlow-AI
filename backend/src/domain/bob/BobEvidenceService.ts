import { db } from '../../db';
import { z } from 'zod';
import {
  BobEventSchema,
  BobPlanSchema,
  BobChangesSchema,
  BobTestResultSchema
} from './BobIngestionSchemas';
import { AppError } from '../../errors/AppError';
import { lifecycleOrchestrator } from '../../services/build/LifecycleOrchestrator';
import { bobWorkspaceManager } from '../../services/build/BobWorkspaceManager';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export class BobEvidenceService {
  private async validateIdentity(data: { build_id: string; bob_session_id: string }) {
    const build = await db.selectFrom('builds').where('id', '=', data.build_id).selectAll().executeTakeFirst();
    if (!build) throw new Error(`Unknown build: ${data.build_id}`);

    const manifest = await bobWorkspaceManager.readManifest(data.build_id);
    if (manifest.buildId !== data.build_id || manifest.bobSessionId !== data.bob_session_id) {
      throw new Error('Evidence identity does not match the generated Bob workspace manifest');
    }

    const blueprint = await db.selectFrom('blueprints').where('id', '=', build.blueprint_id).selectAll().executeTakeFirst();
    if (!blueprint || blueprint.workflow_version_id !== manifest.workflowVersionId) {
      throw new Error('Evidence workflow version does not match the build');
    }
    return { build, manifest };
  }

  private async validateRepositoryDiff(
    repository: string,
    baselineCommit: string,
    files: Array<{ file_path: string; diff?: string }>,
  ): Promise<void> {
    if (!/^[0-9a-f]{7,64}$/i.test(baselineCommit)) {
      throw new Error('Bob workspace manifest contains an invalid baseline commit');
    }
    for (const file of files) {
      const relativePath = path.normalize(file.file_path);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw new Error(`Invalid repository path in Bob changes: ${file.file_path}`);
      }
      const { stdout } = await execFileAsync('git', ['diff', '--name-only', baselineCommit, '--', file.file_path], { cwd: repository });
      if (!stdout.split(/\r?\n/).some((entry) => entry === file.file_path)) {
        throw new Error(`Bob change is not present in the repository diff: ${file.file_path}`);
      }
      const diff = (await execFileAsync('git', ['diff', baselineCommit, '--', file.file_path], { cwd: repository })).stdout;
      if (!diff.trim()) {
        throw new Error(`Bob change has no repository diff: ${file.file_path}`);
      }
    }
  }

  async processEvent(payload: unknown) {
    const data = BobEventSchema.parse(payload);
    await this.validateIdentity(data);
    
    await db.transaction().execute(async (trx) => {
      // Idempotency check
      const existing = await trx.selectFrom('bob_activity_events')
        .where('build_id', '=', data.build_id)
        .where('metadata', '@>', { bob_session_id: data.bob_session_id, event_id: data.event_id })
        .selectAll()
        .executeTakeFirst();
        
      if (existing) return;

      await trx.insertInto('bob_activity_events')
        .values({
          build_id: data.build_id,
          event_type: data.event_type,
          message: data.message,
          metadata: { bob_session_id: data.bob_session_id, event_id: data.event_id, ...data.metadata }
        })
        .execute();

      // State derivation
      const statusByEvent: Record<string, string> = {
        REPOSITORY_ANALYZED: 'ANALYZING',
        PLAN_CREATED: 'PLANNING',
        IMPLEMENTING: 'IMPLEMENTING',
        CHANGES_RECEIVED: 'TESTING',
        TESTS_RECEIVED: 'TESTING',
      };
      const nextStatus = statusByEvent[data.event_type];
      if (nextStatus) {
        await trx.updateTable('builds').set({ status: nextStatus }).where('id', '=', data.build_id).execute();
      }
    });

    const { EvidenceWriter } = await import('../../services/build/EvidenceWriter');
    try {
      await EvidenceWriter.writeActivity(data.build_id, data);
    } catch (error) {
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', data.build_id).execute();
      throw error;
    }
  }

  async processPlan(payload: unknown) {
    const data = BobPlanSchema.parse(payload);
    await this.validateIdentity(data);

    await db.transaction().execute(async (trx) => {
      // Idempotency based on session
      const existing = await trx.selectFrom('build_plans')
        .where('build_id', '=', data.build_id)
        .where('plan_json', '@>', { bob_session_id: data.bob_session_id })
        .selectAll()
        .executeTakeFirst();

      if (existing) return;

      await trx.insertInto('build_plans')
        .values({
          build_id: data.build_id,
          summary: data.summary,
          plan_json: { bob_session_id: data.bob_session_id, ...data.plan_json }
        })
        .execute();

      if (data.subagents) {
        for (const agent of data.subagents) {
          await trx.insertInto('build_subagents')
            .values({
              id: `${data.build_id}-${agent.name.toLowerCase().replace(/\s+/g, '-')}`,
              build_id: data.build_id,
              name: agent.name,
              task: agent.task,
              status: 'PENDING'
            })
            .execute();
        }
      }

      await trx.updateTable('builds')
        .set({ status: 'PLAN_CREATED' })
        .where('id', '=', data.build_id)
        .execute();
    });

    const { EvidenceWriter } = await import('../../services/build/EvidenceWriter');
    try {
      await EvidenceWriter.writePlan(data.build_id, data);
    } catch (error) {
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', data.build_id).execute();
      throw error;
    }
  }

  async processChanges(payload: unknown) {
    const data = BobChangesSchema.parse(payload);
    const { manifest } = await this.validateIdentity(data);
    await this.validateRepositoryDiff(manifest.repository, manifest.repositoryCommitHash, data.files);

    let shouldTriggerLifecycle = false;

    await db.transaction().execute(async (trx) => {
      // Replay protection using change_set_id
      const existing = await trx.selectFrom('bob_activity_events')
        .where('build_id', '=', data.build_id)
        .where('metadata', '@>', { bob_session_id: data.bob_session_id, change_set_id: data.change_set_id })
        .selectAll()
        .executeTakeFirst();

      if (existing) return;

      for (const file of data.files) {
        await trx.insertInto('build_changes')
          .values({
            build_id: data.build_id,
            file_path: file.file_path,
            change_type: file.change_type,
            diff: file.diff || null
          })
          .execute();
      }

      await trx.insertInto('bob_activity_events')
        .values({
          build_id: data.build_id,
          event_type: 'CHANGES_RECEIVED',
          message: `Received ${data.files.length} file changes.`,
          metadata: { bob_session_id: data.bob_session_id, change_set_id: data.change_set_id }
        })
        .execute();

      await trx.updateTable('builds')
        .set({ status: 'CHANGES_RECEIVED' })
        .where('id', '=', data.build_id)
        .execute();
        
      shouldTriggerLifecycle = true;
    });

    const { EvidenceWriter } = await import('../../services/build/EvidenceWriter');
    try {
      for (const file of data.files) await EvidenceWriter.writeChange(data.build_id, file);
    } catch (error) {
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', data.build_id).execute();
      throw error;
    }

    if (shouldTriggerLifecycle) {
      // Defer to LifecycleOrchestrator to take over (SecurePush, Tests, etc)
      lifecycleOrchestrator.onChangesReceived(data.build_id).catch(async (error) => {
        await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', data.build_id).execute();
        await db.insertInto('bob_activity_events').values({
          build_id: data.build_id,
          event_type: 'LIFECYCLE_FAILED',
          message: error instanceof Error ? error.message : String(error),
          metadata: { bob_session_id: data.bob_session_id }
        }).execute();
      });
    }
  }

  async processTestResults(payload: unknown) {
    const data = BobTestResultSchema.parse(payload);
    await this.validateIdentity(data);

    let shouldTriggerLifecycle = false;

    await db.transaction().execute(async (trx) => {
      const existing = await trx.selectFrom('test_runs')
        .where('build_id', '=', data.build_id)
        .where('name', '=', data.test_run_id) // Using name to store run ID for simplicity
        .selectAll()
        .executeTakeFirst();

      if (existing) return;

      const normalizedStatus = data.status === 'Passed' || data.status === 'PASS' ? 'PASS' : 'FAIL';

      await trx.insertInto('test_runs')
        .values({
          id: data.test_run_id,
          build_id: data.build_id,
          name: data.name || data.test_run_id,
          total_tests: data.total_tests,
          passed: data.passed,
          failed: data.failed,
          duration_ms: data.duration_ms,
          status: normalizedStatus
        })
        .execute();

      if (data.individual_results && data.individual_results.length > 0) {
        const resultsToInsert = data.individual_results.map(r => ({
          test_run_id: data.test_run_id,
          build_id: data.build_id,
          test_name: r.test_name,
          status: r.status.toUpperCase(),
          duration_ms: r.duration_ms || null,
          error_output: r.error_output || null
        }));
        await trx.insertInto('test_results').values(resultsToInsert).execute();
      }
        
      shouldTriggerLifecycle = true;
    });

    const { EvidenceWriter } = await import('../../services/build/EvidenceWriter');
    try {
      await EvidenceWriter.writeTestRun(data.build_id, data);
    } catch (error) {
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', data.build_id).execute();
      throw error;
    }

    if (shouldTriggerLifecycle) {
      lifecycleOrchestrator.onTestsReceived(data.build_id).catch(async (error) => {
        await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', data.build_id).execute();
        await db.insertInto('bob_activity_events').values({
          build_id: data.build_id,
          event_type: 'LIFECYCLE_FAILED',
          message: error instanceof Error ? error.message : String(error),
          metadata: { bob_session_id: data.bob_session_id }
        }).execute();
      });
    }
  }

  async processDocumentation(payload: unknown) {
    const { BobDocumentationSchema } = await import('./BobIngestionSchemas');
    const data = BobDocumentationSchema.parse(payload);
    await this.validateIdentity(data);

    await db.transaction().execute(async (trx) => {
      for (const artifact of data.artifacts) {
        await trx.insertInto('documentation_artifacts')
          .values({
            build_id: data.build_id,
            title: artifact.title,
            content: artifact.content,
            path: artifact.path || null,
            artifact_type: artifact.artifact_type || 'README'
          })
          .execute();
      }

      await trx.insertInto('bob_activity_events')
        .values({
          build_id: data.build_id,
          event_type: 'DOCS_RECEIVED',
          message: `Received ${data.artifacts.length} documentation artifacts.`,
          metadata: { bob_session_id: data.bob_session_id }
        })
        .execute();
    });

    const { EvidenceWriter } = await import('../../services/build/EvidenceWriter');
    try {
      for (const doc of data.artifacts) await EvidenceWriter.writeDocumentation(data.build_id, doc);
    } catch (error) {
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', data.build_id).execute();
      throw error;
    }
  }
}

export const bobEvidenceService = new BobEvidenceService();
