"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionJobHandler = void 0;
const JobService_1 = require("../JobService");
const types_1 = require("../types");
const ExtractionService_1 = require("../../services/workflow-extraction/ExtractionService");
const index_1 = require("../../db/index");
class ExtractionJobHandler {
    static async handle(jobId, documentId) {
        try {
            // Step 1: Parsing
            await JobService_1.JobService.updateStage(jobId, types_1.ExtractionStages[1].name, types_1.ExtractionStages[1].progress);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            // Step 2: Extracting
            await JobService_1.JobService.updateStage(jobId, types_1.ExtractionStages[2].name, types_1.ExtractionStages[2].progress);
            // Look up document to ensure idempotency. If a workflow already exists, don't re-create.
            const doc = await index_1.db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirst();
            if (!doc)
                throw new Error('Document not found');
            let workflowVersionId;
            if (doc.workflow_id) {
                // If it already extracted previously and got a workflow_id, reuse the latest version
                const wv = await index_1.db.selectFrom('workflow_versions')
                    .select('id')
                    .where('workflow_id', '=', doc.workflow_id)
                    .orderBy('version', 'desc')
                    .executeTakeFirst();
                workflowVersionId = wv.id;
            }
            else {
                // Run actual extraction
                const workflowData = await ExtractionService_1.ExtractionService.extract(documentId);
                // The service already created the workflow, node, edges, rules, etc.
                // It returns the workflow version ID implicitly inside the result (or we look it up)
                const updatedDoc = await index_1.db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirst();
                const wv = await index_1.db.selectFrom('workflow_versions')
                    .select('id')
                    .where('workflow_id', '=', updatedDoc.workflow_id)
                    .orderBy('version', 'desc')
                    .executeTakeFirst();
                workflowVersionId = wv.id;
            }
            // Step 3: Validating
            await JobService_1.JobService.updateStage(jobId, types_1.ExtractionStages[3].name, types_1.ExtractionStages[3].progress);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            // Step 4: Completed
            // Ensure the resource_id is updated to point to the workflow Id for result reference
            const finalDoc = await index_1.db.selectFrom('documents').select('workflow_id').where('id', '=', documentId).executeTakeFirst();
            await index_1.db.updateTable('jobs')
                .set({ resource_id: finalDoc.workflow_id })
                .where('id', '=', jobId)
                .execute();
            await JobService_1.JobService.markCompleted(jobId);
        }
        catch (err) {
            // Validation or internal failure
            await JobService_1.JobService.markFailed(jobId, err, true); // AI generation/timeout is retryable
        }
    }
}
exports.ExtractionJobHandler = ExtractionJobHandler;
