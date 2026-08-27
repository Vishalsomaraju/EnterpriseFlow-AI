import { Generated } from 'kysely';

export interface Database {
  projects: ProjectTable;
  workflows: WorkflowTable;
  documents: DocumentTable;
  workflow_versions: WorkflowVersionTable;
  workflow_nodes: WorkflowNodeTable;
  workflow_edges: WorkflowEdgeTable;
  workflow_actors: WorkflowActorTable;
  workflow_systems: WorkflowSystemTable;
  business_rules: BusinessRuleTable;
  rule_dependencies: RuleDependencyTable;
  blueprints: BlueprintTable;
  builds: BuildTable;
  build_plans: BuildPlanTable;
  build_subagents: BuildSubagentTable;
  bob_activity_events: BobActivityEventTable;
  build_changes: BuildChangeTable;
  test_runs: TestRunTable;
  security_scans: SecurityScanTable;
  documentation_artifacts: DocumentationArtifactTable;
  reviews: ReviewTable;
  workflow_executions: WorkflowExecutionTable;
  workflow_execution_history: WorkflowExecutionHistoryTable;
  jobs: JobTable;
  activity_events: ActivityEventTable;
  test_results: TestResultTable;
}

export interface ProjectTable {
  id: Generated<string>;
  name: string;
  created_at: Generated<Date>;
}

export interface WorkflowTable {
  id: Generated<string>;
  project_id: string;
  name: string | null;
  created_at: Generated<Date>;
}

export interface DocumentTable {
  id: Generated<string>;
  project_id: string;
  workflow_id: string | null;
  filename: string;
  mime_type: string;
  storage_path: string;
  extraction_status: string;
  created_at: Generated<Date>;
}

export interface WorkflowVersionTable {
  id: Generated<string>;
  workflow_id: string;
  version: number;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface WorkflowNodeTable {
  id: string;
  version_id: string;
  type: string;
  name: string;
  kind: string | null;
  pos_x: number | null;
  pos_y: number | null;
}

export interface WorkflowEdgeTable {
  id: string;
  version_id: string;
  source_id: string;
  target_id: string;
  label: string | null;
  is_branch: Generated<boolean>;
}

export interface WorkflowActorTable {
  id: Generated<string>;
  version_id: string;
  name: string;
  role: string | null;
}

export interface WorkflowSystemTable {
  id: Generated<string>;
  version_id: string;
  name: string;
  description: string | null;
}

export interface BusinessRuleTable {
  id: string;
  version_id: string;
  name: string | null;
  description: string | null;
  condition: string;
  action: string | null;
  node_id: string | null;
}

export interface RuleDependencyTable {
  id: Generated<string>;
  business_rule_id: string;
  target_type: string;
  target_id: string;
}

export interface BlueprintTable {
  id: Generated<string>;
  workflow_version_id: string;
  schema_json: any;
  validation_status: string;
  validation_errors: any | null;
  created_at: Generated<Date>;
}

export interface BuildTable {
  id: Generated<string>;
  blueprint_id: string;
  status: string;
  created_at: Generated<Date>;
}

export interface BuildPlanTable {
  id: Generated<string>;
  build_id: string;
  summary: string | null;
  plan_json: any | null; // jsonb
  version: Generated<number>;
  created_at: Generated<Date>;
}

export interface BuildSubagentTable {
  id: string;
  build_id: string;
  name: string;
  task: string | null;
  status: string | null;
  started_at: Date | null;
  completed_at: Date | null;
  result: string | null;
}

export interface BobActivityEventTable {
  id: Generated<string>;
  build_id: string;
  event_type: string;
  message: string;
  metadata: any | null; // jsonb
  created_at: Generated<Date>;
}

export interface BuildChangeTable {
  id: Generated<string>;
  build_id: string;
  file_path: string;
  change_type: string;
  diff: string | null;
}

export interface TestRunTable {
  id: string;
  build_id: string;
  total_tests: number | null;
  passed: number | null;
  failed: number | null;
  skipped: number | null;
  duration_ms: number | null;
  name: string | null;
  status: string | null;
  repository_path: string | null;
  commit_hash: string | null;
  exit_code: number | null;
  is_demo: boolean | null;
  started_at: Date | null;
  completed_at: Date | null;
}

export interface TestResultTable {
  id: Generated<string>;
  test_run_id: string;
  build_id: string;
  test_name: string;
  status: string;
  duration_ms: number | null;
  error_output: string | null;
  timestamp: Generated<Date>;
}

export interface SecurityScanTable {
  id: Generated<string>;
  build_id: string;
  risk_score: number | null;
  status: string;
  critical: number | null;
  high: number | null;
  medium: number | null;
  low: number | null;
}

export interface DocumentationArtifactTable {
  id: Generated<string>;
  build_id: string;
  title: string;
  content: string;
  path: string | null;
  artifact_type: string | null;
  created_at: Generated<Date>;
}

export interface ReviewTable {
  id: Generated<string>;
  build_id: string;
  version_id: string;
  status: string;
  reviewer: string | null;
  decision: string | null;
  comments: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface WorkflowExecutionTable {
  id: string;
  version_id: string;
  build_id: string | null;
  approved_review_id: string | null;
  status: string;
  amount: string | null;
  assigned_to: string | null;
  time_elapsed: string | null;
  input_snapshot: any | null; // jsonb
  idempotency_key: string | null;
  failure_reason: string | null;
  started_at: Generated<Date>;
  completed_at: Date | null;
}

export interface WorkflowExecutionHistoryTable {
  id: Generated<string>;
  execution_id: string;
  event: string;
  metadata: any | null; // jsonb
  timestamp: Generated<Date>;
}

export interface JobTable {
  id: Generated<string>;
  type: string;
  status: string;
  progress: number | null;
  resource_type: string | null;
  resource_id: string | null;
  error_code: string | null;
  error_message: string | null;
  stage: string | null;
  attempt: Generated<number>;
  max_attempts: Generated<number>;
  retryable: Generated<boolean>;
  started_at: Date | null;
  completed_at: Date | null;
  locked_at: Date | null;
  updated_at: Generated<Date>;
  created_at: Generated<Date>;
}

export interface ActivityEventTable {
  id: string;
  title: string | null;
  message: string | null;
  source: string | null;
  event_type: string | null;
  agent: string | null;
  status: string | null;
  project_id: string | null;
  actor: string | null;
  entity_type: string | null;
  entity_id: string | null;
  workflow_version: string | null;
  metadata: Generated<any | null>; // jsonb
  timestamp: Generated<Date>;
}
