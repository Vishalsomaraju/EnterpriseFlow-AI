export interface ExtractionInput {
  documentId?: string;
  textContent?: string;
  scenario?: string; // used for testing or bypassing live LLM
}

// Unvalidated JSON output straight from the AI
export interface RawAIWorkflowOutput {
  name?: string;
  actors?: string[];
  systems?: string[];
  steps?: { id?: string; name?: string; type?: string }[];
  decisions?: { id?: string; name?: string; conditions?: string[] }[];
  rules?: {
    id?: string;
    name?: string;
    expression?: string;
    source_node_id?: string;
    decision_node_id?: string;
    target_node_id?: string | string[];
  }[];
  integrations?: string[];
  requirements?: string[];
  bottlenecks?: string[];
  acceptance_criteria?: string[];
}
