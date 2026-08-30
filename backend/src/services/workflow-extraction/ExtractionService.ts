import { db } from '../../db/index';
import { MockAIClient } from './ai/MockAIClient';
import { ExtractionOutputSchema } from '../../schemas/extraction.schema';
import { WorkflowNormalizer } from '../workflow/WorkflowNormalizer';
import { WorkflowService } from '../workflow/WorkflowService';
import { v4 as uuidv4 } from 'uuid';

export class ExtractionService {
  static async extract(documentId: string, jobId?: string): Promise<any> {
    // 1. Fetch document
    const doc = await db.selectFrom('documents').selectAll().where('id', '=', documentId).executeTakeFirstOrThrow();

    // 2. Fetch Project & Workflow if available
    const project = await db.selectFrom('projects').where('id', '=', doc.project_id).selectAll().executeTakeFirst();
    const workflow = doc.workflow_id
      ? await db.selectFrom('workflows').where('id', '=', doc.workflow_id).selectAll().executeTakeFirst()
      : null;

    // 3. AI Extraction
    const aiClient = new MockAIClient();
    const raw = await aiClient.extractWorkflow({
      documentId,
      filename: doc.filename,
      scenario: 'default'
    });

    const rawOutput = raw as any;
    if (workflow?.name || project?.name) {
      rawOutput.name = workflow?.name || project?.name;
    }

    // 4. Validate & Normalize
    const validated = ExtractionOutputSchema.parse(rawOutput);
    const normalized = WorkflowNormalizer.normalize(validated);

    // 5. Persist
    const currentJobId = jobId || uuidv4();
    const versionId = await WorkflowService.persistExtractedWorkflow(documentId, currentJobId, normalized);

    return {
      id: documentId,
      workflowVersionId: versionId,
      workflowId: doc.workflow_id
    };
  }
}

