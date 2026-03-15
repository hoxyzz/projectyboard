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

import {
	createServerIssueRepository,
	createServerLabelRepository,
	createServerProjectRepository
} from './issues.server'

// Use database backend when DATABASE_URL is available
const USE_SERVER = typeof process !== 'undefined' && !!process.env.DATABASE_URL

let issueRepository: IssueRepository | null = null
let issueProjectRepository: IssueProjectRepository | null = null
let issueLabelRepository: IssueLabelRepository | null = null

export function getIssueRepository(): IssueRepository {
	if (!issueRepository) {
		issueRepository = USE_SERVER
			? createServerIssueRepository()
			: createMockIssueRepository()
	}
	return issueRepository
}

export function getIssueProjectRepository(): IssueProjectRepository {
	if (!issueProjectRepository) {
		issueProjectRepository = USE_SERVER
			? createServerProjectRepository()
			: createMockIssueProjectRepository()
	}
	return issueProjectRepository
}

export function getIssueLabelRepository(): IssueLabelRepository {
	if (!issueLabelRepository) {
		issueLabelRepository = USE_SERVER
			? createServerLabelRepository()
			: createMockIssueLabelRepository()
	}
	return issueLabelRepository
}

export function resetIssueData() {
	issueRepository = null
	issueProjectRepository = null
	issueLabelRepository = null
	resetMockIssueState()
}

