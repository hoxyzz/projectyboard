import type { PaginatedResult } from '@/shared/types'

import type {
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

export type ApiIssueDataConfig = {
	baseUrl: string
	getToken?: () => string | null
	headers?: Record<string, string>
}

function buildHeaders(config: ApiIssueDataConfig): HeadersInit {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...config.headers
	}
	const token = config.getToken?.()
	if (token) headers.Authorization = `Bearer ${token}`
	return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const body = await res.text().catch(() => '')
		throw new Error(`API error ${res.status}: ${body}`)
	}
	return res.json()
}

export function createApiIssueRepository(config: ApiIssueDataConfig): IssueRepository {
	const { baseUrl } = config

	return {
		async list(filters?: IssueFilters): Promise<PaginatedResult<Issue>> {
			const params = new URLSearchParams()
			if (filters?.status?.length) params.set('status', filters.status.join(','))
			if (filters?.priority?.length) params.set('priority', filters.priority.join(','))
			if (filters?.search) params.set('search', filters.search)
			if (filters?.projectId) params.set('projectId', filters.projectId)

			const queryString = params.toString()
			const res = await fetch(`${baseUrl}/issues${queryString ? `?${queryString}` : ''}`, {
				headers: buildHeaders(config)
			})
			return handleResponse<PaginatedResult<Issue>>(res)
		},

		async getById(id: string): Promise<Issue | null> {
			const res = await fetch(`${baseUrl}/issues/${id}`, {
				headers: buildHeaders(config)
			})
			if (res.status === 404) return null
			return handleResponse<Issue>(res)
		},

		async create(input: CreateIssueInput): Promise<Issue> {
			const res = await fetch(`${baseUrl}/issues`, {
				method: 'POST',
				headers: buildHeaders(config),
				body: JSON.stringify(input)
			})
			return handleResponse<Issue>(res)
		},

		async update(id: string, input: UpdateIssueInput): Promise<Issue> {
			const res = await fetch(`${baseUrl}/issues/${id}`, {
				method: 'PATCH',
				headers: buildHeaders(config),
				body: JSON.stringify(input)
			})
			return handleResponse<Issue>(res)
		},

		async destroy(id: string): Promise<void> {
			const res = await fetch(`${baseUrl}/issues/${id}`, {
				method: 'DELETE',
				headers: buildHeaders(config)
			})
			if (!res.ok) {
				const body = await res.text().catch(() => '')
				throw new Error(`API error ${res.status}: ${body}`)
			}
		}
	}
}

export function createApiIssueProjectRepository(
	config: ApiIssueDataConfig
): IssueProjectRepository {
	const { baseUrl } = config

	return {
		async listProjects(): Promise<IssueProject[]> {
			const res = await fetch(`${baseUrl}/issue-projects`, {
				headers: buildHeaders(config)
			})
			return handleResponse<IssueProject[]>(res)
		},

		async createProject(input: CreateIssueProjectInput): Promise<IssueProject> {
			const res = await fetch(`${baseUrl}/issue-projects`, {
				method: 'POST',
				headers: buildHeaders(config),
				body: JSON.stringify(input)
			})
			return handleResponse<IssueProject>(res)
		},

		async deleteProject(id: string): Promise<void> {
			const res = await fetch(`${baseUrl}/issue-projects/${id}`, {
				method: 'DELETE',
				headers: buildHeaders(config)
			})
			if (!res.ok) {
				const body = await res.text().catch(() => '')
				throw new Error(`API error ${res.status}: ${body}`)
			}
		}
	}
}

export function createApiIssueLabelRepository(
	config: ApiIssueDataConfig
): IssueLabelRepository {
	const { baseUrl } = config

	return {
		async listLabels(): Promise<IssueLabel[]> {
			const res = await fetch(`${baseUrl}/issue-labels`, {
				headers: buildHeaders(config)
			})
			return handleResponse<IssueLabel[]>(res)
		},

		async createLabel(input: CreateIssueLabelInput): Promise<IssueLabel> {
			const res = await fetch(`${baseUrl}/issue-labels`, {
				method: 'POST',
				headers: buildHeaders(config),
				body: JSON.stringify(input)
			})
			return handleResponse<IssueLabel>(res)
		},

		async deleteLabel(id: string): Promise<void> {
			const res = await fetch(`${baseUrl}/issue-labels/${id}`, {
				method: 'DELETE',
				headers: buildHeaders(config)
			})
			if (!res.ok) {
				const body = await res.text().catch(() => '')
				throw new Error(`API error ${res.status}: ${body}`)
			}
		}
	}
}
