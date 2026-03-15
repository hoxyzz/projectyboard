/**
 * Create Issue Use Case.
 */

import { createCreatedActivity, type ActivityContext } from '@/backend/core/issues/activity'
import type { Issue, IssueLabel, IssueStatus, Priority } from '@/backend/core/issues/entities'
import { formatIssueIdentifier } from '@/backend/core/issues/identifier'
import { combineValidationResults, validateDescription, validatePriority, validateStatus, validateTitle, type ValidationResult } from '@/backend/core/issues/rules'
import type { IssueRepository } from '@/backend/ports/issue-repository'
import type { LabelRepository } from '@/backend/ports/label-repository'
import type { ProjectRepository } from '@/backend/ports/project-repository'

export type CreateIssueCommand = {
	title: string
	description?: string
	status?: IssueStatus
	priority?: Priority
	labelIds?: string[]
	projectId?: string | null
	parentId?: string
}

export type CreateIssueDeps = {
	issues: IssueRepository
	projects: ProjectRepository
	labels: LabelRepository
	getNextIdentifierCounter: (projectKey: string) => Promise<number>
	activityContext: ActivityContext
}

export type CreateIssueResult =
	| { success: true; issue: Issue }
	| { success: false; validation: ValidationResult }

export async function createIssue(
	deps: CreateIssueDeps,
	command: CreateIssueCommand
): Promise<CreateIssueResult> {
	// 1. Validate input
	const validation = combineValidationResults(
		validateTitle(command.title),
		validateDescription(command.description),
		validateStatus(command.status),
		validatePriority(command.priority)
	)

	if (!validation.valid) {
		return { success: false, validation }
	}

	// 2. Resolve project if provided
	let project = null
	if (command.projectId) {
		project = await deps.projects.getById(command.projectId)
		if (!project) {
			return {
				success: false,
				validation: {
					valid: false,
					errors: [{ field: 'projectId', message: 'Project not found' }]
				}
			}
		}
	}

	// 3. Resolve labels
	let labels: IssueLabel[] = []
	if (command.labelIds?.length) {
		labels = await deps.labels.getByIds(command.labelIds)
	}

	// 4. Generate identifier
	const projectKey = project?.key ?? 'ISS'
	const counter = await deps.getNextIdentifierCounter(projectKey)
	const identifier = formatIssueIdentifier(projectKey, counter)

	// 5. Create activity
	const activity = [createCreatedActivity(deps.activityContext)]

	// 6. Persist issue
	const now = new Date().toISOString()
	const issue = await deps.issues.create({
		title: command.title.trim(),
		description: command.description?.trim() || undefined,
		status: command.status ?? 'todo',
		priority: command.priority ?? 'none',
		labelIds: labels.map((l) => l.id),
		projectId: project?.id ?? null,
		parentId: command.parentId
	})

	// Return with resolved relations
	return {
		success: true,
		issue: {
			...issue,
			identifier,
			labels,
			projectId: project?.id,
			projectName: project?.name,
			activity,
			createdAt: now,
			updatedAt: now
		}
	}
}

// ============================================================================
// Use Case Class (for container DI)
// ============================================================================

export class CreateIssueUseCase {
	private issueRepo: IssueRepository
	private projectRepo: ProjectRepository
	private labelRepo: LabelRepository
	private identifierCounter = 1

	constructor(
		issueRepo: IssueRepository,
		projectRepo: ProjectRepository,
		labelRepo: LabelRepository
	) {
		this.issueRepo = issueRepo
		this.projectRepo = projectRepo
		this.labelRepo = labelRepo
	}

	async execute(command: CreateIssueCommand): Promise<{
		success: boolean
		data?: Issue
		error?: string
	}> {
		const result = await createIssue(
			{
				issues: this.issueRepo,
				projects: this.projectRepo,
				labels: this.labelRepo,
				getNextIdentifierCounter: async () => this.identifierCounter++,
				activityContext: {
					userId: 'system',
					userName: 'System'
				}
			},
			command
		)

		if (!result.success) {
			return {
				success: false,
				error: result.validation.errors.map((e) => e.message).join(', ')
			}
		}

		return { success: true, data: result.issue }
	}
}
