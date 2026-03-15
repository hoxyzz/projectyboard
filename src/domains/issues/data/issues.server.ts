"use server";

import type { PaginatedResult } from "@/shared/types";
import type {
  CreateIssueInput,
  CreateIssueLabelInput,
  CreateIssueProjectInput,
  Issue,
  IssueFilters,
  IssueLabel,
  IssueLabelRepository,
  IssueProject,
  IssueProjectRepository,
  IssueRepository,
  UpdateIssueInput,
} from "../types";

import {
  createIssue as backendCreateIssue,
  deleteIssue as backendDeleteIssue,
  getIssue as backendGetIssue,
  getIssues as backendGetIssues,
  updateIssue as backendUpdateIssue,
} from "@/backend/actions/issues";

import {
  createProject as backendCreateProject,
  deleteProject as backendDeleteProject,
  getProjects as backendGetProjects,
} from "@/backend/actions/projects";

import {
  createLabel as backendCreateLabel,
  deleteLabel as backendDeleteLabel,
  getLabels as backendGetLabels,
} from "@/backend/actions/labels";

// ============================================================================
// Issue Repository Server Actions
// ============================================================================

export async function listIssues(
  filters?: IssueFilters
): Promise<PaginatedResult<Issue>> {
  const result = await backendGetIssues(filters);

  if (!result.success || !result.data) {
    return { items: [], total: 0, page: 1, pageSize: 50, hasMore: false };
  }

  // Transform backend issues to UI format
  const issues: Issue[] = result.data.map((issue) => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description ?? undefined,
    status: issue.status,
    priority: issue.priority,
    labels: issue.labels ?? [],
    projectId: issue.projectId ?? undefined,
    projectName: issue.projectName ?? undefined,
    activity: issue.activity ?? [],
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  }));

  return {
    items: issues,
    total: issues.length,
    page: 1,
    pageSize: 50,
    hasMore: false,
  };
}

export async function getIssueById(id: string): Promise<Issue | null> {
  const result = await backendGetIssue(id);

  if (!result.success || !result.data) {
    return null;
  }

  const issue = result.data;
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description ?? undefined,
    status: issue.status,
    priority: issue.priority,
    labels: issue.labels ?? [],
    projectId: issue.projectId ?? undefined,
    projectName: issue.projectName ?? undefined,
    activity: issue.activity ?? [],
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

export async function createIssueAction(input: CreateIssueInput): Promise<Issue> {
  const result = await backendCreateIssue({
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    projectId: input.projectId ?? "",
    labelIds: input.labelIds,
  });

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Failed to create issue");
  }

  const issue = result.data;
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description ?? undefined,
    status: issue.status,
    priority: issue.priority,
    labels: issue.labels ?? [],
    projectId: issue.projectId ?? undefined,
    projectName: issue.projectName ?? undefined,
    activity: issue.activity ?? [],
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

export async function updateIssueAction(
  id: string,
  input: UpdateIssueInput
): Promise<Issue> {
  const result = await backendUpdateIssue(id, {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    labelIds: input.labelIds,
  });

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Failed to update issue");
  }

  const issue = result.data;
  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description ?? undefined,
    status: issue.status,
    priority: issue.priority,
    labels: issue.labels ?? [],
    projectId: issue.projectId ?? undefined,
    projectName: issue.projectName ?? undefined,
    activity: issue.activity ?? [],
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

export async function destroyIssueAction(id: string): Promise<void> {
  const result = await backendDeleteIssue(id);

  if (!result.success) {
    throw new Error(result.error ?? "Failed to delete issue");
  }
}

// ============================================================================
// Project Repository Server Actions
// ============================================================================

export async function listProjects(): Promise<IssueProject[]> {
  const result = await backendGetProjects();

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((project) => ({
    id: project.id,
    name: project.name,
    key: project.key,
    color: project.color ?? undefined,
  }));
}

export async function createProjectAction(
  input: CreateIssueProjectInput
): Promise<IssueProject> {
  const result = await backendCreateProject({
    name: input.name,
    key: input.key,
    color: input.color,
  });

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Failed to create project");
  }

  return {
    id: result.data.id,
    name: result.data.name,
    key: result.data.key,
    color: result.data.color ?? undefined,
  };
}

export async function deleteProjectAction(id: string): Promise<void> {
  const result = await backendDeleteProject(id);

  if (!result.success) {
    throw new Error(result.error ?? "Failed to delete project");
  }
}

// ============================================================================
// Label Repository Server Actions
// ============================================================================

export async function listLabels(): Promise<IssueLabel[]> {
  const result = await backendGetLabels();

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((label) => ({
    id: label.id,
    name: label.name,
    color: label.color,
  }));
}

export async function createLabelAction(
  input: CreateIssueLabelInput
): Promise<IssueLabel> {
  const result = await backendCreateLabel({
    name: input.name,
    color: input.color,
  });

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Failed to create label");
  }

  return {
    id: result.data.id,
    name: result.data.name,
    color: result.data.color,
  };
}

export async function deleteLabelAction(id: string): Promise<void> {
  const result = await backendDeleteLabel(id);

  if (!result.success) {
    throw new Error(result.error ?? "Failed to delete label");
  }
}

// ============================================================================
// Repository Factory Functions
// ============================================================================

export function createServerIssueRepository(): IssueRepository {
  return {
    list: listIssues,
    getById: getIssueById,
    create: createIssueAction,
    update: updateIssueAction,
    destroy: destroyIssueAction,
  };
}

export function createServerProjectRepository(): IssueProjectRepository {
  return {
    listProjects,
    createProject: createProjectAction,
    deleteProject: deleteProjectAction,
  };
}

export function createServerLabelRepository(): IssueLabelRepository {
  return {
    listLabels,
    createLabel: createLabelAction,
    deleteLabel: deleteLabelAction,
  };
}
