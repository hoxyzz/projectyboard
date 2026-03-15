import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
	CreateIssueInput,
	CreateIssueLabelInput,
	CreateIssueProjectInput,
	Issue,
	IssueFilters,
	UpdateIssueInput
} from '../types'
import {
	getIssueLabelRepository,
	getIssueProjectRepository,
	getIssueRepository
} from '../data'

const ISSUES_KEY = 'issues'
const ISSUE_PROJECTS_KEY = 'issue-projects'
const ISSUE_LABELS_KEY = 'issue-labels'

export function useIssues(filters?: IssueFilters) {
	return useQuery({
		queryKey: [ISSUES_KEY, filters],
		queryFn: () => getIssueRepository().list(filters)
	})
}

export function useIssue(id: string, initialData?: Issue) {
	return useQuery({
		queryKey: [ISSUES_KEY, id],
		queryFn: () => getIssueRepository().getById(id),
		enabled: !!id,
		initialData
	})
}

export function useCreateIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (input: CreateIssueInput) => getIssueRepository().create(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}

export function useUpdateIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateIssueInput }) =>
			getIssueRepository().update(id, input),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}

export function useDestroyIssue() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => getIssueRepository().destroy(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
	})
}

export function useIssueProjects() {
	return useQuery({
		queryKey: [ISSUE_PROJECTS_KEY],
		queryFn: () => getIssueProjectRepository().listProjects()
	})
}

export function useCreateIssueProject() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (input: CreateIssueProjectInput) =>
			getIssueProjectRepository().createProject(input),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [ISSUE_PROJECTS_KEY] })
			qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
		}
	})
}

export function useDeleteIssueProject() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => getIssueProjectRepository().deleteProject(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [ISSUE_PROJECTS_KEY] })
			qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
		}
	})
}

export function useIssueLabels() {
	return useQuery({
		queryKey: [ISSUE_LABELS_KEY],
		queryFn: () => getIssueLabelRepository().listLabels()
	})
}

export function useCreateIssueLabel() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (input: CreateIssueLabelInput) => getIssueLabelRepository().createLabel(input),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [ISSUE_LABELS_KEY] })
			qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
		}
	})
}

export function useDeleteIssueLabel() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (id: string) => getIssueLabelRepository().deleteLabel(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [ISSUE_LABELS_KEY] })
			qc.invalidateQueries({ queryKey: [ISSUES_KEY] })
		}
	})
}
