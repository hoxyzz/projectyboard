import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'
import { issues } from './issues'
import type { ActivityId, IssueId, UserId } from '../types'

export const activityTypeEnum = [
  'status_change',
  'priority_change',
  'label_added',
  'label_removed',
  'created',
  'updated',
  'description_changed',
] as const

export const issueActivity = pgTable('issue_activity', {
  id: text('id').primaryKey().$type<ActivityId>(),
  issueId: text('issue_id').$type<IssueId>().notNull().references(() => issues.id, { onDelete: 'cascade' }),
  type: text('type', { enum: activityTypeEnum }).notNull(),
  field: text('field'),
  fromValue: text('from_value'),
  toValue: text('to_value'),
  userId: text('user_id').$type<UserId>().notNull(),
  userName: text('user_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('issue_activity_issue_id_idx').on(table.issueId),
  index('issue_activity_created_at_idx').on(table.createdAt),
])

export type IssueActivityRow = typeof issueActivity.$inferSelect
export type NewIssueActivityRow = typeof issueActivity.$inferInsert
