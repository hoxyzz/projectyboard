import type { PaginatedResult } from '@/shared/types'

import type {
	ActivityEvent,
	CreateIssueInput,
	CreateIssueLabelInput,
	CreateIssueProjectInput,
	Issue,
	IssueFilters,
	IssueLabel,
	IssueLabelRepository,
	IssueProject,
	IssueProjectRepository,
	IssueRepository,
	UpdateIssueInput
} from '../types'

type MockIssueState = {
	issues: Issue[]
	projects: IssueProject[]
	labels: IssueLabel[]
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

const DEFAULT_PROJECTS: IssueProject[] = [
	{
		id: 'proj-1',
		name: 'Roll your own authentication',
		key: 'AIO',
		color: 'hsl(var(--li-dot-blue))'
	},
	{
		id: 'proj-2',
		name: 'Growth experiments',
		key: 'GRW',
		color: 'hsl(var(--li-dot-green))'
	}
]

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

function cloneState(): MockIssueState {
	return {
		issues: DEFAULT_ISSUES.map((issue) => ({
			...issue,
			labels: issue.labels.map((label) => ({ ...label })),
			activity: issue.activity?.map((event) => ({ ...event }))
		})),
		projects: DEFAULT_PROJECTS.map((project) => ({ ...project })),
		labels: DEFAULT_LABELS.map((label) => ({ ...label })),
		identifierCounters: { AIO: 28, GRW: 0, ISS: 0 }
	}
}

let state = cloneState()

function resolveLabels(labelIds?: string[]) {
	if (!labelIds?.length) return []
	return state.labels.filter((label) => labelIds.includes(label.id))
}

function resolveProject(projectId?: string | null) {
	if (!projectId) return null
	return state.projects.find((project) => project.id === projectId) ?? null
}

function nextIdentifier(projectKey: string) {
	const next = (state.identifierCounters[projectKey] ?? 0) + 1
	state.identifierCounters[projectKey] = next
	return `${projectKey}-${next}`
}

function buildProjectKey(name: string, preferredKey?: string) {
	const normalizedPreferred = preferredKey?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
	if (normalizedPreferred) return normalizedPreferred.slice(0, 5)

	const initials = name
		.trim()
		.split(/\s+/)
		.map((part) => part[0])
		.join('')
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '')

	return (initials || 'PRJ').slice(0, 5)
}

function mergeProjectFields(issue: Issue, project: IssueProject | null) {
	return {
		...issue,
		projectId: project?.id,
		projectName: project?.name
	}
}

function buildActivity(oldIssue: Issue, input: UpdateIssueInput, nextLabels: IssueLabel[]) {
	const events: ActivityEvent[] = []

	if (input.status && input.status !== oldIssue.status) {
		events.push(
			makeActivity({
				type: 'status_change',
				field: 'status',
				from: oldIssue.status,
				to: input.status
			})
		)
	}

	if (input.priority && input.priority !== oldIssue.priority) {
		events.push(
			makeActivity({
				type: 'priority_change',
				field: 'priority',
				from: oldIssue.priority,
				to: input.priority
			})
		)
	}

	if (input.title && input.title !== oldIssue.title) {
		events.push(
			makeActivity({
				type: 'updated',
				field: 'title',
				from: oldIssue.title,
				to: input.title
			})
		)
	}

	if (input.description !== undefined && (input.description ?? '') !== (oldIssue.description ?? '')) {
		events.push(makeActivity({ type: 'description_changed' }))
	}

	if (input.projectId !== undefined) {
		const previousProject = resolveProject(oldIssue.projectId)
		const nextProject = resolveProject(input.projectId)
		if (previousProject?.id !== nextProject?.id) {
			events.push(
				makeActivity({
					type: 'updated',
					field: 'project',
					from: previousProject?.name,
					to: nextProject?.name ?? 'No project'
				})
			)
		}
	}

	if (input.labelIds) {
		const oldIds = new Set(oldIssue.labels.map((label) => label.id))
		const nextIds = new Set(nextLabels.map((label) => label.id))
		for (const label of oldIssue.labels) {
			if (!nextIds.has(label.id)) {
				events.push(makeActivity({ type: 'label_removed', from: label.name }))
			}
		}
		for (const label of nextLabels) {
			if (!oldIds.has(label.id)) {
				events.push(makeActivity({ type: 'label_added', to: label.name }))
			}
		}
	}

	return events
}

