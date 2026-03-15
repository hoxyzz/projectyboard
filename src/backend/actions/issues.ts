"use server";

import { revalidateTag } from "next/cache";
import { container } from "../container";
import type { IssuePriority, IssueStatus } from "../core/issues/entities";

// ============================================================================
// Issue Server Actions
// ============================================================================

/**
 * Create a new issue
 */
export async function createIssue(data: {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  projectId: string;
  labelIds?: string[];
  assigneeId?: string;
}) {
  const useCases = container.getIssueUseCases();
  
  const result = await useCases.create.execute({
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    projectId: data.projectId,
    labelIds: data.labelIds,
    assigneeId: data.assigneeId,
  });

  if (result.success) {
    revalidateTag("issues", "max");
    revalidateTag(`project-${data.projectId}-issues`, "max");
  }

  return result;
}

/**
 * Get all issues with optional filtering
 */
export async function getIssues(filters?: {
  projectId?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  labelIds?: string[];
}) {
  const useCases = container.getIssueUseCases();
  return useCases.read.list(filters);
}

/**
 * Get a single issue by ID
 */
export async function getIssue(id: string) {
  const useCases = container.getIssueUseCases();
  return useCases.read.byId(id);
}

/**
 * Get issues by project ID
 */
export async function getIssuesByProject(projectId: string) {
  const useCases = container.getIssueUseCases();
  return useCases.read.byProject(projectId);
}

/**
 * Update an issue
 */
export async function updateIssue(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    labelIds?: string[];
    assigneeId?: string | null;
  }
) {
  const useCases = container.getIssueUseCases();
  
  const result = await useCases.update.execute(id, data);

  if (result.success && result.data) {
    revalidateTag("issues", "max");
    revalidateTag(`issue-${id}`, "max");
    revalidateTag(`project-${result.data.projectId}-issues`, "max");
  }

  return result;
}

/**
 * Update issue status
 */
export async function updateIssueStatus(id: string, status: IssueStatus) {
  const useCases = container.getIssueUseCases();
  
  const result = await useCases.update.status(id, status);

  if (result.success && result.data) {
    revalidateTag("issues", "max");
    revalidateTag(`issue-${id}`, "max");
    revalidateTag(`project-${result.data.projectId}-issues`, "max");
  }

  return result;
}

/**
 * Update issue priority
 */
export async function updateIssuePriority(id: string, priority: IssuePriority) {
  const useCases = container.getIssueUseCases();
  
  const result = await useCases.update.priority(id, priority);

  if (result.success && result.data) {
    revalidateTag("issues", "max");
    revalidateTag(`issue-${id}`, "max");
  }

  return result;
}

/**
 * Assign an issue to a user
 */
export async function assignIssue(id: string, assigneeId: string | null) {
  const useCases = container.getIssueUseCases();
  
  const result = await useCases.update.assignee(id, assigneeId);

  if (result.success) {
    revalidateTag("issues", "max");
    revalidateTag(`issue-${id}`, "max");
  }

  return result;
}

/**
 * Add labels to an issue
 */
export async function addLabelsToIssue(id: string, labelIds: string[]) {
  const useCases = container.getIssueUseCases();
  
  const result = await useCases.update.addLabels(id, labelIds);

  if (result.success) {
    revalidateTag("issues", "max");
    revalidateTag(`issue-${id}`, "max");
  }

  return result;
}

/**
 * Remove labels from an issue
 */
export async function removeLabelsFromIssue(id: string, labelIds: string[]) {
  const useCases = container.getIssueUseCases();
  
  const result = await useCases.update.removeLabels(id, labelIds);

  if (result.success) {
    revalidateTag("issues", "max");
    revalidateTag(`issue-${id}`, "max");
  }

  return result;
}

/**
 * Delete an issue
 */
export async function deleteIssue(id: string) {
  const useCases = container.getIssueUseCases();
  
  // Get issue first to know project for cache invalidation
  const issue = await useCases.read.byId(id);
  const result = await useCases.destroy.execute(id);

  if (result.success && issue) {
    revalidateTag("issues", "max");
    revalidateTag(`issue-${id}`, "max");
    revalidateTag(`project-${issue.projectId}-issues`, "max");
  }

  return result;
}

/**
 * Get issue activity/history
 */
export async function getIssueActivity(id: string) {
  const useCases = container.getIssueUseCases();
  const repo = container.getIssueRepository();
  
  const issue = await repo.findById(id);
  if (!issue) {
    return [];
  }
  
  return issue.activity || [];
}
