/**
 * Core entity types for Issues domain.
 * Framework-agnostic: no Next.js, React, Drizzle, or SQL here.
 */

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled'

export type IssueLabel = {
	id: string
	name: string
	color: string
}

export type IssueProject = {
	id: string
	name: string
	key: string
	color?: string
}

export type SubIssueProgress = {
	done: number
	total: number
}

export type ActivityEvent = {
	id: string
	type:
		| 'status_change'
		| 'priority_change'
		| 'label_added'
		| 'label_removed'
		| 'created'
		| 'updated'
		| 'description_changed'
	field?: string
	from?: string
	to?: string
	userId: string
	userName: string
	createdAt: string
}

export type Issue = {
	id: string
	identifier: string
	title: string
	description?: string
	status: IssueStatus
	priority: Priority
	labels: IssueLabel[]
	parentId?: string
	parentTitle?: string
	subIssues?: SubIssueProgress
	projectId?: string
	projectName?: string
	activity?: ActivityEvent[]
	createdAt: string
	updatedAt: string
}

export type PaginatedResult<T> = {
	data: T[]
	total: number
	page: number
	pageSize: number
	hasMore: boolean
}
