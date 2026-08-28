import { apiClient } from './client';
import type { ApiService } from './service';
import type { Project, WorkflowGraph, Build, BobActivityEvent, BobSubagent, CodeDiff, SecurityResult, TestRun, ReviewSummary } from '../types';
import type { AsyncJobResponse, JobResult, ImpactAnalysisResponse, BuildChangesResponse } from './types';

export class RealApiService implements ApiService {
  // =======================================================================
  // Dashboard / Activity / Rules / Execution
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

  // =======================================================================
  // Projects
  // =======================================================================
  getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  }

  createProject(name: string): Promise<void> {
    return apiClient.post('/projects', { name });
  }

  // =======================================================================
  // Documents & Extraction
  // =======================================================================
  extractDocument(id: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/documents/${id}/extract`);
  }

  getJob(id: string): Promise<JobResult> {
    return apiClient.get<JobResult>(`/jobs/${id}`);
  }

  // =======================================================================
  // Workflows
  // =======================================================================
  getWorkflowGraph(id: string): Promise<WorkflowGraph> {
    return apiClient.get<WorkflowGraph>(`/workflows/${id}/graph`);
  }

  // =======================================================================
  // Blueprints
  // =======================================================================
  implementBlueprint(id: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/blueprints/${id}/implement`);
  }

  getBuildChanges(id: string): Promise<BuildChangesResponse> {
    return apiClient.get<BuildChangesResponse>(`/builds/${id}/changes`);
  }

  // =======================================================================
  // Tests & Security
  // =======================================================================
  runTests(buildId: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/builds/${buildId}/test`);
  }

  runSecurityScan(buildId: string): Promise<AsyncJobResponse> {
    return apiClient.post<AsyncJobResponse>(`/builds/${buildId}/security-scan`);
  }

  // =======================================================================
  // Impact Analysis
  // =======================================================================
  analyzeRuleImpact(ruleId: string, expression?: string): Promise<ImpactAnalysisResponse> {
    return apiClient.post<ImpactAnalysisResponse>(`/rules/${ruleId}/impact`, { expression });
  }

  // =======================================================================
  // Reviews
  // =======================================================================
  approveReview(id: string): Promise<boolean> {
    return apiClient.post<boolean>(`/reviews/${id}/approve`).then(() => true);
  }

  rejectReview(id: string, reason?: string): Promise<boolean> {
    return apiClient.post<boolean>(`/reviews/${id}/reject`, { reason }).then(() => true);
  }

  // =======================================================================
  // Bob Boundary — Build Overview
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
    const changes = await apiClient.get<{ diff: string; files_changed: number; files?: Array<{ file_path: string; change_type: string; diff: string }> }>(`/builds/${buildId}/changes`);
    return {
      patch: changes.diff || '',
      files: (changes.files || []).map((f) => ({
        path: f.file_path,
        changeType: f.change_type as 'added' | 'modified' | 'deleted',
        diff: f.diff,
      })),
    };
  }

  getSecurityResult(buildId: string): Promise<SecurityResult> {
    return apiClient.get<SecurityResult>(`/builds/${buildId}/security`);
  }

  async getTests(buildId: string): Promise<TestRun[]> {
    // Backend returns { testRuns: [...] } wrapper
    const res = await apiClient.get<any>(`/builds/${buildId}/tests`);
    const testRuns: any[] = Array.isArray(res?.testRuns) ? res.testRuns : [];
    return testRuns.map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      durationMs: r.duration_ms,
      mode: r.is_demo ? 'DEMO' : 'REAL',
      isDemo: r.is_demo ?? true,
    }));
  }

  async getDocumentation(buildId: string): Promise<any[]> {
    const res = await apiClient.get<any>(`/builds/${buildId}/documentation`);
    // Backend returns an array directly
    return Array.isArray(res) ? res : [];
  }

  async getReviewSummary(buildId: string): Promise<ReviewSummary> {
    try {
      const [changes, testRuns] = await Promise.all([
        apiClient.get<any>(`/builds/${buildId}/changes`),
        apiClient.get<any>(`/builds/${buildId}/tests`),
      ]);

      const filesChanged = changes?.files_changed ?? 0;
      const runs: any[] = Array.isArray(testRuns?.testRuns) ? testRuns.testRuns : [];
      const latestRun = runs[0];
      const testsPassed = latestRun?.passed ?? 0;
      const testsFailed = latestRun?.failed ?? 0;

      return {
        filesChanged,
        testsPassed,
        testsFailed,
        rulesChanged: 1,
        businessImpact: filesChanged > 0
          ? `${filesChanged} file${filesChanged === 1 ? '' : 's'} modified by Bob, ${testsPassed} test${testsPassed === 1 ? '' : 's'} passing`
          : 'Awaiting Bob implementation',
      };
    } catch {
      return { filesChanged: 0, testsPassed: 0, testsFailed: 0, rulesChanged: 0, businessImpact: '' };
    }
  }
}

export const realApi = new RealApiService();
