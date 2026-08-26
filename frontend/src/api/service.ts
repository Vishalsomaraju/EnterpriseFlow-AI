import type { Project, WorkflowGraph, ImpactAnalysisResult, Build, BobActivityEvent, BobSubagent, CodeDiff, SecurityResult, TestRun, ReviewSummary } from '../types';
import type { AsyncJobResponse, JobResult, ImpactAnalysisResponse, BuildChangesResponse } from './types';

export interface ApiService {
  // Dashboard & Activity & Rule Management & Execution (API Contract Gaps)
  getDashboardStats(): Promise<{ totalWorkflows: number, activeWorkflows: number, pendingTasks: number, bobChanges: number }>;
  getActivity(): Promise<Array<{ id: string, title: string, source: string, timestamp: string }>>;
  changeRule(ruleId: string, updates: any): Promise<void>;
  getWorkflowExecution(workflowId: string): Promise<any>;
  getDocumentation(workflowId: string): Promise<any>;

  // Projects
  getProjects(): Promise<Project[]>;
  createProject(name: string): Promise<void>;

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
  analyzeRuleImpact(ruleId: string, expression?: string): Promise<ImpactAnalysisResult | ImpactAnalysisResponse>;

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
