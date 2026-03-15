import type { PaginatedResult } from '@/shared/types'

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled'

export type IssueProject = {
	id: string
	name: string
	key: string
	color?: string
}

export type IssueLabel = {
	id: string
	name: string
	color: string
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

export type IssueFilters = {
	status?: IssueStatus[]
	priority?: Priority[]
	projectId?: string
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

export type CreateIssueProjectInput = {
	name: string
	key?: string
	color?: string
}

export type CreateIssueLabelInput = {
	name: string
	color: string
}

export type IssueRepository = {
	list(filters?: IssueFilters): Promise<PaginatedResult<Issue>>
	getById(id: string): Promise<Issue | null>
	create(input: CreateIssueInput): Promise<Issue>
	update(id: string, input: UpdateIssueInput): Promise<Issue>
	destroy(id: string): Promise<void>
}

export type IssueProjectRepository = {
	listProjects(): Promise<IssueProject[]>
	createProject(input: CreateIssueProjectInput): Promise<IssueProject>
	deleteProject(id: string): Promise<void>
}

export type IssueLabelRepository = {
	listLabels(): Promise<IssueLabel[]>
	createLabel(input: CreateIssueLabelInput): Promise<IssueLabel>
	deleteLabel(id: string): Promise<void>
}
