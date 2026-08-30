import { JobService } from '../JobService';
import { ExtractionStages } from '../types';
import { ExtractionService } from '../../services/workflow-extraction/ExtractionService';
import { db } from '../../db/index';

export class ExtractionJobHandler {
  static async handle(jobId: string, documentId: string) {
    try {
      // Step 1: Parsing
      await JobService.updateStage(jobId, ExtractionStages[1].name, ExtractionStages[1].progress);
      // Step 2: Extracting
      await JobService.updateStage(jobId, ExtractionStages[2].name, ExtractionStages[2].progress);
      
      // Look up document to ensure idempotency. If a workflow already exists, don't re-create.
      const doc = await db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirst();
      if (!doc) throw new Error('Document not found');
      
      // Run actual extraction
      const result = await ExtractionService.extract(documentId, jobId);

      // Step 3: Validating
      await JobService.updateStage(jobId, ExtractionStages[3].name, ExtractionStages[3].progress);
      // Step 4: Completed
      // Ensure the resource_id is updated to point to the workflow Id for result reference
      const finalDoc = await db.selectFrom('documents').select('workflow_id').where('id', '=', documentId).executeTakeFirst();
      
      await db.updateTable('jobs')
        .set({ resource_id: finalDoc?.workflow_id || result.workflowVersionId })
        .where('id', '=', jobId)
        .execute();

      await JobService.markCompleted(jobId);
    } catch (err) {
      // Validation or internal failure
      await JobService.markFailed(jobId, err, true); // AI generation/timeout is retryable
    }
  }
}
