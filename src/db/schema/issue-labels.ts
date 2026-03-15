import { pgTable, text, primaryKey, timestamp } from 'drizzle-orm/pg-core'
import { issues } from './issues'
import { labels } from './labels'
import type { IssueId, LabelId } from '../types'

export const issueLabels = pgTable('issue_labels', {
  issueId: text('issue_id').$type<IssueId>().notNull().references(() => issues.id, { onDelete: 'cascade' }),
  labelId: text('label_id').$type<LabelId>().notNull().references(() => labels.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.issueId, table.labelId] }),
])

export type IssueLabelRow = typeof issueLabels.$inferSelect
export type NewIssueLabelRow = typeof issueLabels.$inferInsert
