import { db } from '../../db';
import { securePushClient } from '../../services/build/adapters/SecurePushClient';

export class SecurityScanJobHandler {
  static async handle(jobId: string, targetId: string): Promise<void> {
    try {
      const { JobService } = await import('../JobService');
      const { SecurityScanStages } = await import('../types');
      
      await JobService.updateStage(jobId, SecurityScanStages[1].name, SecurityScanStages[1].progress);

      const scan = await securePushClient.scanChanges(targetId);

      await db.insertInto('security_scans').values({
        build_id: targetId,
        status: scan.status,
        critical: scan.critical,
        high: scan.high,
        medium: scan.medium,
        low: scan.low,
        risk_score: scan.riskScore,
        findings: scan.findings,
        evidence_path: scan.evidencePath || null,
        started_at: new Date(),
        completed_at: new Date()
      }).execute();
      
      await JobService.markCompleted(jobId);
    } catch (e: any) {
      const { JobService } = await import('../JobService');
      await db.updateTable('builds').set({ status: 'FAILED' }).where('id', '=', targetId).execute();
      await db.insertInto('security_scans').values({
        build_id: targetId,
        status: 'FAILED',
        risk_score: null,
        critical: null,
        high: null,
        medium: null,
        low: null,
        findings: [],
        evidence_path: null,
        started_at: new Date(),
        completed_at: new Date()
      }).execute();
      await JobService.markFailed(jobId, e.message);
      throw e;
    }
  }
}
