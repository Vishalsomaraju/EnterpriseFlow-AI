import { JobService } from '../JobService';
import { ExtractionStages } from '../types';
import { ExtractionService } from '../../services/workflow-extraction/ExtractionService';
import { db } from '../../db/index';

export class ExtractionJobHandler {
  static async handle(jobId: string, documentId: string) {
    try {
      // Step 1: Parsing
      await JobService.updateStage(jobId, ExtractionStages[1].name, ExtractionStages[1].progress);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

      // Step 2: Extracting
      await JobService.updateStage(jobId, ExtractionStages[2].name, ExtractionStages[2].progress);
      
      // Look up document to ensure idempotency. If a workflow already exists, don't re-create.
      const doc = await db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirst();
      if (!doc) throw new Error('Document not found');
      
      let workflowVersionId: string;
      if (doc.workflow_id) {
        // If it already extracted previously and got a workflow_id, reuse the latest version
        const wv = await db.selectFrom('workflow_versions')
          .select('id')
          .where('workflow_id', '=', doc.workflow_id)
          .orderBy('version', 'desc')
          .executeTakeFirst();
        workflowVersionId = wv!.id;
      } else {
        // Run actual extraction
        const workflowData = await ExtractionService.extract(documentId);
        // The service already created the workflow, node, edges, rules, etc.
        // It returns the workflow version ID implicitly inside the result (or we look it up)
        const updatedDoc = await db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirst();
        const wv = await db.selectFrom('workflow_versions')
          .select('id')
          .where('workflow_id', '=', updatedDoc!.workflow_id!)
          .orderBy('version', 'desc')
          .executeTakeFirst();
        workflowVersionId = wv!.id;
      }

      // Step 3: Validating
      await JobService.updateStage(jobId, ExtractionStages[3].name, ExtractionStages[3].progress);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      // Step 4: Completed
      // Ensure the resource_id is updated to point to the workflow Id for result reference
      const finalDoc = await db.selectFrom('documents').select('workflow_id').where('id', '=', documentId).executeTakeFirst();
      
      await db.updateTable('jobs')
        .set({ resource_id: finalDoc!.workflow_id })
        .where('id', '=', jobId)
        .execute();

      await JobService.markCompleted(jobId);
    } catch (err) {
      // Validation or internal failure
      await JobService.markFailed(jobId, err, true); // AI generation/timeout is retryable
    }
  }
}
