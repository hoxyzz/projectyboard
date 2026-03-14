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
