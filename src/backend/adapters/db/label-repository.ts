/**
 * Database Label Repository Adapter.
 * Implements LabelRepository using Drizzle ORM with Neon.
 */

import { db } from '@/db/client'
import { labels } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import type { Label } from '@/backend/core/labels/entities'
import type { LabelRepository, CreateLabelInput } from '@/backend/ports/label-repository'

export class DbLabelRepository implements LabelRepository {
  async list(): Promise<Label[]> {
    const rows = await db.select().from(labels).orderBy(labels.name)
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
    }))
  }

  async getById(id: string): Promise<Label | null> {
    const [row] = await db.select().from(labels).where(eq(labels.id, id)).limit(1)
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      color: row.color,
    }
  }

  async getByIds(ids: string[]): Promise<Label[]> {
    if (ids.length === 0) return []
    const rows = await db.select().from(labels).where(inArray(labels.id, ids))
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
    }))
  }

  async create(input: CreateLabelInput): Promise<Label> {
    const id = crypto.randomUUID()
    const [inserted] = await db
      .insert(labels)
      .values({
        id,
        name: input.name,
        color: input.color,
      })
      .returning()

    return {
      id: inserted.id,
      name: inserted.name,
      color: inserted.color,
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(labels).where(eq(labels.id, id))
  }
}
