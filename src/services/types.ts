import type { PaginatedResult } from '@/types'

// ─── Issues ─────────────────────────────────────────────

export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled'

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
	identifier: string // e.g. "AIO-19"
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
	assigneeId?: string
	assigneeName?: string
	activity?: ActivityEvent[]
	createdAt: string
	updatedAt: string
}

export type IssueFilters = {
	status?: IssueStatus[]
	priority?: Priority[]
	projectId?: string
	assigneeId?: string
	search?: string
}

export type IssueService = {
	list(filters?: IssueFilters): Promise<PaginatedResult<Issue>>
	getById(id: string): Promise<Issue | null>
	create(input: CreateIssueInput): Promise<Issue>
	update(id: string, input: UpdateIssueInput): Promise<Issue>
	destroy(id: string): Promise<void>
}

export type CreateIssueInput = {
	title: string
	status?: IssueStatus
	priority?: Priority
	labelIds?: string[]
	projectId?: string
	parentId?: string
}

export type UpdateIssueInput = {
	title?: string
	status?: IssueStatus
	priority?: Priority
	labelIds?: string[]
	projectId?: string
}

// ─── Projects ───────────────────────────────────────────

export type Project = {
	id: string
	name: string
	icon?: string
	color?: string
}

export type ProjectService = {
	list(): Promise<Project[]>
	getById(id: string): Promise<Project | null>
}

// ─── Teams ──────────────────────────────────────────────

export type Team = {
	id: string
	name: string
	color?: string
	memberCount?: number
}

export type TeamService = {
	list(): Promise<Team[]>
	getById(id: string): Promise<Team | null>
}

// ─── User / Auth ────────────────────────────────────────

export type User = {
	id: string
	name: string
	email?: string
	avatarUrl?: string
}

export type UserService = {
	getCurrentUser(): Promise<User | null>
	// Stubs for future auth
	login?: (email: string, password: string) => Promise<User>
	logout?: () => Promise<void>
}

// ─── Notifications ──────────────────────────────────────

export type Notification = {
	id: string
	title: string
	issueId?: string
	read: boolean
	createdAt: string
}

export type NotificationService = {
	list(): Promise<Notification[]>
	markAsRead?: (id: string) => Promise<void>
	markAsUnread?: (id: string) => Promise<void>
	markAllAsRead?: () => Promise<void>
	markManyAsRead?: (ids: string[]) => Promise<void>
	markManyAsUnread?: (ids: string[]) => Promise<void>
	destroy?: (id: string) => Promise<void>
	destroyMany?: (ids: string[]) => Promise<void>
	getUnreadCount(): Promise<number>
}
