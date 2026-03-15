/**
 * Label Repository Port.
 * Interface for persisting and retrieving labels.
 */

import type { Label } from '@/backend/core/labels/entities'

export type CreateLabelInput = {
	name: string
	color: string
}

export interface LabelRepository {
	list(): Promise<Label[]>
	getById(id: string): Promise<Label | null>
	getByIds(ids: string[]): Promise<Label[]>
	create(input: CreateLabelInput): Promise<Label>
	delete(id: string): Promise<void>
}
