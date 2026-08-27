import { JobService } from './JobService';
import { db } from '../db';
import { workflowExecutionService } from '../services/WorkflowExecutionService';
import { ExecutionStages, JobStatus } from './types';

export class ExecutionJobHandler {
  static async handle(jobId: string, executionId: string) {
    try {
      await JobService.updateJobStage(jobId, ExecutionStages[1]); // RUNNING

      // Get payload from job
      const job = await db.selectFrom('jobs').where('id', '=', jobId).selectAll().executeTakeFirst();
      if (!job || !job.payload) throw new Error('Job or payload not found');
      
      const payload = job.payload as any;

      await workflowExecutionService.execute(
        jobId,
        executionId,
        payload.workflowId,
        payload.versionId,
        payload.inputSnapshot,
        payload.idempotencyKey
      );

      // WorkflowExecutionService updates the job status to COMPLETED or FAILED directly.
    } catch (err: any) {
      await JobService.updateJobStatus(jobId, JobStatus.FAILED, err.message);
      
      await db.updateTable('workflow_executions')
        .set({ status: 'FAILED', completed_at: new Date(), failure_reason: err.message })
        .where('id', '=', executionId)
        .execute();
    }
  }
}
