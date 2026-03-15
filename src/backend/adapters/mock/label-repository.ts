/**
 * Mock Label Repository Adapter.
 * In-memory implementation for development and testing.
 */

import type { Label } from '@/backend/core/labels/entities'
import type { CreateLabelInput, LabelRepository } from '@/backend/ports/label-repository'

const DEFAULT_LABELS: Label[] = [
	{ id: 'l1', name: 'CRUD', color: 'hsl(var(--li-label-crud))' },
	{ id: 'l2', name: 'Database', color: 'hsl(var(--li-label-database))' },
	{ id: 'l3', name: 'Feature', color: 'hsl(var(--li-label-feature))' },
	{ id: 'l4', name: 'Bug', color: 'hsl(var(--li-dot-red))' }
]

let labels: Label[] = [...DEFAULT_LABELS]

export function createMockLabelRepository(): LabelRepository {
	return {
		async list(): Promise<Label[]> {
			return [...labels]
		},

		async getById(id: string): Promise<Label | null> {
			return labels.find((l) => l.id === id) ?? null
		},

		async getByIds(ids: string[]): Promise<Label[]> {
			return labels.filter((l) => ids.includes(l.id))
		},

		async create(input: CreateLabelInput): Promise<Label> {
			const label: Label = {
				id: crypto.randomUUID(),
				name: input.name,
				color: input.color
			}

			labels = [...labels, label]
			return label
		},

		async delete(id: string): Promise<void> {
			labels = labels.filter((l) => l.id !== id)
		}
	}
}

export function resetMockLabelState(): void {
	labels = [...DEFAULT_LABELS]
}

export function getMockLabels(): Label[] {
	return labels
}
