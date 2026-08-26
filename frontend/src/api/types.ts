/**
 * EnterpriseFlow Canonical API Types
 * Mirrors docs/api/API_Contract.md
 */

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export type JobStatus = 
  // Extraction Job States
  | 'UPLOADED' | 'PARSING' | 'EXTRACTING' | 'VALIDATING' | 'VALIDATION_REQUIRED' 
  // Build Job States
  | 'QUEUED' | 'ANALYZING' | 'PLANNING' | 'IMPLEMENTING' | 'TESTING' 
  // Terminal States
  | 'COMPLETED' | 'FAILED';

export interface AsyncJobResponse {
  jobId?: string;
  buildId?: string;
  status: JobStatus;
}

export interface JobResult<T = any> {
  status: JobStatus;
  result?: T;
  error?: string;
}

// Impact Analysis
export interface ImpactAnalysisResponse {
  affected_files: string[];
  affected_tests: string[];
  affected_nodes: string[];
  affected_docs: string[];
}

export interface BuildChangesResponse {
  diff: string;
  files_changed: number;
}
