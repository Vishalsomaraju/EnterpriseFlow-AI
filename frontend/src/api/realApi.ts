import { apiClient } from './client';
import type { ApiService } from './service';
import type { Project, WorkflowGraph, Build, BobActivityEvent, BobSubagent, CodeDiff, SecurityResult, TestRun, ReviewSummary } from '../types';
import type { AsyncJobResponse, JobResult, ImpactAnalysisResponse, BuildChangesResponse } from './types';

export class RealApiService implements ApiService {
  // =======================================================================
  // API CONTRACT GAPS (Methods required by UI but missing from API_Contract.md)
  // =======================================================================
  async getDashboardStats(projectId: string = 'proj_123'): Promise<{ totalWorkflows: number, activeWorkflows: number, pendingTasks: number, bobChanges: number }> {
    return apiClient.get(`/projects/${projectId}/stats/dashboard`);
  }
  async getActivity(projectId: string = 'proj_123'): Promise<Array<{ id: string, title: string, source: string, timestamp: string }>> {
    return apiClient.get(`/projects/${projectId}/activity`);
  }
  async changeRule(ruleId: string, updates: any): Promise<void> {
    return apiClient.put(`/rules/${ruleId}`, updates);
  }
  async getWorkflowExecution(workflowId: string): Promise<any> {
    return apiClient.get(`/workflows/${workflowId}/execution`);
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
  // Bob Boundary Real Endpoints
  // =======================================================================
  getBuildOverview(buildId: string): Promise<Build> {
    return apiClient.get<Build>(`/builds/${buildId}`);
  }
  getBobActivity(buildId: string): Promise<BobActivityEvent[]> {
    return apiClient.get<BobActivityEvent[]>(`/builds/${buildId}/events`);
  }
  getBobSubagents(buildId: string): Promise<BobSubagent[]> {
    return apiClient.get<BobSubagent[]>(`/builds/${buildId}/plan`);
  }
  async getCodeDiff(buildId: string): Promise<CodeDiff> {
    const changes = await apiClient.get<any>(`/builds/${buildId}/changes`);
    // Transform backend BuildChangesResponse into frontend CodeDiff for now
    return {
      patch: changes.diff || '',
      files: [] // In a full implementation, we'd map the file list here
    };
  }
  getSecurityResult(buildId: string): Promise<SecurityResult> {
    // For MVP, we'll return a default until a GET endpoint is created
    return Promise.resolve({ status: 'PASS', critical: 0, high: 0, medium: 0, low: 0 });
  }
  getTests(buildId: string): Promise<TestRun[]> {
    return apiClient.get<any>(`/builds/${buildId}/tests`).then(res => res ? [res] : []);
  }
  getDocumentation(buildId: string): Promise<any> {
    return apiClient.get<any>(`/builds/${buildId}/documentation`);
  }
  getReviewSummary(workflowId: string): Promise<ReviewSummary> {
    return Promise.resolve({ filesChanged: 0, testsPassed: 0, testsFailed: 0, rulesChanged: 0, businessImpact: '' });
  }
}

export const realApi = new RealApiService();
