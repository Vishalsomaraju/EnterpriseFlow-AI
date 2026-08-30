import { apiClient } from './client';
import type { ApiService } from './service';
import type { Project, WorkflowGraph, Build, BobActivityEvent, BobSubagent, CodeDiff, SecurityResult, TestRun, ReviewSummary } from '../types';
import type { DocumentationArtifact } from './service';
import type { AsyncJobResponse, JobResult, ImpactAnalysisResponse, BuildChangesResponse } from './types';

export class RealApiService implements ApiService {
  // =======================================================================
  // Dashboard / Activity / Rules / Execution
  // =======================================================================
  async getDashboardStats(projectId: string): Promise<{ totalWorkflows: number, activeWorkflows: number, pendingTasks: number, bobChanges: number }> {
    return apiClient.get(`/projects/${projectId}/stats/dashboard`);
  }

  async getActivity(projectId: string): Promise<Array<{ id: string, title: string, source: string, timestamp: string, event_type?: string, message?: string }>> {
    return apiClient.get(`/projects/${projectId}/activity`);
  }

  async changeRule(ruleId: string, updates: any): Promise<void> {
    return apiClient.put(`/rules/${ruleId}`, updates);
  }

  async getWorkflowExecution(workflowId: string): Promise<any> {
    const response = await apiClient.get<{
      execution: { id: string; status: string; currentNodeId: string | null };
      input: { amount?: number };
      history: Array<{ nodeId: string; label: string; status: string; timestamp: string }>;
    }>(`/workflows/${workflowId}/execution`);
    const current = response.history[response.history.length - 1];
    return {
      id: response.execution.id,
      amount: response.input.amount ?? 0,
      status: response.execution.status,
      steps: response.history.map((step) => ({
        name: step.label,
        status: step.status === 'COMPLETED' ? 'success' : step.status.toLowerCase(),
      })),
      assignedTo: current?.label || 'Unassigned',
      timeElapsed: '',
      history: response.history.map((step) => ({
        event: step.label,
        timestamp: step.timestamp,
      })),
    };
  }

  // =======================================================================
  // Projects
  // =======================================================================
  getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  }

  createProject(name: string, description?: string, filename?: string): Promise<{ id: string; name: string; created_at: string; workflowId?: string; workflow_id?: string; versionId?: string; documentId?: string }> {
    return apiClient.post('/projects', { name, description, filename });
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
    return apiClient.get<BuildChangesResponse>(`/builds/${id}/changes`).then((changes) => ({
      diff: changes.diff || '',
      files_changed: changes.files_changed || 0,
      files: (changes.files || []).map((file) => {
        const diff = file.diff || '';
        const normalizedType = file.change_type.toLowerCase();
        const status = normalizedType === 'create' || normalizedType === 'add'
          ? 'added'
          : normalizedType === 'delete' || normalizedType === 'remove'
            ? 'deleted'
            : 'modified';
        return {
          ...file,
          change_type: status,
          additions: file.additions ?? diff.split('\n').filter((line) => line.startsWith('+') && !line.startsWith('+++')).length,
          deletions: file.deletions ?? diff.split('\n').filter((line) => line.startsWith('-') && !line.startsWith('---')).length,
          status: file.status || status,
        };
      }),
    }));
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
  analyzeRuleImpact(ruleId: string, expression: string): Promise<ImpactAnalysisResponse> {
    return apiClient.post<ImpactAnalysisResponse>(`/rules/${ruleId}/impact`, { expression: expression.trim() });
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
    const changes = await this.getBuildChanges(buildId);
    return {
      patch: changes.diff || '',
      files: (changes.files || []).map((f) => ({
        path: f.file_path,
        additions: f.additions ?? 0,
        deletions: f.deletions ?? 0,
        status: f.status || 'modified',
      })),
    };
  }

  getSecurityResult(buildId: string): Promise<SecurityResult> {
    return apiClient.get<SecurityResult>(`/builds/${buildId}/security`);
  }

  async getTests(buildId: string): Promise<TestRun[]> {
    // Backend returns { testRuns: [...] } wrapper
    const res = await apiClient.get<{ testRuns: Array<{
      id: string;
      name: string;
      status: string;
      duration_ms?: number | null;
      is_demo?: boolean | null;
    }> }>(`/builds/${buildId}/tests`);
    const testRuns = res.testRuns;
    return testRuns.map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status === 'PASS' || r.status === 'PASSED' ? 'Passed' : r.status === 'FAIL' || r.status === 'FAILED' ? 'Failed' : 'Skipped',
      durationMs: r.duration_ms ?? 0,
      mode: r.is_demo === true ? 'DEMO' : 'REAL',
      isDemo: r.is_demo === true,
    }));
  }

  async getDocumentation(buildId: string): Promise<DocumentationArtifact[]> {
    return apiClient.get<DocumentationArtifact[]>(`/builds/${buildId}/documentation`);
  }

  async getReviewSummary(buildId: string): Promise<ReviewSummary> {
    return apiClient.get<ReviewSummary>(`/builds/${buildId}/review`);
  }
}

export const realApi = new RealApiService();
