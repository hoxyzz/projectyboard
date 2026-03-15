/**
 * Project Repository Port.
 * Interface for persisting and retrieving projects.
 */

import type { Project } from '@/backend/core/projects/entities'

export type CreateProjectInput = {
	name: string
	key?: string
	color?: string
}

export interface ProjectRepository {
	list(): Promise<Project[]>
	getById(id: string): Promise<Project | null>
	getByKey(key: string): Promise<Project | null>
	create(input: CreateProjectInput): Promise<Project>
	delete(id: string): Promise<void>
	getAllKeys(): Promise<string[]>
}
