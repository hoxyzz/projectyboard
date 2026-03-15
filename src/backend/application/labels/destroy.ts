/**
 * Destroy Label Use Case.
 * When a label is deleted, it is removed from all issues.
 */

import { createLabelRemovedActivity, type ActivityContext } from '@/backend/core/issues/activity'
import type { IssueRepository } from '@/backend/ports/issue-repository'
import type { LabelRepository } from '@/backend/ports/label-repository'

export type DestroyLabelDeps = {
	labels: LabelRepository
	issues: IssueRepository
	activityContext: ActivityContext
}

export type DestroyLabelResult =
	| { success: true }
	| { success: false; notFound: true }

export async function destroyLabel(
	deps: DestroyLabelDeps,
	id: string
): Promise<DestroyLabelResult> {
	const label = await deps.labels.getById(id)
	if (!label) {
		return { success: false, notFound: true }
	}

	// Get all issues that have this label
	const issuesResult = await deps.issues.list({ labelIds: [id] })

	// Remove label from issues
	for (const issue of issuesResult.data) {
		const remainingLabelIds = issue.labels
			.filter((l) => l.id !== id)
			.map((l) => l.id)
		await deps.issues.update(issue.id, { labelIds: remainingLabelIds })
	}

	// Delete the label
	await deps.labels.delete(id)

	return { success: true }
}
