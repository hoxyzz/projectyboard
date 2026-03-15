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

// ============================================================================
// Use Case Class (for container DI)
// ============================================================================

export class ReadIssueUseCase {
	private issueRepo: IssueRepository

	constructor(issueRepo: IssueRepository) {
		this.issueRepo = issueRepo
	}

	async list(filters?: ReadIssuesQuery): Promise<{
		success: boolean
		data?: Issue[]
		error?: string
	}> {
		try {
			const result = await readIssues({ issues: this.issueRepo }, filters ?? {})
			return { success: true, data: result.items }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to read issues'
			}
		}
	}

	async byId(id: string): Promise<{
		success: boolean
		data?: Issue
		error?: string
	}> {
		try {
			const issue = await readIssueById({ issues: this.issueRepo }, id)
			if (!issue) {
				return { success: false, error: 'Issue not found' }
			}
			return { success: true, data: issue }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to read issue'
			}
		}
	}

	async byProject(projectId: string): Promise<{
		success: boolean
		data?: Issue[]
		error?: string
	}> {
		try {
			const result = await readIssues({ issues: this.issueRepo }, { projectId })
			return { success: true, data: result.items }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to read issues'
			}
		}
	}
}
