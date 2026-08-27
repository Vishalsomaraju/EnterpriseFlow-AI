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

export class BobEvidenceService {
  async processEvent(payload: unknown) {
    const data = BobEventSchema.parse(payload);
    
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
      if (data.event_type === 'REPOSITORY_ANALYZED') {
        await trx.updateTable('builds')
          .set({ status: 'BOB_REPOSITORY_ANALYZED' })
          .where('id', '=', data.build_id)
          .where('status', '=', 'WAITING_FOR_BOB')
          .execute();
      }
    });
  }

  async processPlan(payload: unknown) {
    const data = BobPlanSchema.parse(payload);

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
  }

  async processChanges(payload: unknown) {
    const data = BobChangesSchema.parse(payload);

    let shouldTriggerLifecycle = false;

    await db.transaction().execute(async (trx) => {
      // Replay protection using change_set_id
      const existing = await trx.selectFrom('bob_activity_events')
        .where('build_id', '=', data.build_id)
        .where('metadata', '@>', { bob_session_id: data.bob_session_id, change_set_id: data.change_set_id })
        .selectAll()
        .executeTakeFirst();

      if (existing) return;

      // Note: In a real system, cryptographic/file integrity would happen here
      // against the actual workspace manifest and physical diff files.
      
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

    if (shouldTriggerLifecycle) {
      // Defer to LifecycleOrchestrator to take over (SecurePush, Tests, etc)
      lifecycleOrchestrator.onChangesReceived(data.build_id).catch(console.error);
    }
  }

  async processTestResults(payload: unknown) {
    const data = BobTestResultSchema.parse(payload);

    let shouldTriggerLifecycle = false;

    await db.transaction().execute(async (trx) => {
      const existing = await trx.selectFrom('test_runs')
        .where('build_id', '=', data.build_id)
        .where('name', '=', data.test_run_id) // Using name to store run ID for simplicity
        .selectAll()
        .executeTakeFirst();

      if (existing) return;

      await trx.insertInto('test_runs')
        .values({
          id: data.test_run_id,
          build_id: data.build_id,
          name: data.test_run_id,
          total_tests: data.total_tests,
          passed: data.passed,
          failed: data.failed,
          duration_ms: data.duration_ms,
          status: data.status
        })
        .execute();
        
      shouldTriggerLifecycle = true;
    });

    if (shouldTriggerLifecycle) {
      lifecycleOrchestrator.onTestsReceived(data.build_id).catch(console.error);
    }
  }
}

export const bobEvidenceService = new BobEvidenceService();
