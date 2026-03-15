/**
 * Read Label Use Cases.
 */

import type { Label } from '@/backend/core/labels/entities'
import type { LabelRepository } from '@/backend/ports/label-repository'

export type ReadLabelsDeps = {
	labels: LabelRepository
}

export async function readLabels(deps: ReadLabelsDeps): Promise<Label[]> {
	return deps.labels.list()
}

export async function readLabelById(
	deps: ReadLabelsDeps,
	id: string
): Promise<Label | null> {
	return deps.labels.getById(id)
}
