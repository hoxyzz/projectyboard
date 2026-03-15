/**
 * Database Project Repository Adapter.
 * Implements ProjectRepository using Drizzle ORM with Neon.
 */

import { db } from '@/db/client'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Project } from '@/backend/core/projects/entities'
import type { ProjectRepository, CreateProjectInput } from '@/backend/ports/project-repository'

export class DbProjectRepository implements ProjectRepository {
  async list(): Promise<Project[]> {
    const rows = await db.select().from(projects).orderBy(projects.name)
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      key: row.key,
      color: row.color,
    }))
  }

  async getById(id: string): Promise<Project | null> {
    const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      key: row.key,
      color: row.color,
    }
  }

  async getByKey(key: string): Promise<Project | null> {
    const [row] = await db.select().from(projects).where(eq(projects.key, key)).limit(1)
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      key: row.key,
      color: row.color,
    }
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const id = crypto.randomUUID()

    // Generate key from name if not provided
    const key = input.key ?? input.name.substring(0, 3).toUpperCase()

    const [inserted] = await db
      .insert(projects)
      .values({
        id,
        name: input.name,
        key,
        color: input.color ?? '#6366f1',
        issueCounter: 0,
      })
      .returning()

    return {
      id: inserted.id,
      name: inserted.name,
      key: inserted.key,
      color: inserted.color,
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id))
  }

  async getAllKeys(): Promise<string[]> {
    const rows = await db.select({ key: projects.key }).from(projects)
    return rows.map(r => r.key)
  }
}
