import { JobService } from '../JobService';
import { db } from '../../db/index';
import { workflowExecutionService } from '../../services/execution/WorkflowExecutionService';
import { ExecutionStages, JobStatus } from '../types';

export class ExecutionJobHandler {
  static async handle(jobId: string, executionId: string) {
    try {
      await JobService.updateStage(jobId, ExecutionStages[1].name, ExecutionStages[1].progress); // RUNNING

      // Get payload from execution
      const execution = await db.selectFrom('workflow_executions').where('id', '=', executionId).selectAll().executeTakeFirst();
      if (!execution) throw new Error('Execution not found');
      
      const version = await db.selectFrom('workflow_versions').where('id', '=', execution.version_id).selectAll().executeTakeFirst();
      if (!version) throw new Error('Version not found');

      await workflowExecutionService.execute(
        jobId,
        executionId,
        version.workflow_id,
        execution.version_id,
        execution.input_snapshot as any,
        execution.idempotency_key || ''
      );

      // WorkflowExecutionService updates the job status to COMPLETED or FAILED directly.
    } catch (err: any) {
      await JobService.markFailed(jobId, err);
      
      await db.updateTable('workflow_executions')
        .set({ status: 'FAILED', completed_at: new Date(), failure_reason: err.message })
        .where('id', '=', executionId)
        .execute();
    }
  }
}
