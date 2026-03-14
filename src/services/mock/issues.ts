import type { PaginatedResult } from '@/types'

import type {
	ActivityEvent,
	CreateIssueInput,
	Issue,
	IssueFilters,
	IssueService,
	UpdateIssueInput
} from '../types'

function makeActivity(overrides: Partial<ActivityEvent>): ActivityEvent {
	return {
		id: crypto.randomUUID(),
		type: 'created',
		userId: 'user-1',
		userName: 'ryoa',
		createdAt: new Date().toISOString(),
		...overrides
	}
}

const MOCK_ISSUES: Issue[] = [
	{
		id: '1',
		identifier: 'AIO-19',
		title: 'Create post-login queries',
		description:
			'Implement all the queries needed after a user logs in, including session validation, profile fetching, and permission checks.',
		status: 'in_progress',
		priority: 'urgent',
		labels: [{ id: 'l1', name: 'CRUD', color: 'hsl(var(--li-label-crud))' }],
		subIssues: { done: 0, total: 3 },
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [
			makeActivity({ type: 'created', createdAt: '2025-02-01T09:00:00Z' }),
			makeActivity({
				type: 'status_change',
				field: 'status',
				from: 'todo',
				to: 'in_progress',
				createdAt: '2025-02-05T14:30:00Z'
			}),
			makeActivity({
				type: 'priority_change',
				field: 'priority',
				from: 'high',
				to: 'urgent',
				createdAt: '2025-02-08T10:00:00Z'
			}),
			makeActivity({ type: 'label_added', to: 'CRUD', createdAt: '2025-02-08T10:05:00Z' })
		],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '2',
		identifier: 'AIO-20',
		title: 'Create authentication queries',
		description:
			'Build the core authentication query layer — login, register, token refresh, and logout mutations.',
		status: 'in_progress',
		priority: 'urgent',
		labels: [],
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [
			makeActivity({ type: 'created', createdAt: '2025-02-01T09:15:00Z' }),
			makeActivity({
				type: 'status_change',
				field: 'status',
				from: 'todo',
				to: 'in_progress',
				createdAt: '2025-02-06T11:00:00Z'
			})
		],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '3',
		identifier: 'AIO-10',
		title: 'Setup database and drizzle-orm',
		description:
			'Initialize PostgreSQL connection, configure drizzle-orm schema, and set up migrations pipeline.',
		status: 'in_progress',
		priority: 'medium',
		labels: [{ id: 'l2', name: 'Database', color: 'hsl(var(--li-label-database))' }],
		subIssues: { done: 0, total: 3 },
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [
			makeActivity({ type: 'created', createdAt: '2025-01-28T08:00:00Z' }),
			makeActivity({
				type: 'label_added',
				to: 'Database',
				createdAt: '2025-01-28T08:05:00Z'
			}),
			makeActivity({
				type: 'status_change',
				field: 'status',
				from: 'todo',
				to: 'in_progress',
				createdAt: '2025-02-03T09:00:00Z'
			})
		],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '4',
		identifier: 'AIO-23',
		title: 'Showcase the role if admin somewhere',
		description:
			'Display admin badge or role indicator in the UI when the current user has admin privileges.',
		status: 'todo',
		priority: 'high',
		labels: [{ id: 'l1', name: 'CRUD', color: 'hsl(var(--li-label-crud))' }],
		parentTitle: 'Create post-login queries',
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [makeActivity({ type: 'created', createdAt: '2025-02-02T10:00:00Z' })],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '5',
		identifier: 'AIO-22',
		title: 'Create user dropdown menu',
		description:
			'Build the user avatar dropdown with profile link, settings, and logout action.',
		status: 'todo',
		priority: 'medium',
		labels: [{ id: 'l1', name: 'CRUD', color: 'hsl(var(--li-label-crud))' }],
		parentTitle: 'Create post-login queries',
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [makeActivity({ type: 'created', createdAt: '2025-02-02T10:30:00Z' })],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '6',
		identifier: 'AIO-15',
		title: 'Allow registering with email and password',
		description:
			'Implement the registration flow with email/password, including validation, hashing, and welcome email.',
		status: 'todo',
		priority: 'medium',
		labels: [],
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [makeActivity({ type: 'created', createdAt: '2025-01-30T14:00:00Z' })],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '7',
		identifier: 'AIO-28',
		title: 'Allow account deletion',
		status: 'todo',
		priority: 'low',
		labels: [{ id: 'l3', name: 'Feature', color: 'hsl(var(--li-label-feature))' }],
		parentTitle: 'Allow update user profile + deletion',
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [makeActivity({ type: 'created', createdAt: '2025-02-03T16:00:00Z' })],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '8',
		identifier: 'AIO-27',
		title: 'Allow password change',
		description:
			'Add password change form with current password verification and strength requirements.',
		status: 'todo',
		priority: 'low',
		labels: [{ id: 'l3', name: 'Feature', color: 'hsl(var(--li-label-feature))' }],
		parentTitle: 'Allow update user profile + deletion',
		projectName: 'Roll your own authentication',
		activity: [makeActivity({ type: 'created', createdAt: '2025-02-03T15:00:00Z' })],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '9',
		identifier: 'AIO-24',
		title: 'Create dashboard/profile route',
		description:
			'Set up the authenticated dashboard route with user profile display and edit capabilities.',
		status: 'todo',
		priority: 'low',
		labels: [{ id: 'l2', name: 'Database', color: 'hsl(var(--li-label-database))' }],
		projectName: 'Roll your own authentication',
		assigneeId: 'user-1',
		assigneeName: 'ryoa',
		activity: [
			makeActivity({ type: 'created', createdAt: '2025-02-02T11:00:00Z' }),
			makeActivity({ type: 'description_changed', createdAt: '2025-02-04T09:00:00Z' })
		],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	}
]

