/**
 * Mock Issue Repository Adapter.
 * In-memory implementation for development and testing.
 */

import type { ActivityEvent, Issue, IssueLabel, IssueStatus, PaginatedResult, Priority } from '@/backend/core/issues/entities'
import { formatIssueIdentifier } from '@/backend/core/issues/identifier'
import type { CreateIssueInput, IssueFilters, IssueRepository, UpdateIssueInput } from '@/backend/ports/issue-repository'

export type MockIssueState = {
	issues: Issue[]
	identifierCounters: Record<string, number>
}

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

const DEFAULT_LABELS: IssueLabel[] = [
	{ id: 'l1', name: 'CRUD', color: 'hsl(var(--li-label-crud))' },
	{ id: 'l2', name: 'Database', color: 'hsl(var(--li-label-database))' },
	{ id: 'l3', name: 'Feature', color: 'hsl(var(--li-label-feature))' },
	{ id: 'l4', name: 'Bug', color: 'hsl(var(--li-dot-red))' }
]

const DEFAULT_ISSUES: Issue[] = [
	{
		id: '1',
		identifier: 'AIO-19',
		title: 'Create post-login queries',
		description:
			'Implement all the queries needed after a user logs in, including session validation, profile fetching, and permission checks.',
		status: 'in_progress',
		priority: 'urgent',
		labels: [DEFAULT_LABELS[0]],
		subIssues: { done: 0, total: 3 },
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
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
			'Build the core authentication query layer: login, register, token refresh, and logout mutations.',
		status: 'in_progress',
		priority: 'urgent',
		labels: [],
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
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
		labels: [DEFAULT_LABELS[1]],
		subIssues: { done: 0, total: 3 },
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
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
		labels: [DEFAULT_LABELS[0]],
		parentTitle: 'Create post-login queries',
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
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
		labels: [DEFAULT_LABELS[0]],
		parentTitle: 'Create post-login queries',
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
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
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
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
		labels: [DEFAULT_LABELS[2]],
		parentTitle: 'Allow update user profile + deletion',
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
		activity: [makeActivity({ type: 'created', createdAt: '2025-02-03T16:00:00Z' })],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	},
	{
		id: '8',
		identifier: 'AIO-27',
		title: 'Allow password change',
		description: 'Add password change form with current password verification and strength requirements.',
		status: 'todo',
		priority: 'low',
		labels: [DEFAULT_LABELS[2]],
		parentTitle: 'Allow update user profile + deletion',
		projectId: 'proj-1',
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
		labels: [DEFAULT_LABELS[1]],
		projectId: 'proj-1',
		projectName: 'Roll your own authentication',
		activity: [
			makeActivity({ type: 'created', createdAt: '2025-02-02T11:00:00Z' }),
			makeActivity({ type: 'description_changed', createdAt: '2025-02-04T09:00:00Z' })
		],
		createdAt: '2025-02-01',
		updatedAt: '2025-02-10'
	}
]

function cloneIssueState(): MockIssueState {
	return {
		issues: DEFAULT_ISSUES.map((issue) => ({
			...issue,
			labels: issue.labels.map((label) => ({ ...label })),
			activity: issue.activity?.map((event) => ({ ...event }))
		})),
		identifierCounters: { AIO: 28, GRW: 0, ISS: 0 }
	}
}

let state = cloneIssueState()

export function getNextIdentifierCounter(projectKey: string): number {
	const next = (state.identifierCounters[projectKey] ?? 0) + 1
	state.identifierCounters[projectKey] = next
	return next
}

export function createMockIssueRepository(
	getLabels: () => IssueLabel[],
	getProjects: () => Array<{ id: string; name: string; key: string }>
): IssueRepository {
	return {
		async list(filters?: IssueFilters): Promise<PaginatedResult<Issue>> {
			let result = [...state.issues]

			if (filters?.status?.length) {
				result = result.filter((issue) => filters.status!.includes(issue.status))
			}
			if (filters?.priority?.length) {
				result = result.filter((issue) => filters.priority!.includes(issue.priority))
			}
			if (filters?.search) {
				const query = filters.search.toLowerCase()
				result = result.filter(
					(issue) =>
						issue.title.toLowerCase().includes(query) ||
						issue.identifier.toLowerCase().includes(query)
				)
			}
			if (filters?.projectId) {
				result = result.filter((issue) => issue.projectId === filters.projectId)
			}
			if (filters?.labelIds?.length) {
				result = result.filter((issue) =>
					issue.labels.some((label) => filters.labelIds!.includes(label.id))
				)
			}

			return {
				data: result,
				total: result.length,
				page: 1,
				pageSize: result.length,
				hasMore: false
			}
		},

		async getById(id: string): Promise<Issue | null> {
			return state.issues.find((issue) => issue.id === id) ?? null
		},

		async create(input: CreateIssueInput): Promise<Issue> {
			const projects = getProjects()
			const labels = getLabels()
			const project = input.projectId ? projects.find((p) => p.id === input.projectId) : null
			const resolvedLabels = input.labelIds
				? labels.filter((l) => input.labelIds!.includes(l.id))
				: []

			const projectKey = project?.key ?? 'ISS'
			const counter = getNextIdentifierCounter(projectKey)
			const now = new Date().toISOString()

			const issue: Issue = {
				id: crypto.randomUUID(),
				identifier: formatIssueIdentifier(projectKey, counter),
				title: input.title,
				description: input.description,
				status: input.status ?? 'todo',
				priority: input.priority ?? 'none',
				labels: resolvedLabels,
				parentId: input.parentId,
				projectId: project?.id,
				projectName: project?.name,
				activity: [makeActivity({ type: 'created', createdAt: now })],
				createdAt: now,
				updatedAt: now
			}

			state.issues = [...state.issues, issue]
			return issue
		},

		async update(id: string, input: UpdateIssueInput): Promise<Issue> {
			const index = state.issues.findIndex((issue) => issue.id === id)
			if (index === -1) throw new Error(`Issue ${id} not found`)

			const projects = getProjects()
			const labels = getLabels()
			const oldIssue = state.issues[index]
			const project = input.projectId !== undefined
				? (input.projectId ? projects.find((p) => p.id === input.projectId) : null)
				: (oldIssue.projectId ? projects.find((p) => p.id === oldIssue.projectId) : null)
			const resolvedLabels = input.labelIds !== undefined
				? labels.filter((l) => input.labelIds!.includes(l.id))
				: oldIssue.labels

			const updatedIssue: Issue = {
				...oldIssue,
				title: input.title ?? oldIssue.title,
				description: input.description !== undefined ? (input.description ?? undefined) : oldIssue.description,
				status: input.status ?? oldIssue.status,
				priority: input.priority ?? oldIssue.priority,
				labels: resolvedLabels,
				projectId: project?.id,
				projectName: project?.name,
				updatedAt: new Date().toISOString()
			}

			state.issues = state.issues.map((issue) => (issue.id === id ? updatedIssue : issue))
			return updatedIssue
		},

		async delete(id: string): Promise<void> {
			state.issues = state.issues.filter((issue) => issue.id !== id)
		}
	}
}

export function resetMockIssueState(): void {
	state = cloneIssueState()
}

export function getMockIssueState(): MockIssueState {
	return state
}
