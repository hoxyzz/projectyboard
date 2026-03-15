/**
 * Create Project Use Case.
 */

import type { Project } from '@/backend/core/projects/entities'
import { validateProjectKey, validateProjectName, type ValidationResult } from '@/backend/core/projects/rules'
import { generateUniqueProjectKey } from '@/backend/core/issues/identifier'
import type { ProjectRepository } from '@/backend/ports/project-repository'

export type CreateProjectCommand = {
	name: string
	key?: string
	color?: string
}

export type CreateProjectDeps = {
	projects: ProjectRepository
}

export type CreateProjectResult =
	| { success: true; project: Project }
	| { success: false; validation: ValidationResult }

export async function createProject(
	deps: CreateProjectDeps,
	command: CreateProjectCommand
): Promise<CreateProjectResult> {
	// 1. Validate input
	const nameValidation = validateProjectName(command.name)
	if (!nameValidation.valid) {
		return { success: false, validation: nameValidation }
	}

	if (command.key) {
		const keyValidation = validateProjectKey(command.key.toUpperCase())
		if (!keyValidation.valid) {
			return { success: false, validation: keyValidation }
		}
	}

	// 2. Generate unique key
	const existingKeys = await deps.projects.getAllKeys()
	const key = generateUniqueProjectKey(command.name, command.key, existingKeys)

	// 3. Create project
	const project = await deps.projects.create({
		name: command.name.trim(),
		key,
		color: command.color
	})

	return { success: true, project }
}
