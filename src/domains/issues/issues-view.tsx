import { notify } from '@remcostoeten/notifier'
import { ArrowUpDown, ChevronDown, ChevronRight, Filter, Plus, Search, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import type { Issue, IssueStatus, Priority } from '@/domains/issues/types'

import { Kbd } from '@/shared/components/kbd'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { useIssueLabels, useIssueProjects, useIssues, useUpdateIssue } from '@/domains/issues/hooks/use-issues'
import { useStructuralNavigation } from '@/shared/hooks/use-structural-navigation'
import { useNavigate } from '@/shared/lib/navigation'
import { cn } from '@/shared/lib/utils'
import { useRouteShortcuts } from '@/shell/hooks/use-route-shortcuts'

import { CreateIssueModal } from './create-issue-modal'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from './options'
import {
	IssueDetailPanel,
	PriorityIcon,
	StatusIcon
} from './issue-detail-panel'

// ─── Constants ──────────────────────────────────────────

type SortField = 'priority' | 'status' | 'title' | 'updatedAt'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER: Record<Priority, number> = {
	urgent: 0,
	high: 1,
	medium: 2,
	low: 3,
	none: 4
}

const STATUS_ORDER: Record<IssueStatus, number> = {
	in_progress: 0,
	todo: 1,
	backlog: 2,
	done: 3,
	cancelled: 4
}

// ─── Issue Row ──────────────────────────────────────────

type IssueRowProps = {
	issue: Issue
	expanded: boolean
	focused: boolean
	navId: string
	tabIndex: number
	rowRef?: (node: HTMLDivElement | null) => void
	onFocus: () => void
	onToggle: () => void
	onStatusChange: (issue: Issue, status: IssueStatus) => void
	onPriorityChange: (issue: Issue, priority: Priority) => void
	onOpenFull: (issue: Issue) => void
}

function IssueRow({
	issue,
	expanded,
	focused,
	navId,
	tabIndex,
	rowRef,
	onFocus,
	onToggle,
	onStatusChange,
	onPriorityChange,
	onOpenFull
}: IssueRowProps) {
	return (
		<>
			<div
				ref={rowRef}
				data-nav-id={navId}
				className={cn(
					'group flex h-[30px] cursor-pointer items-center px-3.5 transition-colors outline-none hover:bg-li-bg-hover',
					!expanded && 'border-b border-li-divider',
					expanded && 'bg-li-bg-hover/60',
					focused && 'bg-li-bg-hover ring-1 ring-inset ring-white/12'
				)}
				onClick={onToggle}
				onFocus={onFocus}
				onFocusCapture={onFocus}
				onKeyDown={(e) => {
					if (e.target !== e.currentTarget) return
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						onToggle()
					}
				}}
				tabIndex={tabIndex}
				role="button"
				aria-expanded={expanded}
			>
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<ChevronRight
						className={cn(
							'h-3 w-3 text-li-text-muted transition-transform duration-200',
							expanded && 'rotate-90'
						)}
					/>
					<PriorityIcon priority={issue.priority} />
					<span className="text-[12px] text-li-text-muted shrink-0">
						{issue.identifier}
					</span>

					<DropdownMenu>
						<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
							<button className="focus:outline-none hover:scale-125 transition-transform">
								<StatusIcon status={issue.status} />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="bg-li-menu-bg border-li-menu-border min-w-[160px]"
							onClick={(e) => e.stopPropagation()}
						>
							<DropdownMenuLabel className="text-li-text-muted text-[11px]">
								Set status
							</DropdownMenuLabel>
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

					<span className="truncate text-[12.5px] text-li-text-bright">{issue.title}</span>
					{issue.subIssues && (
						<span className="shrink-0 rounded bg-li-badge-bg px-1.5 py-0.5 text-[10px] text-li-text-muted">
							{issue.subIssues.done}/{issue.subIssues.total}
						</span>
					)}
					{issue.parentTitle && (
						<span className="text-[11px] text-li-text-muted truncate">
							› {issue.parentTitle}
						</span>
					)}
				</div>
				<div className="ml-4 flex shrink-0 items-center gap-2">
					{issue.labels?.map((label) => (
						<span
							key={label.id}
							className="rounded px-1.5 py-0.5 text-[10px]"
							style={{ color: label.color, backgroundColor: `${label.color}15` }}
						>
							{label.name}
						</span>
					))}
					{issue.projectName && (
						<span className="max-w-[140px] truncate text-[10.5px] text-li-text-muted">
							{issue.projectName}
						</span>
					)}
				</div>
			</div>

			<IssueDetailPanel
				issue={issue}
				expanded={expanded}
				navParentId={navId}
				onFocusWithin={onFocus}
				onOpenFull={onOpenFull}
				onStatusChange={onStatusChange}
				onPriorityChange={onPriorityChange}
			/>
		</>
	)
}

