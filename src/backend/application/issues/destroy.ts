/**
 * Destroy Issue Use Case.
 */

import type { IssueRepository } from '@/backend/ports/issue-repository'

export type DestroyIssueDeps = {
	issues: IssueRepository
}

export type DestroyIssueResult =
	| { success: true }
	| { success: false; notFound: true }

export async function destroyIssue(
	deps: DestroyIssueDeps,
	id: string
): Promise<DestroyIssueResult> {
	const issue = await deps.issues.getById(id)
	if (!issue) {
		return { success: false, notFound: true }
	}

	await deps.issues.delete(id)
	return { success: true }
}
