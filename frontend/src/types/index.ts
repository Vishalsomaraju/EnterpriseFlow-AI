export type ExtractionStatus = 'UPLOADED' | 'PARSING' | 'EXTRACTING' | 'VALIDATING' | 'VALIDATION_REQUIRED' | 'COMPLETED' | 'FAILED';

export type BuildStatus = 'QUEUED' | 'ANALYZING' | 'PLANNING' | 'IMPLEMENTING' | 'TESTING' | 'COMPLETED' | 'FAILED';

export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'REQUEST_CHANGES' | 'APPROVED' | 'REJECTED';

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export interface WorkflowExtractionJob {
  jobId: string;
  status: ExtractionStatus;
  result?: {
    workflowId: string;
  };
}

export interface WorkflowNode {
  id: string;
  label: string;
  kind: string;
  type: 'automated' | 'human';
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  isBranch?: boolean;
}

export interface WorkflowRule {
  id: string;
  description: string;
  condition?: string;
  action?: string;
  nodeId: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  rules: WorkflowRule[];
}

export interface BuildJob {
  buildId: string;
  status: BuildStatus;
}

export interface BuildChanges {
  diff: string;
  files_changed: number;
}

export interface ImpactComponent {
  id: string;
  type: string;
  name: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  previousState?: string;
  newRequiredState?: string;
}

export interface RuleBeforeAfterEvaluation {
  input: any;
  before?: string;
  after?: string;
}

export interface ImpactAnalysisResult {
  rule?: {
    id: string;
    oldExpression: string;
    newExpression: string;
  };
  directImpact?: ImpactComponent[];
  downstreamImpact?: ImpactComponent[];
  risk?: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string;
  };
  evaluation?: RuleBeforeAfterEvaluation;

  // Legacy arrays
  affected_files: string[];
  affected_tests: string[];
  affected_nodes: string[];
  affected_docs: string[];
}

export type BuildStageStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface BuildStage {
  id: string;
  name: string;
  status: BuildStageStatus;
}

export interface Build {
  id: string;
  workflowId: string;
  status: BuildStatus;
  stages: BuildStage[];
}

export interface BobActivityEvent {
  id: string;
  timestamp: string;
  eventType: 'log' | 'info' | 'success' | 'error';
  message: string;
  agent: string;
  status: 'running' | 'done' | 'failed';
  source: 'bob-core' | 'subagent' | 'system';
}

export interface BobSubagent {
  id: string;
  name: string;
  task: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result?: string;
}

export interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
  status: 'modified' | 'added' | 'deleted';
}

export interface CodeDiff {
  files: ChangedFile[];
  patch: string; // The raw diff string
}

export interface SecurityResult {
  status: 'PASS' | 'WARN' | 'BLOCK';
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export type TestStatus = 'Passed' | 'Failed' | 'Running' | 'Skipped';

export interface TestRun {
  id: string;
  name: string;
  status: TestStatus;
  durationMs: number;
  mode?: 'REAL' | 'DEMO';
  isDemo?: boolean;
}

export interface ReviewSummary {
  filesChanged: number;
  testsPassed: number;
  testsFailed: number;
  rulesChanged: number;
  businessImpact: string;
}
