import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateIssueInput, Issue, IssueFilters, UpdateIssueInput } from '../types'
import { getIssueData } from '../data'

const ISSUES_KEY = 'issues'

export function useIssues(filters?: IssueFilters) {
	return useQuery({
		queryKey: [ISSUES_KEY, filters],
		queryFn: () => getIssueData().list(filters)
	})
}

export function useIssue(id: string, initialData?: Issue) {
	return useQuery({
		queryKey: [ISSUES_KEY, id],
		queryFn: () => getIssueData().getById(id),
		enabled: !!id,
		initialData
	})
}

export function useCreateIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (input: CreateIssueInput) => getIssueData().create(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}

export function useUpdateIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateIssueInput }) => getIssueData().update(id, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}

export function useDestroyIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => getIssueData().destroy(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}
