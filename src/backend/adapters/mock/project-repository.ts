/**
 * Mock Project Repository Adapter.
 * In-memory implementation for development and testing.
 */

import type { Project } from '@/backend/core/projects/entities'
import { generateUniqueProjectKey } from '@/backend/core/issues/identifier'
import type { CreateProjectInput, ProjectRepository } from '@/backend/ports/project-repository'
import { getMockIssueState } from './issue-repository'

const DEFAULT_PROJECTS: Project[] = [
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

let projects: Project[] = [...DEFAULT_PROJECTS]

export function createMockProjectRepository(): ProjectRepository {
	return {
		async list(): Promise<Project[]> {
			return [...projects]
		},

		async getById(id: string): Promise<Project | null> {
			return projects.find((p) => p.id === id) ?? null
		},

		async getByKey(key: string): Promise<Project | null> {
			return projects.find((p) => p.key === key) ?? null
		},

		async getAllKeys(): Promise<string[]> {
			return projects.map((p) => p.key)
		},

		async create(input: CreateProjectInput): Promise<Project> {
			const existingKeys = projects.map((p) => p.key)
			const key = generateUniqueProjectKey(input.name, input.key, existingKeys)

			const project: Project = {
				id: crypto.randomUUID(),
				name: input.name,
				key,
				color: input.color
			}

			projects = [...projects, project]

			// Initialize counter for new project
			const state = getMockIssueState()
			if (!(key in state.identifierCounters)) {
				state.identifierCounters[key] = 0
			}

			return project
		},

		async delete(id: string): Promise<void> {
			projects = projects.filter((p) => p.id !== id)
		}
	}
}

export function resetMockProjectState(): void {
	projects = [...DEFAULT_PROJECTS]
}

export function getMockProjects(): Project[] {
	return projects
}
