import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: string | { name: string; description?: string; filename?: string }) => {
      if (typeof payload === 'string') {
        return api.createProject(payload);
      }
      return api.createProject(payload.name, payload.description, payload.filename);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSubmitDocument() {
  return useMutation({
    mutationFn: (documentId: string) => api.extractDocument(documentId),
  });
}

export function useStartBuild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blueprintId: string) => api.implementBlueprint(blueprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['build'] });
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    }
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => api.approveReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason?: string }) => api.rejectReview(reviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
}

export function useRuleChangeMutation(workflowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, updates }: { ruleId: string; updates: any }) => api.changeRule(ruleId, updates),
    onSuccess: () => {
      // Invalidate dependent artifacts according to workflow dependency:
      // Rule -> Workflow -> Blueprint -> Build -> Tests -> Review / Impact
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['impact'] });
      queryClient.invalidateQueries({ queryKey: ['build'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
