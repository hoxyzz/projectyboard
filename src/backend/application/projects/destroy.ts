/**
 * Destroy Project Use Case.
 * When a project is deleted, existing issues become unassigned from the project.
 */

import { createActivityEvent, type ActivityContext } from '@/backend/core/issues/activity'
import type { IssueRepository } from '@/backend/ports/issue-repository'
import type { ProjectRepository } from '@/backend/ports/project-repository'

export type DestroyProjectDeps = {
	projects: ProjectRepository
	issues: IssueRepository
	activityContext: ActivityContext
}

export type DestroyProjectResult =
	| { success: true }
	| { success: false; notFound: true }

export async function destroyProject(
	deps: DestroyProjectDeps,
	id: string
): Promise<DestroyProjectResult> {
	const project = await deps.projects.getById(id)
	if (!project) {
		return { success: false, notFound: true }
	}

	// Get all issues that belong to this project
	const issuesResult = await deps.issues.list({ projectId: id })

	// Unassign issues from the project and add activity
	for (const issue of issuesResult.data) {
		await deps.issues.update(issue.id, { projectId: null })
		// Note: In a real implementation, activity would be handled by the repository
	}

	// Delete the project
	await deps.projects.delete(id)

	return { success: true }
}