// ─── Filter Dropdown ────────────────────────────────────

function MultiFilterDropdown<T extends string>({
	label,
	options,
	selected,
	onChange
}: {
	label: string
	options: { value: T; label: string }[]
	selected: T[]
	onChange: (v: T[]) => void
}) {
	const toggle = (val: T) => {
		onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val])
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-1 text-[12px] text-li-text-muted hover:text-li-text-bright transition-colors px-2 py-1 rounded hover:bg-li-bg-hover">
					<Filter className="h-3 w-3" />
					{label}
					{selected.length > 0 && (
						<span className="bg-li-badge-bg text-li-text-badge text-[10px] px-1.5 rounded-full">
							{selected.length}
						</span>
					)}
					<ChevronDown className="h-3 w-3" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-li-menu-bg border-li-menu-border min-w-[160px]">
				{options.map((opt) => (
					<DropdownMenuCheckboxItem
						key={opt.value}
						checked={selected.includes(opt.value)}
						onCheckedChange={() => toggle(opt.value)}
						className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
					>
						{opt.label}
					</DropdownMenuCheckboxItem>
				))}
				{selected.length > 0 && (
					<>
						<DropdownMenuSeparator className="bg-li-divider" />
						<DropdownMenuCheckboxItem
							checked={false}
							onCheckedChange={() => onChange([])}
							className="text-[12px] text-li-text-muted hover:bg-li-menu-bg-hover cursor-pointer"
						>
							Clear filters
						</DropdownMenuCheckboxItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

// ─── Sort Dropdown ──────────────────────────────────────

function SortDropdown({
	sortField,
	sortDir,
	onChange
}: {
	sortField: SortField
	sortDir: SortDir
	onChange: (field: SortField, dir: SortDir) => void
}) {
	const fields: { value: SortField; label: string }[] = [
		{ value: 'priority', label: 'Priority' },
		{ value: 'status', label: 'Status' },
		{ value: 'title', label: 'Title' },
		{ value: 'updatedAt', label: 'Updated' }
	]

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-1 text-[12px] text-li-text-muted hover:text-li-text-bright transition-colors px-2 py-1 rounded hover:bg-li-bg-hover">
					<ArrowUpDown className="h-3 w-3" />
					Sort
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-li-menu-bg border-li-menu-border min-w-[160px]">
				<DropdownMenuLabel className="text-li-text-muted text-[11px]">
					Sort by
				</DropdownMenuLabel>
				{fields.map((f) => (
					<DropdownMenuCheckboxItem
						key={f.value}
						checked={sortField === f.value}
						onCheckedChange={() => onChange(f.value, sortDir)}
						className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
					>
						{f.label}
					</DropdownMenuCheckboxItem>
				))}
				<DropdownMenuSeparator className="bg-li-divider" />
				<DropdownMenuLabel className="text-li-text-muted text-[11px]">
					Direction
				</DropdownMenuLabel>
				<DropdownMenuCheckboxItem
					checked={sortDir === 'asc'}
					onCheckedChange={() => onChange(sortField, 'asc')}
					className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
				>
					Ascending
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={sortDir === 'desc'}
					onCheckedChange={() => onChange(sortField, 'desc')}
					className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
				>
					Descending
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

// ─── Main View ──────────────────────────────────────────

type IssuesViewProps = {
	onIssueSelect?: (issue: Issue) => void
	onFilterChange?: (filters: Record<string, unknown>) => void
}

export function IssuesView({ onIssueSelect: _onIssueSelect }: IssuesViewProps) {
	const [statusFilter, setStatusFilter] = useState<IssueStatus[]>([])
	const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
	const [labelFilter, setLabelFilter] = useState<string[]>([])
	const [projectFilter, setProjectFilter] = useState<string>('')
	const [searchQuery, setSearchQuery] = useState('')
	const [sortField, setSortField] = useState<SortField>('priority')
	const [sortDir, setSortDir] = useState<SortDir>('asc')
	const [createOpen, setCreateOpen] = useState(false)
	const [expandedId, setExpandedId] = useState<string | null>(null)
	const navigate = useNavigate()

	const { data, isLoading } = useIssues()
	const { data: projects = [] } = useIssueProjects()
	const { data: labels = [] } = useIssueLabels()
	const updateIssue = useUpdateIssue()

	const allIssues = useMemo(() => data?.data ?? [], [data?.data])

	const issues = useMemo(() => {
		let result = allIssues
		if (statusFilter.length) result = result.filter((i) => statusFilter.includes(i.status))
		if (priorityFilter.length)
			result = result.filter((i) => priorityFilter.includes(i.priority))
		if (projectFilter) result = result.filter((i) => i.projectId === projectFilter)
		if (searchQuery.trim()) {
			const query = searchQuery.trim().toLowerCase()
			result = result.filter(
				(i) =>
					i.title.toLowerCase().includes(query) ||
					i.identifier.toLowerCase().includes(query) ||
					i.projectName?.toLowerCase().includes(query) ||
					i.labels.some((label) => label.name.toLowerCase().includes(query))
			)
		}
		if (labelFilter.length) {
			result = result.filter((i) =>
				labelFilter.every((labelId) => i.labels.some((label) => label.id === labelId))
			)
		}

		result = [...result].sort((a, b) => {
			let cmp = 0
			switch (sortField) {
				case 'priority':
					cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
					break
				case 'status':
					cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
					break
				case 'title':
					cmp = a.title.localeCompare(b.title)
					break
				case 'updatedAt':
					cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
					break
			}
			return sortDir === 'desc' ? -cmp : cmp
		})
		return result
	}, [
		allIssues,
		statusFilter,
		priorityFilter,
		projectFilter,
		searchQuery,
		labelFilter,
		sortField,
		sortDir
	])

	const handleStatusChange = (issue: Issue, status: IssueStatus) => {
		void updateIssue.mutateAsync({ id: issue.id, input: { status } }).catch((error) => {
			notify.error(error instanceof Error ? error.message : 'Failed to update status')
		})
	}

	const handlePriorityChange = (issue: Issue, priority: Priority) => {
		void updateIssue.mutateAsync({ id: issue.id, input: { priority } }).catch((error) => {
			notify.error(error instanceof Error ? error.message : 'Failed to update priority')
		})
	}

	const grouped = useMemo(() => {
		const groups: Record<string, Issue[]> = {}
		for (const issue of issues) {
			if (!groups[issue.status]) groups[issue.status] = []
			groups[issue.status].push(issue)
		}
		return Object.entries(groups).sort(
			([a], [b]) => STATUS_ORDER[a as IssueStatus] - STATUS_ORDER[b as IssueStatus]
		)
	}, [issues])

	const navEntries = useMemo(
		() =>
			grouped.flatMap(([status, groupIssues]) => [
				`section:${status}`,
				...groupIssues.map((issue) => `issue:${issue.id}`)
			]),
		[grouped]
	)
	const {
		activeNavId,
		setActiveNavId,
		registerNavRef,
		focusNav,
		getTabIndex,
		handleStructuralKeyDownCapture
	} = useStructuralNavigation({ navIds: navEntries })
	const activeIssueId =
		activeNavId?.startsWith('issue:') ? activeNavId.replace('issue:', '') : null

	// ─── Route shortcuts ────────────────────────────────
	useRouteShortcuts({
		onNew: () => setCreateOpen(true),
		onFocusList: () => focusNav(activeNavId ?? navEntries[0] ?? null),
		onJumpToIndex: (index) => {
			const target = issues[index]
			if (!target) return
			focusNav(`issue:${target.id}`)
		},
		onOpen: () => {
			if (activeIssueId) {
				navigate(`/issues/${activeIssueId}`)
			}
		}
	})

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center bg-li-content-bg">
				<span className="text-li-text-muted text-sm">Loading issues…</span>
			</div>
		)
	}

	const activeFilters =
		statusFilter.length +
		priorityFilter.length +
		labelFilter.length +
		(projectFilter ? 1 : 0) +
		(searchQuery.trim() ? 1 : 0)

	return (
		<div className="flex-1 flex flex-col bg-li-content-bg min-h-0">
			{/* Header */}
			<div className="shrink-0 border-b border-li-content-border px-4 py-3">
				<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<span className="text-[14px] font-medium text-li-text-bright">My Issues</span>
						{activeFilters > 0 && (
							<span className="rounded-full bg-li-badge-bg px-1.5 py-0.5 text-[10px] text-li-text-badge">
								{activeFilters} filter{activeFilters > 1 ? 's' : ''}
							</span>
						)}
					</div>
					<button
						onClick={() => setCreateOpen(true)}
						className="mr-1 flex items-center gap-1.5 rounded-[6px] border border-white/8 bg-white/[0.06] px-2.5 py-1 text-[12px] text-li-text-bright transition-colors hover:bg-white/[0.09]"
					>
						<Plus className="h-3 w-3" />
						New
						<Kbd keys={['N']} className="ml-0.5" />
					</button>
				</div>

				<div className="flex flex-col gap-2 lg:flex-row lg:items-center">
					<div className="relative w-full lg:max-w-[320px] lg:flex-1">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-li-text-muted" />
						<Input
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search issues, labels, projects..."
							className="h-8 border-white/8 bg-white/[0.03] pl-8 pr-8 text-[12px] text-li-text-bright placeholder:text-li-text-muted"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery('')}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-li-text-muted transition-colors hover:text-li-text-bright"
							>
								<X className="h-3.5 w-3.5" />
							</button>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-1">
						<MultiFilterDropdown
							label="Status"
							options={STATUS_OPTIONS}
							selected={statusFilter}
							onChange={setStatusFilter}
						/>
						<MultiFilterDropdown
							label="Priority"
							options={PRIORITY_OPTIONS}
							selected={priorityFilter}
							onChange={setPriorityFilter}
						/>
						<MultiFilterDropdown
							label="Label"
							options={labels.map((label) => ({ value: label.id, label: label.name }))}
							selected={labelFilter}
							onChange={setLabelFilter}
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="flex items-center gap-1 rounded px-2 py-1 text-[12px] text-li-text-muted transition-colors hover:bg-li-bg-hover hover:text-li-text-bright">
									<Filter className="h-3 w-3" />
									{projectFilter
										? projects.find((project) => project.id === projectFilter)?.name ?? 'Project'
										: 'Project'}
									{projectFilter && (
										<span className="rounded-full bg-li-badge-bg px-1.5 text-[10px] text-li-text-badge">
											1
										</span>
									)}
									<ChevronDown className="h-3 w-3" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="min-w-[180px] border-li-menu-border bg-li-menu-bg">
								<DropdownMenuCheckboxItem
									checked={!projectFilter}
									onCheckedChange={() => setProjectFilter('')}
									className="cursor-pointer text-[12px] text-li-text-muted hover:bg-li-menu-bg-hover"
								>
									All projects
								</DropdownMenuCheckboxItem>
								{projects.map((project) => (
									<DropdownMenuCheckboxItem
										key={project.id}
										checked={projectFilter === project.id}
										onCheckedChange={() =>
											setProjectFilter((current) =>
												current === project.id ? '' : project.id
											)
										}
										className="cursor-pointer text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover"
									>
										{project.name}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<SortDropdown
							sortField={sortField}
							sortDir={sortDir}
							onChange={(f, d) => {
								setSortField(f)
								setSortDir(d)
							}}
						/>
					</div>
				</div>
			</div>

			{/* Content */}
			<div
				className="flex-1 overflow-auto outline-none"
				onKeyDownCapture={handleStructuralKeyDownCapture}
			>
				{grouped.length === 0 ? (
					<div className="flex-1 flex items-center justify-center py-20">
						<p className="text-sm text-li-text-muted">
							No issues match the current filters
						</p>
					</div>
				) : (
					grouped.map(([status, groupIssues]) => {
						const statusOpt = STATUS_OPTIONS.find((s) => s.value === status)
						return (
							<div key={status}>
								<div className="flex items-center h-[30px] px-4 sticky top-0 bg-li-content-bg z-10">
									<button
										ref={registerNavRef(`section:${status}`)}
										type="button"
										data-nav-id={`section:${status}`}
										onFocus={() => setActiveNavId(`section:${status}`)}
										tabIndex={getTabIndex(`section:${status}`)}
										className={cn(
											'flex items-center gap-2 rounded px-1.5 py-0.5 outline-none transition-colors',
											activeNavId === `section:${status}` && 'bg-li-bg-hover'
										)}
									>
										<span
											className="h-2 w-2 rounded-full"
											style={{ backgroundColor: statusOpt?.color }}
										/>
										<span className="text-[12px] font-medium text-li-text-bright">
											{statusOpt?.label ?? status}
										</span>
										<span className="text-[11px] text-li-text-muted">
											{groupIssues.length}
										</span>
									</button>
								</div>
								{groupIssues.map((issue) => {
									return (
										<IssueRow
											key={issue.id}
											issue={issue}
											expanded={expandedId === issue.id}
											focused={activeNavId === `issue:${issue.id}`}
											navId={`issue:${issue.id}`}
											tabIndex={getTabIndex(`issue:${issue.id}`)}
											rowRef={registerNavRef(`issue:${issue.id}`)}
											onFocus={() => setActiveNavId(`issue:${issue.id}`)}
											onToggle={() =>
												setExpandedId(
													expandedId === issue.id ? null : issue.id
												)
											}
											onStatusChange={handleStatusChange}
											onPriorityChange={handlePriorityChange}
											onOpenFull={(i) => navigate(`/issues/${i.id}`)}
										/>
									)
								})}
							</div>
						)
					})
				)}
			</div>

			<CreateIssueModal open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	)
}
