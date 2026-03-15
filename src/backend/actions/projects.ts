"use server";

import { revalidateTag } from "next/cache";
import { container } from "../container";

// ============================================================================
// Project Server Actions
// ============================================================================

/**
 * Create a new project
 */
export async function createProject(data: {
  name: string;
  key?: string;
  description?: string;
  color?: string;
}) {
  const useCases = container.getProjectUseCases();
  
  const result = await useCases.create.execute({
    name: data.name,
    key: data.key,
    color: data.color,
  });

  if (result.success) {
    revalidateTag("projects", "max");
  }

  return result;
}

/**
 * Get all projects
 */
export async function getProjects() {
  const useCases = container.getProjectUseCases();
  return useCases.read.list();
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string) {
  const useCases = container.getProjectUseCases();
  return useCases.read.byId(id);
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
  }
) {
  const repo = container.getProjectRepository();
  
  const project = await repo.findById(id);
  if (!project) {
    return { success: false as const, error: "Project not found" };
  }

  const updated = await repo.update(id, {
    ...project,
    ...data,
    updatedAt: new Date(),
  });

  if (updated) {
    revalidateTag("projects", "max");
    revalidateTag(`project-${id}`, "max");
  }

  return { success: true as const, data: updated };
}

/**
 * Delete a project
 */
export async function deleteProject(id: string) {
  const useCases = container.getProjectUseCases();
  
  const result = await useCases.destroy.execute(id);

  if (result.success) {
    revalidateTag("projects", "max");
    revalidateTag(`project-${id}`, "max");
    revalidateTag(`project-${id}-issues`, "max");
  }

  return result;
}

/**
 * Get project statistics
 */
export async function getProjectStats(id: string) {
  const projectRepo = container.getProjectRepository();
  const issueRepo = container.getIssueRepository();

  const project = await projectRepo.findById(id);
  if (!project) {
    return null;
  }

  const issues = await issueRepo.findByProject(id);
  
  const stats = {
    totalIssues: issues.length,
    byStatus: {
      backlog: issues.filter(i => i.status === "backlog").length,
      todo: issues.filter(i => i.status === "todo").length,
      in_progress: issues.filter(i => i.status === "in_progress").length,
      in_review: issues.filter(i => i.status === "in_review").length,
      done: issues.filter(i => i.status === "done").length,
      cancelled: issues.filter(i => i.status === "cancelled").length,
    },
    byPriority: {
      urgent: issues.filter(i => i.priority === "urgent").length,
      high: issues.filter(i => i.priority === "high").length,
      medium: issues.filter(i => i.priority === "medium").length,
      low: issues.filter(i => i.priority === "low").length,
      none: issues.filter(i => i.priority === "none").length,
    },
  };

  return stats;
}
