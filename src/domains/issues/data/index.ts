import type {
	IssueLabelRepository,
	IssueProjectRepository,
	IssueRepository
} from '../types'

import {
	createMockIssueLabelRepository,
	createMockIssueProjectRepository,
	createMockIssueRepository,
	resetMockIssueState
} from './issues.mock'

let issueRepository: IssueRepository | null = null
let issueProjectRepository: IssueProjectRepository | null = null
let issueLabelRepository: IssueLabelRepository | null = null

export function getIssueRepository(): IssueRepository {
	if (!issueRepository) issueRepository = createMockIssueRepository()
	return issueRepository
}

export function getIssueProjectRepository(): IssueProjectRepository {
	if (!issueProjectRepository) issueProjectRepository = createMockIssueProjectRepository()
	return issueProjectRepository
}

export function getIssueLabelRepository(): IssueLabelRepository {
	if (!issueLabelRepository) issueLabelRepository = createMockIssueLabelRepository()
	return issueLabelRepository
}

export function resetIssueData() {
	issueRepository = null
	issueProjectRepository = null
	issueLabelRepository = null
	resetMockIssueState()
}

