import { ExtractionInput, RawAIWorkflowOutput } from './types';

export interface AIClient {
  extractWorkflow(input: ExtractionInput): Promise<unknown>;
}
