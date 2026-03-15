/**
 * Read Issue Use Cases.
 */

import type { Issue, IssueStatus, PaginatedResult, Priority } from '@/backend/core/issues/entities'
import type { IssueFilters, IssueRepository } from '@/backend/ports/issue-repository'

export type ReadIssuesQuery = {
	search?: string
	status?: IssueStatus[]
	priority?: Priority[]
	projectId?: string
	labelIds?: string[]
}

export type ReadIssuesDeps = {
	issues: IssueRepository
}

export async function readIssues(
	deps: ReadIssuesDeps,
	query: ReadIssuesQuery = {}
): Promise<PaginatedResult<Issue>> {
	const filters: IssueFilters = {
		search: query.search,
		status: query.status,
		priority: query.priority,
		projectId: query.projectId,
		labelIds: query.labelIds
	}

	return deps.issues.list(filters)
}

export async function readIssueById(
	deps: ReadIssuesDeps,
	id: string
): Promise<Issue | null> {
	return deps.issues.getById(id)
}
