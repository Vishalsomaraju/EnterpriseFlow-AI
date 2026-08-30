import type { Project, WorkflowGraph, Build, BobActivityEvent, BobSubagent, CodeDiff, SecurityResult, TestRun, ReviewSummary } from '../types';
import type { AsyncJobResponse, JobResult, ImpactAnalysisResponse, BuildChangesResponse } from './types';

export interface ApiService {
  // Dashboard & Activity & Rule Management & Execution (API Contract Gaps)
  getDashboardStats(projectId: string): Promise<{ totalWorkflows: number, activeWorkflows: number, pendingTasks: number, bobChanges: number }>;
  getActivity(projectId: string): Promise<Array<{ id: string, title: string, source: string, timestamp: string, event_type?: string, message?: string }>>;
  changeRule(ruleId: string, updates: any): Promise<void>;
  getWorkflowExecution(workflowId: string): Promise<any>;
  getDocumentation(buildId: string): Promise<DocumentationArtifact[]>;

  // Projects
  getProjects(): Promise<Project[]>;
  createProject(name: string, description?: string, filename?: string): Promise<{ id: string; name: string; created_at: string; workflowId?: string; workflow_id?: string; versionId?: string; documentId?: string }>;

  // Documents & Extraction
  extractDocument(id: string): Promise<AsyncJobResponse>;
  getJob(id: string): Promise<JobResult>;

  // Workflows
  getWorkflowGraph(id: string): Promise<WorkflowGraph>;

  // Blueprints
  implementBlueprint(id: string): Promise<AsyncJobResponse>;
  getBuildChanges(id: string): Promise<BuildChangesResponse>;

  // Tests & Security
  runTests(buildId: string): Promise<AsyncJobResponse>;
  runSecurityScan(buildId: string): Promise<AsyncJobResponse>;

  // Impact Analysis
  analyzeRuleImpact(ruleId: string, expression: string): Promise<ImpactAnalysisResponse>;

  // Reviews
  approveReview(id: string): Promise<boolean>;
  rejectReview(id: string, reason?: string): Promise<boolean>;

  // Legacy Mock Methods (to keep UI compiling until fully decoupled)
  getBuildOverview(buildId: string): Promise<Build>;
  getBobActivity(buildId: string): Promise<BobActivityEvent[]>;
  getBobSubagents(buildId: string): Promise<BobSubagent[]>;
  getCodeDiff(buildId: string): Promise<CodeDiff>;
  getSecurityResult(buildId: string): Promise<SecurityResult>;
  getTests(workflowId: string): Promise<TestRun[]>;
  getReviewSummary(workflowId: string): Promise<ReviewSummary>;
}

export interface DocumentationArtifact {
  id: string;
  title: string;
  content: string;
  path: string | null;
  artifact_type: string | null;
  created_at: string;
}
