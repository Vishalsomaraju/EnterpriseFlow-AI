import { db } from '../../db/index';
import { securePushClient } from './adapters/SecurePushClient';
import { JobService } from '../../jobs/JobService';
import { JobType } from '../../jobs/types';
import { JobWorker } from '../../jobs/JobWorker';

export class LifecycleOrchestrator {

  async onChangesReceived(buildId: string) {
    // 1. Run real SecurePush scan against actual diff
    let scanResult;
    try {
      scanResult = await securePushClient.scanChanges(buildId);
    } catch (error) {
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', buildId).execute();
      await db.insertInto('bob_activity_events').values({
        build_id: buildId,
        event_type: 'SECURE_PUSH_FAILED',
        message: `SecurePush scanner failed: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { error: String(error) }
      }).execute();
      throw error;
    }

    await db.insertInto('security_scans')
      .values({
        build_id: buildId,
        status: scanResult.status,
        risk_score: scanResult.riskScore,
        critical: scanResult.critical,
        high: scanResult.high,
        medium: scanResult.medium,
        low: scanResult.low,
        findings: scanResult.findings,
        evidence_path: scanResult.evidencePath || null,
        started_at: new Date(),
        completed_at: new Date(),
      })
      .execute();

    const { EvidenceWriter } = await import('./EvidenceWriter');
    try {
      await EvidenceWriter.writeSecurity(buildId, scanResult);
    } catch (error) {
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', buildId).execute();
      throw error;
    }

    if (scanResult.status === 'BLOCK') {
      await db.updateTable('builds')
        .set({ status: 'FAILED' })
        .where('id', '=', buildId)
        .execute();

      await db.insertInto('bob_activity_events')
        .values({
          build_id: buildId,
          event_type: 'SECURE_PUSH_FAILED',
          message: `SecurePush BLOCKED: ${scanResult.critical} critical, ${scanResult.high} high findings. Risk score: ${scanResult.riskScore}/100`,
          metadata: { scanResult }
        })
        .execute();

      return;
    }

    // 2. PASS/WARN → proceed to TESTING
    await db.updateTable('builds')
      .set({ status: 'TESTING' })
      .where('id', '=', buildId)
      .execute();

    await db.insertInto('bob_activity_events')
      .values({
        build_id: buildId,
        event_type: 'SECURE_PUSH_PASSED',
        message: `SecurePush ${scanResult.status}: risk score ${scanResult.riskScore}/100. Proceeding to test phase.`,
        metadata: { status: scanResult.status, riskScore: scanResult.riskScore }
      })
      .execute();

    // 3. Dispatch test job
    const testJobId = await JobService.createJob(JobType.TESTING, 'build', buildId);
    JobWorker.dispatch(testJobId, JobType.TESTING, buildId);
  }

  async onTestsReceived(buildId: string) {
    // 1. Check if we have passing tests
    const testRuns = await db.selectFrom('test_runs')
      .where('build_id', '=', buildId)
      .selectAll()
      .execute();

    const allPassed = testRuns.length > 0 && testRuns.every(tr => tr.status === 'PASS');

    if (allPassed) {
      await db.updateTable('builds')
        .set({ status: 'VALIDATED' })
        .where('id', '=', buildId)
        .execute();

      // Generate Documentation
      const { documentationService } = await import('../documentation/DocumentationService');
      try {
        await documentationService.generateAndPersistDocs(buildId);
      } catch (error) {
        await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', buildId).execute();
        throw error;
      }

      // Auto-transition to READY_FOR_REVIEW
      await db.updateTable('builds')
        .set({ status: 'READY_FOR_REVIEW' })
        .where('id', '=', buildId)
        .execute();
    } else {
      await db.updateTable('builds')
        .set({ status: 'FAILED' }) // or leave it in TESTING until it passes
        .where('id', '=', buildId)
        .execute();
    }
  }
}

export const lifecycleOrchestrator = new LifecycleOrchestrator();
