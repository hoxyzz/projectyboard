import type {
	NotificationService,
	ProjectService,
	TeamService,
	UserService
} from './types'

import { createMockNotificationService } from './mock/notifications'
import { createMockProjectService } from './mock/projects'
import { createMockTeamService } from './mock/teams'
import { createMockUserService } from './mock/user'

let notificationService: NotificationService | null = null
let userService: UserService | null = null
let teamService: TeamService | null = null
let projectService: ProjectService | null = null

export function getNotificationService(): NotificationService {
	if (!notificationService) notificationService = createMockNotificationService()
	return notificationService
}

export function getUserService(): UserService {
	if (!userService) userService = createMockUserService()
	return userService
}

export function getTeamService(): TeamService {
	if (!teamService) teamService = createMockTeamService()
	return teamService
}

export function getProjectService(): ProjectService {
	if (!projectService) projectService = createMockProjectService()
	return projectService
}

export function resetServices() {
	notificationService = null
	userService = null
	teamService = null
	projectService = null
}

// Re-export types for convenience
export type {
	NotificationService,
	UserService,
	TeamService,
	ProjectService,
	Project,
	Team,
	User,
	Notification
} from './types'
