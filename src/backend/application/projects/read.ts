/**
 * Read Project Use Cases.
 */

import type { Project } from '@/backend/core/projects/entities'
import type { ProjectRepository } from '@/backend/ports/project-repository'

export type ReadProjectsDeps = {
	projects: ProjectRepository
}

export async function readProjects(
	deps: ReadProjectsDeps
): Promise<Project[]> {
	return deps.projects.list()
}

export async function readProjectById(
	deps: ReadProjectsDeps,
	id: string
): Promise<Project | null> {
	return deps.projects.getById(id)
}
