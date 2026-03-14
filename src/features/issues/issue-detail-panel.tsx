import { formatDistanceToNow } from 'date-fns'
import {
	AlertCircle,
	BarChart3,
	ChevronRight,
	Circle,
	Clock,
	ExternalLink,
	FileText,
	Tag,
	User
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { ActivityEvent, Issue, IssueStatus, Priority } from '@/services'

import { MarkdownPreview } from '@/components/markdown-editor'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useUpdateIssue } from '@/hooks/use-issues'
import { cn } from '@/lib/utils'

// ─── Shared constants ───────────────────────────────────

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

// ─── Icons ──────────────────────────────────────────────

export const PriorityIcon = ({
	priority,
	className
}: {
	priority: Priority
	className?: string
}) => {
	const cls = cn('h-3.5 w-3.5', className)
	switch (priority) {
		case 'urgent':
			return <AlertCircle className={cn(cls, 'text-li-priority-urgent')} />
		case 'high':
			return <BarChart3 className={cn(cls, 'text-li-priority-high')} />
		case 'medium':
			return <BarChart3 className={cn(cls, 'text-li-priority-medium')} />
		default:
			return <BarChart3 className={cn(cls, 'text-li-text-muted')} />
	}
}

export const StatusIcon = ({ status, className }: { status: IssueStatus; className?: string }) => {
	switch (status) {
		case 'in_progress':
			return (
				<div
					className={cn(
						'h-3.5 w-3.5 rounded-full border-2 border-li-status-progress border-t-transparent animate-spin',
						className
					)}
				/>
			)
		case 'done':
			return (
				<Circle
					className={cn('h-3.5 w-3.5 text-li-status-done fill-li-status-done', className)}
				/>
			)
		case 'cancelled':
			return (
				<Circle className={cn('h-3.5 w-3.5 text-li-dot-red fill-li-dot-red', className)} />
			)
		default:
			return <Circle className={cn('h-3.5 w-3.5 text-li-text-muted', className)} />
	}
}

// ─── Activity Item ──────────────────────────────────────

