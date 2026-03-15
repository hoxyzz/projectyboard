import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { projects } from './projects'
import type { IssueId, ProjectId } from '../types'

export const issueStatusEnum = ['backlog', 'todo', 'in_progress', 'done', 'cancelled'] as const
export const issuePriorityEnum = ['urgent', 'high', 'medium', 'low', 'none'] as const

export const issues = pgTable('issues', {
  id: text('id').primaryKey().$type<IssueId>(),
  identifier: text('identifier').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: issueStatusEnum }).notNull().default('backlog'),
  priority: text('priority', { enum: issuePriorityEnum }).notNull().default('none'),
  projectId: text('project_id').$type<ProjectId>().references(() => projects.id, { onDelete: 'set null' }),
  parentId: text('parent_id').$type<IssueId>(),
  issueNumber: integer('issue_number').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('issues_project_id_idx').on(table.projectId),
  index('issues_status_idx').on(table.status),
  index('issues_parent_id_idx').on(table.parentId),
])

export type IssueRow = typeof issues.$inferSelect
export type NewIssueRow = typeof issues.$inferInsert
