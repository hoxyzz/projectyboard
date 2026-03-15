import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import type { LabelId } from '../types'

export const labels = pgTable('labels', {
  id: text('id').primaryKey().$type<LabelId>(),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type LabelRow = typeof labels.$inferSelect
export type NewLabelRow = typeof labels.$inferInsert
