/**
 * Service registry.
 * 
 * This is the single place where service implementations are resolved.
 * To swap from mock → real backend:
 *   1. Create a new implementation (e.g. src/services/api/issues.ts)
 *   2. Change the factory call here
 * 
 * Components never import from ./mock directly — they go through
 * hooks that call these getters.
 */

import type {
  IssueService,
  NotificationService,
  UserService,
  TeamService,
  ProjectService,
} from "./types";

import { createMockIssueService } from "./mock/issues";
import { createMockNotificationService } from "./mock/notifications";
import { createMockUserService } from "./mock/user";
import { createMockTeamService } from "./mock/teams";
import { createMockProjectService } from "./mock/projects";

// Singleton instances — one per service
let issueService: IssueService | null = null;
let notificationService: NotificationService | null = null;
let userService: UserService | null = null;
let teamService: TeamService | null = null;
let projectService: ProjectService | null = null;

export function getIssueService(): IssueService {
  if (!issueService) issueService = createMockIssueService();
  return issueService;
}

export function getNotificationService(): NotificationService {
  if (!notificationService) notificationService = createMockNotificationService();
  return notificationService;
}

export function getUserService(): UserService {
  if (!userService) userService = createMockUserService();
  return userService;
}

export function getTeamService(): TeamService {
  if (!teamService) teamService = createMockTeamService();
  return teamService;
}

export function getProjectService(): ProjectService {
  if (!projectService) projectService = createMockProjectService();
  return projectService;
}

/** Reset all services — useful for testing */
export function resetServices() {
  issueService = null;
  notificationService = null;
  userService = null;
  teamService = null;
  projectService = null;
}

// Re-export types for convenience
export type {
  IssueService,
  NotificationService,
  UserService,
  TeamService,
  ProjectService,
  Issue,
  IssueFilters,
  IssueStatus,
  Priority,
  IssueLabel,
  Project,
  Team,
  User,
  Notification,
  CreateIssueInput,
  UpdateIssueInput,
  ActivityEvent,
} from "./types";
