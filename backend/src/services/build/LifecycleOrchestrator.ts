import { db } from '../../db/index';
import { securePushClient } from './adapters/SecurePushClient';
import { jobService } from '../../jobs/JobService';

export class LifecycleOrchestrator {
  
  async onChangesReceived(buildId: string) {
    // Transition to testing (we'll run SecurePush synchronously for now)
    
    // 1. Run SecurePush Scan
    const scanResult = await securePushClient.scanChanges(buildId);
    
    await db.insertInto('security_scans')
      .values({
        build_id: buildId,
        status: scanResult.status,
        critical: scanResult.critical,
        high: scanResult.high,
        medium: scanResult.medium,
        low: scanResult.low
      })
      .execute();

    if (scanResult.status === 'BLOCK') {
      await db.updateTable('builds')
        .set({ status: 'FAILED' })
        .where('id', '=', buildId)
        .execute();
      
      await db.insertInto('bob_activity_events')
        .values({
          build_id: buildId,
          event_type: 'SECURE_PUSH_FAILED',
          message: 'SecurePush blocked the changes.',
          metadata: { scanResult }
        })
        .execute();
        
      return;
    }

    // 2. PASS/WARN -> proceed to TESTING
    await db.updateTable('builds')
      .set({ status: 'TESTING' })
      .where('id', '=', buildId)
      .execute();

    // 3. Dispatch test job for the backend to orchestrate testing (or wait for Bob's tests)
    // If we rely entirely on Bob's test run, we just wait.
    // Let's create a job so that we have an active worker tracking this stage.
    await jobService.createJob('BUILD_TESTING', 'build', buildId);
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
      await documentationService.generateAndPersistDocs(buildId);
        
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
