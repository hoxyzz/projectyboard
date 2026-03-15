"use server";

import { revalidateTag } from "next/cache";
import { container } from "../container";

// ============================================================================
// Label Server Actions
// ============================================================================

/**
 * Create a new label
 */
export async function createLabel(data: {
  name: string;
  color: string;
  description?: string;
}) {
  const useCases = container.getLabelUseCases();
  
  const result = await useCases.create.execute({
    name: data.name,
    color: data.color,
    description: data.description,
  });

  if (result.success) {
    revalidateTag("labels", "max");
  }

  return result;
}

/**
 * Get all labels
 */
export async function getLabels() {
  const useCases = container.getLabelUseCases();
  return useCases.read.list();
}

/**
 * Get a single label by ID
 */
export async function getLabel(id: string) {
  const useCases = container.getLabelUseCases();
  return useCases.read.byId(id);
}

/**
 * Update a label
 */
export async function updateLabel(
  id: string,
  data: {
    name?: string;
    color?: string;
    description?: string;
  }
) {
  const repo = container.getLabelRepository();
  
  const label = await repo.findById(id);
  if (!label) {
    return { success: false as const, error: "Label not found" };
  }

  const updated = await repo.update(id, {
    ...label,
    ...data,
  });

  if (updated) {
    revalidateTag("labels", "max");
    revalidateTag(`label-${id}`, "max");
  }

  return { success: true as const, data: updated };
}

/**
 * Delete a label
 */
export async function deleteLabel(id: string) {
  const useCases = container.getLabelUseCases();
  
  const result = await useCases.destroy.execute(id);

  if (result.success) {
    revalidateTag("labels", "max");
    revalidateTag(`label-${id}`, "max");
    revalidateTag("issues", "max"); // Issues may reference this label
  }

  return result;
}

/**
 * Get issues with a specific label
 */
export async function getIssuesByLabel(labelId: string) {
  const issueRepo = container.getIssueRepository();
  return issueRepo.findByLabel(labelId);
}
