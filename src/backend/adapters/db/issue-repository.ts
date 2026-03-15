/**
 * Database Issue Repository Adapter.
 * Implements IssueRepository using Drizzle ORM with Neon.
 */

import { db } from '@/db/client'
import { issues, issueLabels, labels as labelsTable, projects } from '@/db/schema'
import { eq, inArray, and, or, ilike, sql, desc } from 'drizzle-orm'
import type { Issue, IssueStatus, PaginatedResult, Priority, Label } from '@/backend/core/issues/entities'
import type { IssueRepository, IssueFilters, CreateIssueInput, UpdateIssueInput } from '@/backend/ports/issue-repository'

export class DbIssueRepository implements IssueRepository {
  async list(filters?: IssueFilters): Promise<PaginatedResult<Issue>> {
    const conditions: ReturnType<typeof eq>[] = []

    if (filters?.status?.length) {
      conditions.push(inArray(issues.status, filters.status))
    }
    if (filters?.priority?.length) {
      conditions.push(inArray(issues.priority, filters.priority))
    }
    if (filters?.projectId) {
      conditions.push(eq(issues.projectId, filters.projectId))
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(issues.title, `%${filters.search}%`),
          ilike(issues.description, `%${filters.search}%`)
        )!
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const rows = await db
      .select()
      .from(issues)
      .where(whereClause)
      .orderBy(desc(issues.createdAt))

    // Fetch labels for all issues
    const issueIds = rows.map(r => r.id)
    const labelAssignments = issueIds.length > 0
      ? await db
          .select({
            issueId: issueLabels.issueId,
            labelId: issueLabels.labelId,
            labelName: labelsTable.name,
            labelColor: labelsTable.color,
          })
          .from(issueLabels)
          .innerJoin(labelsTable, eq(issueLabels.labelId, labelsTable.id))
          .where(inArray(issueLabels.issueId, issueIds))
      : []

    // Group labels by issue
    const labelsByIssue = new Map<string, Label[]>()
    for (const la of labelAssignments) {
      const existing = labelsByIssue.get(la.issueId) || []
      existing.push({
        id: la.labelId,
        name: la.labelName,
        color: la.labelColor,
      })
      labelsByIssue.set(la.issueId, existing)
    }

    // Filter by label IDs if specified
    let filteredRows = rows
    if (filters?.labelIds?.length) {
      filteredRows = rows.filter(row => {
        const issueLabels = labelsByIssue.get(row.id) || []
        return filters.labelIds!.some(lid => issueLabels.some(l => l.id === lid))
      })
    }

    const items: Issue[] = filteredRows.map(row => ({
      id: row.id,
      identifier: row.identifier,
      title: row.title,
      description: row.description,
      status: row.status as IssueStatus,
      priority: row.priority as Priority,
      labels: labelsByIssue.get(row.id) || [],
      projectId: row.projectId,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return {
      items,
      totalCount: items.length,
      hasMore: false,
    }
  }

  async getById(id: string): Promise<Issue | null> {
    const [row] = await db.select().from(issues).where(eq(issues.id, id)).limit(1)
    if (!row) return null

    const labelAssignments = await db
      .select({
        labelId: issueLabels.labelId,
        labelName: labelsTable.name,
        labelColor: labelsTable.color,
      })
      .from(issueLabels)
      .innerJoin(labelsTable, eq(issueLabels.labelId, labelsTable.id))
      .where(eq(issueLabels.issueId, id))

    const labels: Label[] = labelAssignments.map(la => ({
      id: la.labelId,
      name: la.labelName,
      color: la.labelColor,
    }))

    return {
      id: row.id,
      identifier: row.identifier,
      title: row.title,
      description: row.description,
      status: row.status as IssueStatus,
      priority: row.priority as Priority,
      labels,
      projectId: row.projectId,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async create(input: CreateIssueInput): Promise<Issue> {
    // Generate identifier
    let identifier: string
    let prefix = 'ISS'

    if (input.projectId) {
      const [project] = await db
        .select({ key: projects.key, issueCounter: projects.issueCounter })
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1)

      if (project) {
        prefix = project.key
        const nextNum = project.issueCounter + 1
        identifier = `${prefix}-${nextNum}`

        // Increment counter
        await db
          .update(projects)
          .set({ issueCounter: nextNum })
          .where(eq(projects.id, input.projectId))
      } else {
        // Fallback to global counter
        const countResult = await db.select({ count: sql<number>`count(*)` }).from(issues)
        const count = Number(countResult[0]?.count ?? 0) + 1
        identifier = `${prefix}-${count}`
      }
    } else {
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(issues)
      const count = Number(countResult[0]?.count ?? 0) + 1
      identifier = `${prefix}-${count}`
    }

    const id = crypto.randomUUID()
    const now = new Date()

    const [inserted] = await db
      .insert(issues)
      .values({
        id,
        identifier,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'backlog',
        priority: input.priority ?? 'none',
        projectId: input.projectId ?? null,
        parentId: input.parentId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    // Assign labels
    if (input.labelIds?.length) {
      await db.insert(issueLabels).values(
        input.labelIds.map(labelId => ({
          issueId: id,
          labelId,
        }))
      )
    }

    const labels = input.labelIds?.length
      ? await db.select().from(labelsTable).where(inArray(labelsTable.id, input.labelIds))
      : []

    return {
      id: inserted.id,
      identifier: inserted.identifier,
      title: inserted.title,
      description: inserted.description,
      status: inserted.status as IssueStatus,
      priority: inserted.priority as Priority,
      labels: labels.map(l => ({ id: l.id, name: l.name, color: l.color })),
      projectId: inserted.projectId,
      parentId: inserted.parentId,
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
    }
  }

  async update(id: string, input: UpdateIssueInput): Promise<Issue> {
    const now = new Date()
    const updateData: Record<string, unknown> = { updatedAt: now }

    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.status !== undefined) updateData.status = input.status
    if (input.priority !== undefined) updateData.priority = input.priority
    if (input.projectId !== undefined) updateData.projectId = input.projectId

    const [updated] = await db
      .update(issues)
      .set(updateData)
      .where(eq(issues.id, id))
      .returning()

    if (!updated) throw new Error(`Issue not found: ${id}`)

    // Update labels if provided
    if (input.labelIds !== undefined) {
      await db.delete(issueLabels).where(eq(issueLabels.issueId, id))
      if (input.labelIds.length > 0) {
        await db.insert(issueLabels).values(
          input.labelIds.map(labelId => ({
            issueId: id,
            labelId,
          }))
        )
      }
    }

    // Fetch labels
    const labelAssignments = await db
      .select({
        labelId: issueLabels.labelId,
        labelName: labelsTable.name,
        labelColor: labelsTable.color,
      })
      .from(issueLabels)
      .innerJoin(labelsTable, eq(issueLabels.labelId, labelsTable.id))
      .where(eq(issueLabels.issueId, id))

    const labels: Label[] = labelAssignments.map(la => ({
      id: la.labelId,
      name: la.labelName,
      color: la.labelColor,
    }))

    return {
      id: updated.id,
      identifier: updated.identifier,
      title: updated.title,
      description: updated.description,
      status: updated.status as IssueStatus,
      priority: updated.priority as Priority,
      labels,
      projectId: updated.projectId,
      parentId: updated.parentId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(issueLabels).where(eq(issueLabels.issueId, id))
    await db.delete(issues).where(eq(issues.id, id))
  }
}
