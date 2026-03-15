import type { IssueStatus, Priority } from './types'

export const STATUS_OPTIONS: { value: IssueStatus; label: string; color: string }[] = [
	{ value: 'backlog', label: 'Backlog', color: 'hsl(var(--li-text-muted))' },
	{ value: 'todo', label: 'Todo', color: 'hsl(var(--li-text-muted))' },
	{ value: 'in_progress', label: 'In Progress', color: 'hsl(var(--li-status-progress))' },
	{ value: 'done', label: 'Done', color: 'hsl(var(--li-status-done))' },
	{ value: 'cancelled', label: 'Cancelled', color: 'hsl(var(--li-dot-red))' }
]

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
	{ value: 'urgent', label: 'Urgent' },
	{ value: 'high', label: 'High' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'low', label: 'Low' },
	{ value: 'none', label: 'No priority' }
]

