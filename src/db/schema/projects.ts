import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import type { ProjectId } from '../types'

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$type<ProjectId>(),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  color: text('color'),
  issueCounter: integer('issue_counter').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ProjectRow = typeof projects.$inferSelect
export type NewProjectRow = typeof projects.$inferInsert
