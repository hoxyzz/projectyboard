/**
 * Activity generation rules for Issues domain.
 * Determines when and how to create activity events.
 */

import type { ActivityEvent, Issue, IssueLabel, IssueProject, IssueStatus, Priority } from './entities'

export type ActivityContext = {
	userId: string
	userName: string
}

export function createActivityEvent(
	context: ActivityContext,
	overrides: Partial<ActivityEvent>
): ActivityEvent {
	return {
		id: crypto.randomUUID(),
		type: 'created',
		userId: context.userId,
		userName: context.userName,
		createdAt: new Date().toISOString(),
		...overrides
	}
}

export function createCreatedActivity(context: ActivityContext): ActivityEvent {
	return createActivityEvent(context, { type: 'created' })
}

export function createStatusChangeActivity(
	context: ActivityContext,
	from: IssueStatus,
	to: IssueStatus
): ActivityEvent {
	return createActivityEvent(context, {
		type: 'status_change',
		field: 'status',
		from,
		to
	})
}

export function createPriorityChangeActivity(
	context: ActivityContext,
	from: Priority,
	to: Priority
): ActivityEvent {
	return createActivityEvent(context, {
		type: 'priority_change',
		field: 'priority',
		from,
		to
	})
}

export function createTitleChangeActivity(
	context: ActivityContext,
	from: string,
	to: string
): ActivityEvent {
	return createActivityEvent(context, {
		type: 'updated',
		field: 'title',
		from,
		to
	})
}

export function createDescriptionChangeActivity(context: ActivityContext): ActivityEvent {
	return createActivityEvent(context, { type: 'description_changed' })
}

export function createProjectChangeActivity(
	context: ActivityContext,
	from: string | undefined,
	to: string | undefined
): ActivityEvent {
	return createActivityEvent(context, {
		type: 'updated',
		field: 'project',
		from: from ?? 'No project',
		to: to ?? 'No project'
	})
}

export function createLabelAddedActivity(context: ActivityContext, labelName: string): ActivityEvent {
	return createActivityEvent(context, {
		type: 'label_added',
		to: labelName
	})
}

export function createLabelRemovedActivity(context: ActivityContext, labelName: string): ActivityEvent {
	return createActivityEvent(context, {
		type: 'label_removed',
		from: labelName
	})
}

export type UpdateDiff = {
	title?: string
	description?: string | null
	status?: IssueStatus
	priority?: Priority
	projectId?: string | null
	labelIds?: string[]
}

/**
 * Builds activity events by comparing old issue state with new input.
 */
export function buildUpdateActivity(
	context: ActivityContext,
	oldIssue: Issue,
	input: UpdateDiff,
	resolvedLabels: IssueLabel[],
	resolvedProject: IssueProject | null,
	oldProject: IssueProject | null
): ActivityEvent[] {
	const events: ActivityEvent[] = []

	if (input.status !== undefined && input.status !== oldIssue.status) {
		events.push(createStatusChangeActivity(context, oldIssue.status, input.status))
	}

	if (input.priority !== undefined && input.priority !== oldIssue.priority) {
		events.push(createPriorityChangeActivity(context, oldIssue.priority, input.priority))
	}

	if (input.title !== undefined && input.title !== oldIssue.title) {
		events.push(createTitleChangeActivity(context, oldIssue.title, input.title))
	}

	if (input.description !== undefined) {
		const oldDesc = oldIssue.description ?? ''
		const newDesc = input.description ?? ''
		if (oldDesc !== newDesc) {
			events.push(createDescriptionChangeActivity(context))
		}
	}

	if (input.projectId !== undefined) {
		if (oldProject?.id !== resolvedProject?.id) {
			events.push(createProjectChangeActivity(context, oldProject?.name, resolvedProject?.name))
		}
	}

	if (input.labelIds !== undefined) {
		const oldIds = new Set(oldIssue.labels.map((l) => l.id))
		const newIds = new Set(resolvedLabels.map((l) => l.id))

		for (const label of oldIssue.labels) {
			if (!newIds.has(label.id)) {
				events.push(createLabelRemovedActivity(context, label.name))
			}
		}

		for (const label of resolvedLabels) {
			if (!oldIds.has(label.id)) {
				events.push(createLabelAddedActivity(context, label.name))
			}
		}
	}

	return events
}
