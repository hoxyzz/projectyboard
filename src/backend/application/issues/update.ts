/**
 * Update Issue Use Case.
 */

import { buildUpdateActivity, type ActivityContext } from '@/backend/core/issues/activity'
import type { Issue, IssueLabel, IssueStatus, Priority } from '@/backend/core/issues/entities'
import { combineValidationResults, validateDescription, validatePriority, validateStatus, validateTitle, type ValidationResult } from '@/backend/core/issues/rules'
import type { IssueRepository, UpdateIssueInput } from '@/backend/ports/issue-repository'
import type { LabelRepository } from '@/backend/ports/label-repository'
import type { ProjectRepository } from '@/backend/ports/project-repository'

export type UpdateIssueCommand = {
	title?: string
	description?: string | null
	status?: IssueStatus
	priority?: Priority
	labelIds?: string[]
	projectId?: string | null
}

export type UpdateIssueDeps = {
	issues: IssueRepository
	projects: ProjectRepository
	labels: LabelRepository
	activityContext: ActivityContext
}

export type UpdateIssueResult =
	| { success: true; issue: Issue }
	| { success: false; validation: ValidationResult }
	| { success: false; notFound: true }

export async function updateIssue(
	deps: UpdateIssueDeps,
	id: string,
	command: UpdateIssueCommand
): Promise<UpdateIssueResult> {
	// 1. Load current issue
	const oldIssue = await deps.issues.getById(id)
	if (!oldIssue) {
		return { success: false, notFound: true }
	}

	// 2. Validate input
	const validations: ValidationResult[] = []
	if (command.title !== undefined) validations.push(validateTitle(command.title))
	if (command.description !== undefined) validations.push(validateDescription(command.description))
	if (command.status !== undefined) validations.push(validateStatus(command.status))
	if (command.priority !== undefined) validations.push(validatePriority(command.priority))

	const validation = combineValidationResults(...validations)
	if (!validation.valid) {
		return { success: false, validation }
	}

	// 3. Resolve project if changed
	let newProject = null
	let oldProject = null

	if (oldIssue.projectId) {
		oldProject = await deps.projects.getById(oldIssue.projectId)
	}

	if (command.projectId !== undefined) {
		if (command.projectId) {
			newProject = await deps.projects.getById(command.projectId)
			if (!newProject) {
				return {
					success: false,
					validation: {
						valid: false,
						errors: [{ field: 'projectId', message: 'Project not found' }]
					}
				}
			}
		}
	} else {
		newProject = oldProject
	}

	// 4. Resolve labels if changed
	let resolvedLabels: IssueLabel[] = oldIssue.labels
	if (command.labelIds !== undefined) {
		resolvedLabels = await deps.labels.getByIds(command.labelIds)
	}

	// 5. Build activity events
	const events = buildUpdateActivity(
		deps.activityContext,
		oldIssue,
		command,
		resolvedLabels,
		newProject,
		oldProject
	)

	// 6. Build update input
	const updateInput: UpdateIssueInput = {}
	if (command.title !== undefined) updateInput.title = command.title.trim()
	if (command.description !== undefined) updateInput.description = command.description?.trim() || null
	if (command.status !== undefined) updateInput.status = command.status
	if (command.priority !== undefined) updateInput.priority = command.priority
	if (command.labelIds !== undefined) updateInput.labelIds = resolvedLabels.map((l) => l.id)
	if (command.projectId !== undefined) updateInput.projectId = command.projectId

	// 7. Persist update
	const updatedIssue = await deps.issues.update(id, updateInput)

	// Return with resolved relations and activity
	return {
		success: true,
		issue: {
			...updatedIssue,
			labels: resolvedLabels,
			projectId: newProject?.id,
			projectName: newProject?.name,
			activity: [...(oldIssue.activity ?? []), ...events],
			updatedAt: new Date().toISOString()
		}
	}
}
