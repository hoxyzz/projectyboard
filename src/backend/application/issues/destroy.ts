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

// ============================================================================
// Use Case Class (for container DI)
// ============================================================================

export class DestroyIssueUseCase {
	private issueRepo: IssueRepository

	constructor(issueRepo: IssueRepository) {
		this.issueRepo = issueRepo
	}

	async execute(id: string): Promise<{
		success: boolean
		error?: string
	}> {
		const result = await destroyIssue({ issues: this.issueRepo }, id)

		if (!result.success) {
			return { success: false, error: 'Issue not found' }
		}

		return { success: true }
	}
}