export function createMockIssueService(): IssueService {
	let issues = [...MOCK_ISSUES]

	return {
		async list(filters?: IssueFilters): Promise<PaginatedResult<Issue>> {
			let result = [...issues]

			if (filters?.status?.length) {
				result = result.filter((i) => filters.status!.includes(i.status))
			}
			if (filters?.priority?.length) {
				result = result.filter((i) => filters.priority!.includes(i.priority))
			}
			if (filters?.search) {
				const q = filters.search.toLowerCase()
				result = result.filter((i) => i.title.toLowerCase().includes(q))
			}

			return {
				data: result,
				total: result.length,
				page: 1,
				pageSize: result.length,
				hasMore: false
			}
		},

		async getById(id: string) {
			return issues.find((i) => i.id === id) ?? null
		},

		async create(input: CreateIssueInput) {
			const issue: Issue = {
				id: crypto.randomUUID(),
				identifier: `AIO-${issues.length + 10}`,
				title: input.title,
				status: input.status ?? 'todo',
				priority: input.priority ?? 'none',
				labels: [],
				assigneeId: 'user-1',
				assigneeName: 'ryoa',
				activity: [makeActivity({ type: 'created' })],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}
			issues.push(issue)
			return issue
		},

		async update(id: string, input: UpdateIssueInput) {
			const idx = issues.findIndex((i) => i.id === id)
			if (idx === -1) throw new Error(`Issue ${id} not found`)

			const old = issues[idx]
			const events: ActivityEvent[] = []

			if (input.status && input.status !== old.status) {
				events.push(
					makeActivity({
						type: 'status_change',
						field: 'status',
						from: old.status,
						to: input.status
					})
				)
			}
			if (input.priority && input.priority !== old.priority) {
				events.push(
					makeActivity({
						type: 'priority_change',
						field: 'priority',
						from: old.priority,
						to: input.priority
					})
				)
			}
			if (input.title && input.title !== old.title) {
				events.push(
					makeActivity({
						type: 'updated',
						field: 'title',
						from: old.title,
						to: input.title
					})
				)
			}

			issues[idx] = {
				...old,
				...input,
				activity: [...(old.activity ?? []), ...events],
				updatedAt: new Date().toISOString()
			}
			return issues[idx]
		},

		async destroy(id: string) {
			issues = issues.filter((i) => i.id !== id)
		}
	}
}
