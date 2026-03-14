import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateIssueInput, Issue, IssueFilters, UpdateIssueInput } from '@/services'

import { getIssueService } from '@/services'

const ISSUES_KEY = 'issues'

export function useIssues(filters?: IssueFilters) {
	return useQuery({
		queryKey: [ISSUES_KEY, filters],
		queryFn: () => getIssueService().list(filters)
	})
}

export function useIssue(id: string, initialData?: Issue) {
	return useQuery({
		queryKey: [ISSUES_KEY, id],
		queryFn: () => getIssueService().getById(id),
		enabled: !!id,
		initialData
	})
}

export function useCreateIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (input: CreateIssueInput) => getIssueService().create(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}

export function useUpdateIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateIssueInput }) =>
			getIssueService().update(id, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}

export function useDeleteIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => getIssueService().delete(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}
