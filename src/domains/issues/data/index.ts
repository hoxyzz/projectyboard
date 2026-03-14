import type { IssueData } from '../types'

import { createMockIssueData } from './issues.mock'

let issueData: IssueData | null = null

export function getIssueData(): IssueData {
	if (!issueData) issueData = createMockIssueData()
	return issueData
}

export function resetIssueData() {
	issueData = null
}