function ActivityItem({ event }: { event: ActivityEvent }) {
	const icon = (() => {
		switch (event.type) {
			case 'status_change':
				return <Circle className="h-3 w-3 text-li-status-progress" />
			case 'priority_change':
				return <BarChart3 className="h-3 w-3 text-li-priority-high" />
			case 'label_added':
			case 'label_removed':
				return <Tag className="h-3 w-3 text-li-dot-purple" />
			case 'created':
				return <FileText className="h-3 w-3 text-li-dot-green" />
			default:
				return <Clock className="h-3 w-3 text-li-text-muted" />
		}
	})()

	const description = (() => {
		switch (event.type) {
			case 'status_change':
				return (
					<>
						changed status from{' '}
						<span className="text-li-text-bright">{event.from}</span> to{' '}
						<span className="text-li-text-bright">{event.to}</span>
					</>
				)
			case 'priority_change':
				return (
					<>
						changed priority from{' '}
						<span className="text-li-text-bright">{event.from}</span> to{' '}
						<span className="text-li-text-bright">{event.to}</span>
					</>
				)
			case 'label_added':
				return (
					<>
						added label <span className="text-li-text-bright">{event.to}</span>
					</>
				)
			case 'label_removed':
				return (
					<>
						removed label <span className="text-li-text-bright">{event.from}</span>
					</>
				)
			case 'created':
				return 'created this issue'
			case 'description_changed':
				return 'updated the description'
			default:
				return (
					<>
						updated <span className="text-li-text-bright">{event.field}</span>
					</>
				)
		}
	})()

	return (
		<div className="flex items-start gap-2.5 py-1.5">
			<div className="mt-0.5 shrink-0">{icon}</div>
			<div className="text-[11px] text-li-text-muted leading-relaxed">
				<span className="text-li-text-bright font-medium">{event.userName}</span>{' '}
				{description}{' '}
				<span className="text-li-text-muted/70">
					{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
				</span>
			</div>
		</div>
	)
}

// ─── Inline Detail Panel ────────────────────────────────

type IssueDetailPanelProps = {
	issue: Issue
	expanded: boolean
	onOpenFull: (issue: Issue) => void
	onStatusChange: (issue: Issue, status: IssueStatus) => void
	onPriorityChange: (issue: Issue, priority: Priority) => void
}

export function IssueDetailPanel({
	issue,
	expanded,
	onOpenFull,
	onStatusChange,
	onPriorityChange
}: IssueDetailPanelProps) {
	const contentRef = useRef<HTMLDivElement>(null)
	const [height, setHeight] = useState(0)
	const [isAnimating, setIsAnimating] = useState(false)
	const [shouldRender, setShouldRender] = useState(false)

	useEffect(() => {
		if (expanded) {
			setShouldRender(true)
			setIsAnimating(true)
			// Allow a tick for DOM to render before measuring
			requestAnimationFrame(() => {
				if (contentRef.current) {
					setHeight(contentRef.current.scrollHeight)
				}
			})
		} else if (shouldRender) {
			setIsAnimating(true)
			setHeight(0)
			const timer = setTimeout(() => {
				setShouldRender(false)
				setIsAnimating(false)
			}, 300)
			return () => clearTimeout(timer)
		}
	}, [expanded, shouldRender])

	// After expand animation completes
	const handleTransitionEnd = useCallback(() => {
		if (expanded) {
			setIsAnimating(false)
		}
	}, [expanded])

	if (!shouldRender && !expanded) return null

	const statusOpt = STATUS_OPTIONS.find((s) => s.value === issue.status)
	const priorityOpt = PRIORITY_OPTIONS.find((p) => p.value === issue.priority)
	const sortedActivity = [...(issue.activity ?? [])].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	)

	return (
		<div
			className="overflow-hidden border-b border-li-divider bg-li-bg/30"
			style={{
				height: expanded ? (isAnimating ? height : 'auto') : 0,
				opacity: expanded ? 1 : 0,
				transition:
					'height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
			}}
			onTransitionEnd={handleTransitionEnd}
		>
			<div ref={contentRef} className="px-6 py-4">
				<div className="flex gap-6">
					{/* Left: Description + Activity */}
					<div className="flex-1 min-w-0 space-y-4">
						{/* Description */}
						{issue.description ? (
							<div>
								<h4 className="text-[11px] font-medium text-li-text-muted uppercase tracking-wider mb-1.5">
									Description
								</h4>
								<MarkdownPreview content={issue.description} />
							</div>
						) : (
							<p className="text-[12px] text-li-text-muted italic">No description</p>
						)}

						{/* Activity */}
						{sortedActivity.length > 0 && (
							<div>
								<h4 className="text-[11px] font-medium text-li-text-muted uppercase tracking-wider mb-1.5">
									Activity
								</h4>
								<div className="space-y-0.5 max-h-[120px] overflow-auto">
									{sortedActivity.slice(0, 6).map((event) => (
										<ActivityItem key={event.id} event={event} />
									))}
									{sortedActivity.length > 6 && (
										<p className="text-[10px] text-li-text-muted pt-1">
											+{sortedActivity.length - 6} more events
										</p>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Right: Properties sidebar */}
					<div className="w-[180px] shrink-0 space-y-3 border-l border-li-divider pl-4">
						{/* Status */}
						<div>
							<h4 className="text-[10px] font-medium text-li-text-muted uppercase tracking-wider mb-1">
								Status
							</h4>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex items-center gap-1.5 text-[12px] text-li-text-bright hover:bg-li-bg-hover rounded px-1.5 py-0.5 transition-colors -ml-1.5">
										<span
											className="h-2 w-2 rounded-full"
											style={{ backgroundColor: statusOpt?.color }}
										/>
										{statusOpt?.label}
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="bg-li-menu-bg border-li-menu-border min-w-[140px]">
									{STATUS_OPTIONS.map((opt) => (
										<DropdownMenuCheckboxItem
											key={opt.value}
											checked={issue.status === opt.value}
											onCheckedChange={() => onStatusChange(issue, opt.value)}
											className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
										>
											<span
												className="inline-block h-2 w-2 rounded-full mr-1.5"
												style={{ backgroundColor: opt.color }}
											/>
											{opt.label}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Priority */}
						<div>
							<h4 className="text-[10px] font-medium text-li-text-muted uppercase tracking-wider mb-1">
								Priority
							</h4>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex items-center gap-1.5 text-[12px] text-li-text-bright hover:bg-li-bg-hover rounded px-1.5 py-0.5 transition-colors -ml-1.5">
										<PriorityIcon priority={issue.priority} />
										{priorityOpt?.label}
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="bg-li-menu-bg border-li-menu-border min-w-[140px]">
									{PRIORITY_OPTIONS.map((opt) => (
										<DropdownMenuCheckboxItem
											key={opt.value}
											checked={issue.priority === opt.value}
											onCheckedChange={() =>
												onPriorityChange(issue, opt.value)
											}
											className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
										>
											{opt.label}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Labels */}
						<div>
							<h4 className="text-[10px] font-medium text-li-text-muted uppercase tracking-wider mb-1">
								Labels
							</h4>
							{issue.labels.length > 0 ? (
								<div className="flex flex-wrap gap-1">
									{issue.labels.map((label) => (
										<span
											key={label.id}
											className="text-[10px] px-1.5 py-0.5 rounded"
											style={{
												color: label.color,
												backgroundColor: `${label.color}15`
											}}
										>
											{label.name}
										</span>
									))}
								</div>
							) : (
								<span className="text-[11px] text-li-text-muted">None</span>
							)}
						</div>

						{/* Assignee */}
						<div>
							<h4 className="text-[10px] font-medium text-li-text-muted uppercase tracking-wider mb-1">
								Assignee
							</h4>
							<div className="flex items-center gap-1.5">
								<User className="h-3 w-3 text-li-text-muted" />
								<span className="text-[12px] text-li-text-bright">
									{issue.assigneeName ?? 'Unassigned'}
								</span>
							</div>
						</div>

						{/* Project */}
						{issue.projectName && (
							<div>
								<h4 className="text-[10px] font-medium text-li-text-muted uppercase tracking-wider mb-1">
									Project
								</h4>
								<span className="text-[12px] text-li-text">
									{issue.projectName}
								</span>
							</div>
						)}

						{/* Open full */}
						<button
							onClick={(e) => {
								e.stopPropagation()
								onOpenFull(issue)
							}}
							className="flex items-center gap-1.5 text-[11px] text-li-dot-blue hover:text-li-dot-blue/80 transition-colors mt-2"
						>
							<ExternalLink className="h-3 w-3" />
							Open full view
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
