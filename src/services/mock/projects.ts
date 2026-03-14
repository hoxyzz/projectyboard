import type { Project, ProjectService } from '../types'

const MOCK_PROJECTS: Project[] = [{ id: 'proj-1', name: 'Roll your own authentication' }]

export function createMockProjectService(): ProjectService {
	return {
		async list() {
			return MOCK_PROJECTS
		},
		async getById(id: string) {
			return MOCK_PROJECTS.find((p) => p.id === id) ?? null
		}
	}
}
