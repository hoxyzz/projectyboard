/**
 * Create Label Use Case.
 */

import type { Label } from '@/backend/core/labels/entities'
import { validateLabelColor, validateLabelName, type ValidationResult } from '@/backend/core/labels/rules'
import type { LabelRepository } from '@/backend/ports/label-repository'

export type CreateLabelCommand = {
	name: string
	color: string
}

export type CreateLabelDeps = {
	labels: LabelRepository
}

export type CreateLabelResult =
	| { success: true; label: Label }
	| { success: false; validation: ValidationResult }

export async function createLabel(
	deps: CreateLabelDeps,
	command: CreateLabelCommand
): Promise<CreateLabelResult> {
	// 1. Validate input
	const nameValidation = validateLabelName(command.name)
	if (!nameValidation.valid) {
		return { success: false, validation: nameValidation }
	}

	const colorValidation = validateLabelColor(command.color)
	if (!colorValidation.valid) {
		return { success: false, validation: colorValidation }
	}

	// 2. Create label
	const label = await deps.labels.create({
		name: command.name.trim(),
		color: command.color
	})

	return { success: true, label }
}
