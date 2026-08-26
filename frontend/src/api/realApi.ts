import { apiClient } from './client';
import type { ApiService } from './service';
import type { Project, WorkflowGraph, Build, BobActivityEvent, BobSubagent, CodeDiff, SecurityResult, TestRun, ReviewSummary } from '../types';
import type { AsyncJobResponse, JobResult, ImpactAnalysisResponse, BuildChangesResponse } from './types';

export class RealApiService implements ApiService {
  // =======================================================================
  // API CONTRACT GAPS (Methods required by UI but missing from API_Contract.md)
  // =======================================================================
  async getDashboardStats(): Promise<{ totalWorkflows: number, activeWorkflows: number, pendingTasks: number, bobChanges: number }> {
    throw new Error('API CONTRACT GAP: Dashboard statistics endpoint is not documented in API_Contract.md.');
  }
  async getActivity(): Promise<Array<{ id: string, title: string, source: string, timestamp: string }>> {
    throw new Error('API CONTRACT GAP: Activity feed endpoint is not documented in API_Contract.md.');
  }
  async changeRule(_ruleId: string, _updates: any): Promise<void> {
    throw new Error('API CONTRACT GAP: Rule change endpoint (e.g. PUT /rules/:id) is not documented in API_Contract.md.');
  }
  async getWorkflowExecution(_workflowId: string): Promise<any> {
    throw new Error('API CONTRACT GAP: Workflow execution state endpoint is not documented in API_Contract.md.');
  }
  async getDocumentation(_workflowId: string): Promise<any> {
    throw new Error('API CONTRACT GAP: Documentation fetching endpoint is not documented in API_Contract.md.');
  }

  // Projects
  getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  }
  createProject(name: string): Promise<void> {
    return apiClient.post('/projects', { name });
  }

  // Documents & Extraction
  extractDocument(id: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/documents/${id}/extract`);
  }
  getJob(id: string): Promise<JobResult> {
    return apiClient.get<JobResult>(`/jobs/${id}`);
  }

  // Workflows
  getWorkflowGraph(id: string): Promise<WorkflowGraph> {
    return apiClient.get<WorkflowGraph>(`/workflows/${id}/graph`);
  }

  // Blueprints
  implementBlueprint(id: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/blueprints/${id}/implement`);
  }
  getBuildChanges(id: string): Promise<BuildChangesResponse> {
    return apiClient.get<BuildChangesResponse>(`/builds/${id}/changes`);
  }

  // Tests & Security
  runTests(buildId: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/builds/${buildId}/test`);
  }
  runSecurityScan(buildId: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/builds/${buildId}/security-scan`);
  }

  // Impact Analysis
  analyzeRuleImpact(ruleId: string, expression?: string): Promise<ImpactAnalysisResponse> {
    return apiClient.post<ImpactAnalysisResponse>(`/rules/${ruleId}/impact`, { expression });
  }

  // Reviews
  approveReview(id: string): Promise<boolean> {
    return apiClient.post<boolean>(`/reviews/${id}/approve`).then(() => true);
  }
  rejectReview(id: string, reason?: string): Promise<boolean> {
    return apiClient.post<boolean>(`/reviews/${id}/reject`, { reason }).then(() => true);
  }

  // =======================================================================
  // Stubs for legacy mock methods not explicitly defined in the REST contract
  // These will throw or return empty defaults in the real implementation
  // until the backend formally supports them.
  // =======================================================================
  async getBuildOverview(_buildId: string): Promise<Build> {
    throw new Error('Not implemented in Real API Contract');
  }
  async getBobActivity(_buildId: string): Promise<BobActivityEvent[]> {
    throw new Error('Not implemented in Real API Contract');
  }
  async getBobSubagents(_buildId: string): Promise<BobSubagent[]> {
    throw new Error('Not implemented in Real API Contract');
  }
  async getCodeDiff(_buildId: string): Promise<CodeDiff> {
    throw new Error('Not implemented in Real API Contract');
  }
  async getSecurityResult(_buildId: string): Promise<SecurityResult> {
    throw new Error('Not implemented in Real API Contract');
  }
  async getTests(_workflowId: string): Promise<TestRun[]> {
    throw new Error('Not implemented in Real API Contract');
  }
  async getReviewSummary(_workflowId: string): Promise<ReviewSummary> {
    throw new Error('Not implemented in Real API Contract');
  }
}

export const realApi = new RealApiService();
