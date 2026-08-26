import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.getDashboardStats(),
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api.getActivity(),
  });
}

export function useWorkflowGraph(id: string) {
  return useQuery({
    queryKey: ['workflow', id, 'graph'],
    queryFn: () => api.getWorkflowGraph(id),
    enabled: !!id,
  });
}

export function useBuildChanges(id: string) {
  return useQuery({
    queryKey: ['build', id, 'changes'],
    queryFn: () => api.getBuildChanges(id),
    enabled: !!id,
  });
}

export function useImpactAnalysis(ruleId: string, expression?: string) {
  return useQuery({
    queryKey: ['impact', ruleId, expression],
    queryFn: () => api.analyzeRuleImpact(ruleId, expression),
    enabled: !!ruleId,
  });
}

// Legacy Methods Mapped to Queries to keep UI building
export function useBuildOverview(id: string) {
  return useQuery({
    queryKey: ['build', id, 'overview'],
    queryFn: () => api.getBuildOverview(id),
    enabled: !!id,
  });
}

export function useBobActivity(id: string) {
  return useQuery({
    queryKey: ['build', id, 'activity'],
    queryFn: () => api.getBobActivity(id),
    enabled: !!id,
  });
}

export function useBobSubagents(id: string) {
  return useQuery({
    queryKey: ['build', id, 'subagents'],
    queryFn: () => api.getBobSubagents(id),
    enabled: !!id,
  });
}

export function useCodeDiff(id: string) {
  return useQuery({
    queryKey: ['build', id, 'diff'],
    queryFn: () => api.getCodeDiff(id),
    enabled: !!id,
  });
}

export function useSecurityResult(id: string) {
  return useQuery({
    queryKey: ['build', id, 'security'],
    queryFn: () => api.getSecurityResult(id),
    enabled: !!id,
  });
}

export function useTests(id: string) {
  return useQuery({
    queryKey: ['workflow', id, 'tests'],
    queryFn: () => api.getTests(id),
    enabled: !!id,
  });
}

export function useReviewSummary(id: string) {
  return useQuery({
    queryKey: ['workflow', id, 'review'],
    queryFn: () => api.getReviewSummary(id),
    enabled: !!id,
  });
}

export function useWorkflowExecution(id: string) {
  return useQuery({
    queryKey: ['workflow', id, 'execution'],
    queryFn: () => api.getWorkflowExecution(id),
    enabled: !!id,
  });
}

export function useDocumentation(id: string) {
  return useQuery({
    queryKey: ['workflow', id, 'docs'],
    queryFn: () => api.getDocumentation(id),
    enabled: !!id,
  });
}