export function createMockIssueRepository(): IssueRepository {
	return {
		async list(filters?: IssueFilters): Promise<PaginatedResult<Issue>> {
			let result = [...state.issues]

			if (filters?.status?.length) result = result.filter((issue) => filters.status!.includes(issue.status))
			if (filters?.priority?.length) result = result.filter((issue) => filters.priority!.includes(issue.priority))
			if (filters?.search) {
				const query = filters.search.toLowerCase()
				result = result.filter(
					(issue) =>
						issue.title.toLowerCase().includes(query) ||
						issue.identifier.toLowerCase().includes(query)
				)
			}
			if (filters?.projectId) result = result.filter((issue) => issue.projectId === filters.projectId)
			return {
				data: result,
				total: result.length,
				page: 1,
				pageSize: result.length,
				hasMore: false
			}
		},

		async getById(id: string) {
			return state.issues.find((issue) => issue.id === id) ?? null
		},

		async create(input: CreateIssueInput) {
			const project = resolveProject(input.projectId)
			const labels = resolveLabels(input.labelIds)
			const now = new Date().toISOString()
			const issue: Issue = {
				id: crypto.randomUUID(),
				identifier: nextIdentifier(project?.key ?? 'ISS'),
				title: input.title,
				description: input.description?.trim() || undefined,
				status: input.status ?? 'todo',
				priority: input.priority ?? 'none',
				labels,
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

		async update(id: string, input: UpdateIssueInput) {
			const index = state.issues.findIndex((issue) => issue.id === id)
			if (index === -1) throw new Error(`Issue ${id} not found`)

			const oldIssue = state.issues[index]
			const project = input.projectId !== undefined ? resolveProject(input.projectId) : resolveProject(oldIssue.projectId)
			const labels = input.labelIds ? resolveLabels(input.labelIds) : oldIssue.labels
			const events = buildActivity(oldIssue, input, labels)
			const nextIssue = mergeProjectFields(
				{
					...oldIssue,
					...input,
					description:
						input.description === undefined
							? oldIssue.description
							: input.description?.trim() || undefined,
					labels,
					activity: [...(oldIssue.activity ?? []), ...events],
					updatedAt: new Date().toISOString()
				},
				project
			)

			state.issues = state.issues.map((issue) => (issue.id === id ? nextIssue : issue))
			return nextIssue
		},

		async destroy(id: string) {
			state.issues = state.issues.filter((issue) => issue.id !== id)
		}
	}
}

export function createMockIssueProjectRepository(): IssueProjectRepository {
	return {
		async listProjects() {
			return [...state.projects]
		},

		async createProject(input: CreateIssueProjectInput) {
			const key = buildProjectKey(input.name, input.key)
			let uniqueKey = key
			let suffix = 2
			while (state.projects.some((project) => project.key === uniqueKey)) {
				uniqueKey = `${key.slice(0, 4)}${suffix}`
				suffix += 1
			}

			const project: IssueProject = {
				id: crypto.randomUUID(),
				name: input.name.trim(),
				key: uniqueKey,
				color: input.color
			}
			state.projects = [...state.projects, project]
			if (!(uniqueKey in state.identifierCounters)) state.identifierCounters[uniqueKey] = 0
			return project
		},

		async deleteProject(id: string) {
			const removedProject = state.projects.find((project) => project.id === id)
			state.projects = state.projects.filter((project) => project.id !== id)
			if (!removedProject) return

			state.issues = state.issues.map((issue) => {
				if (issue.projectId !== id) return issue
				return {
					...issue,
					projectId: undefined,
					projectName: undefined,
					activity: [
						...(issue.activity ?? []),
						makeActivity({
							type: 'updated',
							field: 'project',
							from: removedProject.name,
							to: 'No project'
						})
					],
					updatedAt: new Date().toISOString()
				}
			})
		}
	}
}

export function createMockIssueLabelRepository(): IssueLabelRepository {
	return {
		async listLabels() {
			return [...state.labels]
		},

		async createLabel(input: CreateIssueLabelInput) {
			const label: IssueLabel = {
				id: crypto.randomUUID(),
				name: input.name.trim(),
				color: input.color
			}
			state.labels = [...state.labels, label]
			return label
		},

		async deleteLabel(id: string) {
			const removedLabel = state.labels.find((label) => label.id === id)
			state.labels = state.labels.filter((label) => label.id !== id)
			if (!removedLabel) return

			state.issues = state.issues.map((issue) => {
				if (!issue.labels.some((label) => label.id === id)) return issue
				return {
					...issue,
					labels: issue.labels.filter((label) => label.id !== id),
					activity: [
						...(issue.activity ?? []),
						makeActivity({ type: 'label_removed', from: removedLabel.name })
					],
					updatedAt: new Date().toISOString()
				}
			})
		}
	}
}

export function resetMockIssueState() {
	state = cloneState()
}
