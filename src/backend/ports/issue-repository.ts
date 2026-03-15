/**
 * Issue Repository Port.
 * Interface for persisting and retrieving issues.
 */

import type { Issue, IssueStatus, PaginatedResult, Priority } from '@/backend/core/issues/entities'

export type IssueFilters = {
	status?: IssueStatus[]
	priority?: Priority[]
	projectId?: string
	labelIds?: string[]
	search?: string
}

export type CreateIssueInput = {
	title: string
	description?: string
	status?: IssueStatus
	priority?: Priority
	labelIds?: string[]
	projectId?: string | null
	parentId?: string
}

export type UpdateIssueInput = {
	title?: string
	description?: string | null
	status?: IssueStatus
	priority?: Priority
	labelIds?: string[]
	projectId?: string | null
}

export interface IssueRepository {
	list(filters?: IssueFilters): Promise<PaginatedResult<Issue>>
	getById(id: string): Promise<Issue | null>
	create(input: CreateIssueInput): Promise<Issue>
	update(id: string, input: UpdateIssueInput): Promise<Issue>
	delete(id: string): Promise<void>
}
