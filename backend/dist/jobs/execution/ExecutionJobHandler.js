"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionJobHandler = void 0;
const JobService_1 = require("../JobService");
const index_1 = require("../../db/index");
const WorkflowExecutionService_1 = require("../../services/execution/WorkflowExecutionService");
const types_1 = require("../types");
class ExecutionJobHandler {
    static async handle(jobId, executionId) {
        try {
            await JobService_1.JobService.updateJobStage(jobId, types_1.ExecutionStages[1]); // RUNNING
            // Get payload from job
            const job = await index_1.db.selectFrom('jobs').where('id', '=', jobId).selectAll().executeTakeFirst();
            if (!job || !job.payload)
                throw new Error('Job or payload not found');
            const payload = job.payload;
            await WorkflowExecutionService_1.workflowExecutionService.execute(jobId, executionId, payload.workflowId, payload.versionId, payload.inputSnapshot, payload.idempotencyKey);
            // WorkflowExecutionService updates the job status to COMPLETED or FAILED directly.
        }
        catch (err) {
            await JobService_1.JobService.updateJobStatus(jobId, types_1.JobStatus.FAILED, err.message);
            await index_1.db.updateTable('workflow_executions')
                .set({ status: 'FAILED', completed_at: new Date(), failure_reason: err.message })
                .where('id', '=', executionId)
                .execute();
        }
    }
}
exports.ExecutionJobHandler = ExecutionJobHandler;
