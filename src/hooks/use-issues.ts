import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIssueService } from "@/services";
import type { IssueFilters, CreateIssueInput, UpdateIssueInput } from "@/services";

const ISSUES_KEY = "issues";

export function useIssues(filters?: IssueFilters) {
  return useQuery({
    queryKey: [ISSUES_KEY, filters],
    queryFn: () => getIssueService().list(filters),
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: [ISSUES_KEY, id],
    queryFn: () => getIssueService().getById(id),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIssueInput) => getIssueService().create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] }),
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIssueInput }) =>
      getIssueService().update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] }),
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getIssueService().delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] }),
  });
}
