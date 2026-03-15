'use client'

import { notify } from '@remcostoeten/notifier'
import { format, formatDistanceToNow } from 'date-fns'
import {
	ArrowLeft,
	Check,
	ChevronDown,
	Circle,
	Clock,
	FileText,
	Folder,
	Minus,
	Plus,
	Tag,
	Trash2,
	X
} from 'lucide-react'
import { useMemo, useState } from 'react'

import type { ActivityEvent, Issue, IssueStatus, Priority } from '@/domains/issues/types'

import { MarkdownEditor, MarkdownPreview } from '@/shared/components/markdown-editor'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { useNavigate } from '@/shared/lib/navigation'
import { cn } from '@/shared/lib/utils'
import { useRouteShortcuts } from '@/shell/hooks/use-route-shortcuts'

import {
	useCreateIssueLabel,
	useCreateIssueProject,
	useDestroyIssue,
	useDeleteIssueLabel,
	useIssue,
	useIssueLabels,
	useIssueProjects,
	useUpdateIssue
} from './hooks/use-issues'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from './options'

const COLOR_OPTIONS = [
	{ value: '#9ca3af', label: 'Grey' },
	{ value: '#6b7280', label: 'Dark Grey' },
	{ value: '#8b5cf6', label: 'Purple' },
	{ value: '#14b8a6', label: 'Teal' },
	{ value: '#22c55e', label: 'Green' },
	{ value: '#eab308', label: 'Yellow' },
	{ value: '#f97316', label: 'Orange' },
	{ value: '#f9a8d4', label: 'Pink' },
	{ value: '#ef4444', label: 'Red' }
]

function ActivityItem({ event }: { event: ActivityEvent }) {
	const icon = (() => {
		switch (event.type) {
			case 'status_change':
				return <Circle className="h-3.5 w-3.5 text-li-status-progress" />
			case 'priority_change':
				return <Minus className="h-3.5 w-3.5 text-li-priority-high" />
			case 'label_added':
			case 'label_removed':
				return <Tag className="h-3.5 w-3.5 text-li-dot-purple" />
			case 'created':
				return <FileText className="h-3.5 w-3.5 text-li-dot-green" />
			default:
				return <Clock className="h-3.5 w-3.5 text-li-text-muted" />
		}
	})()

	const description = (() => {
		switch (event.type) {
			case 'status_change':
				return (
					<>
						changed status from <strong>{event.from}</strong> to <strong>{event.to}</strong>
					</>
				)
			case 'priority_change':
				return (
					<>
						changed priority from <strong>{event.from}</strong> to <strong>{event.to}</strong>
					</>
				)
			case 'label_added':
				return (
					<>
						added label <strong>{event.to}</strong>
					</>
				)
			case 'label_removed':
				return (
					<>
						removed label <strong>{event.from}</strong>
					</>
				)
			case 'created':
				return 'created this issue'
			case 'description_changed':
				return 'updated the description'
			default:
				return (
					<>
						updated <strong>{event.field}</strong>
					</>
				)
		}
	})()

	return (
		<div className="flex items-start gap-3 rounded-[10px] border border-white/6 bg-white/[0.02] px-4 py-3">
			<div className="mt-0.5 rounded-[8px] bg-white/[0.05] p-1.5">{icon}</div>
			<div className="min-w-0 flex-1">
				<div className="text-[13px] leading-6 text-white/68">
					<span className="font-medium text-white/88">{event.userName}</span> {description}
				</div>
				<div className="mt-1 text-[11px] text-white/36">
					{format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
				</div>
			</div>
		</div>
	)
}

type IssueDetailViewProps = {
	issue: Issue
}

export function IssueDetailView({ issue: initialIssue }: IssueDetailViewProps) {
	const navigate = useNavigate()
	const updateIssue = useUpdateIssue()
	const destroyIssue = useDestroyIssue()
	const createProject = useCreateIssueProject()
	const createLabel = useCreateIssueLabel()
	const deleteLabel = useDeleteIssueLabel()
	const { data: issue, isLoading } = useIssue(initialIssue.id, initialIssue)
	const { data: projects = [] } = useIssueProjects()
	const { data: labels = [] } = useIssueLabels()
	const [editingTitle, setEditingTitle] = useState(false)
	const [titleValue, setTitleValue] = useState('')
	const [editingDesc, setEditingDesc] = useState(false)
	const [descValue, setDescValue] = useState('')
	const [projectQuery, setProjectQuery] = useState('')
	const [labelQuery, setLabelQuery] = useState('')
	const [labelDraft, setLabelDraft] = useState({ name: '', color: '#8b5cf6' })

	useRouteShortcuts({
		onEdit: () => {
			if (!issue) return
			setDescValue(issue.description ?? '')
			setEditingDesc(true)
		},
		onFocusInput: () => {
			if (!issue) return
			setDescValue(issue.description ?? '')
			setEditingDesc(true)
		},
		onSave: () => {
			if (!issue || !editingDesc) return
			handleDescSave(issue.id)
		}
	})

	const filteredLabels = useMemo(() => {
		const query = labelQuery.trim().toLowerCase()
		if (!query) return labels
		return labels.filter((label) => label.name.toLowerCase().includes(query))
	}, [labelQuery, labels])

	const filteredProjects = useMemo(() => {
		const query = projectQuery.trim().toLowerCase()
		if (!query) return projects
		return projects.filter(
			(project) =>
				project.name.toLowerCase().includes(query) || project.key.toLowerCase().includes(query)
		)
	}, [projectQuery, projects])

	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center bg-li-content-bg">
				<span className="text-sm text-li-text-muted">Loading issue…</span>
			</div>
		)
	}

	if (!issue) {
		return (
			<div className="flex flex-1 items-center justify-center bg-li-content-bg">
				<div className="space-y-2 text-center">
					<p className="text-sm text-li-text-muted">Issue not found</p>
					<button
						onClick={() => navigate(-1)}
						className="text-[12px] text-li-text-muted hover:text-li-text-bright"
					>
						Go back
					</button>
				</div>
			</div>
		)
	}

	const selectedStatus = STATUS_OPTIONS.find((option) => option.value === issue.status)
	const selectedPriority = PRIORITY_OPTIONS.find((option) => option.value === issue.priority)
	const selectedProject = projects.find((project) => project.id === issue.projectId)
	const selectedLabelIds = issue.labels.map((label) => label.id)
	const sortedActivity = [...(issue.activity ?? [])].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	)

	function handleTitleSave() {
		const trimmed = titleValue.trim()
		if (trimmed && trimmed !== issue.title) {
			void notify.promise(updateIssue.mutateAsync({ id: issue.id, input: { title: trimmed } }), {
				loading: 'Saving title...',
				success: 'Title updated',
				error: (error) => (error instanceof Error ? error.message : 'Failed to update title')
			})
		}
		setEditingTitle(false)
	}

	function handleDescSave(issueId: string) {
		void notify.promise(
			updateIssue.mutateAsync({
				id: issueId,
				input: { description: descValue.trim() || null }
			}),
			{
				loading: 'Saving description...',
				success: 'Description updated',
				error: (error) =>
					error instanceof Error ? error.message : 'Failed to update description'
			}
		)
		setEditingDesc(false)
	}

	function toggleLabel(labelId: string) {
		const next = selectedLabelIds.includes(labelId)
			? selectedLabelIds.filter((id) => id !== labelId)
			: [...selectedLabelIds, labelId]

		void updateIssue.mutateAsync({ id: issue.id, input: { labelIds: next } }).catch((error) => {
			notify.error(error instanceof Error ? error.message : 'Failed to update labels')
		})
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col bg-[#111214]">
			<div className="flex h-12 items-center gap-3 border-b border-white/6 px-4 shrink-0 sm:px-5">
				<button
					onClick={() => navigate(-1)}
					className="rounded-[8px] p-1.5 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/82"
				>
					<ArrowLeft className="h-4 w-4" />
				</button>
				<span className="text-[12px] text-white/42">{issue.identifier}</span>
				<span className="text-[11px] text-white/18">/</span>
				<span className="text-[12px] text-white/42">{issue.projectName ?? 'No project'}</span>
			</div>

			<div className="flex-1 overflow-auto">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-8 lg:py-10">
					<div className="min-w-0">
						<div className="mb-8 flex flex-wrap items-center gap-2">
							{selectedProject && (
								<span className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-white/72">
									{selectedProject.key}
								</span>
							)}
							{selectedPriority?.value !== 'none' && (
								<span className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-white/72">
									{selectedPriority?.label}
								</span>
							)}
							{issue.labels.map((label) => (
								<span
									key={label.id}
									className="rounded-full px-3 py-1 text-[12px]"
									style={{
										color: label.color,
										backgroundColor: `${label.color}20`
									}}
								>
									{label.name}
								</span>
							))}
						</div>

						<div className="mb-8">
							{editingTitle ? (
								<input
									autoFocus
									value={titleValue}
									onChange={(event) => setTitleValue(event.target.value)}
									onBlur={handleTitleSave}
									onKeyDown={(event) => {
										if (event.key === 'Enter') handleTitleSave()
										if (event.key === 'Escape') setEditingTitle(false)
									}}
									maxLength={200}
									className="w-full bg-transparent text-[28px] font-semibold tracking-[-0.03em] text-white outline-none sm:text-[32px] lg:text-[36px]"
								/>
							) : (
								<h1
									className="cursor-pointer text-[28px] font-semibold tracking-[-0.03em] text-white transition-colors hover:text-white/84 sm:text-[32px] lg:text-[36px]"
									onClick={() => {
										setTitleValue(issue.title)
										setEditingTitle(true)
									}}
								>
									{issue.title}
								</h1>
							)}
						</div>

						<section className="mb-10">
							<div className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white/32">
								Description
							</div>
							{editingDesc ? (
								<MarkdownEditor
									value={descValue}
									onChange={setDescValue}
									onBlur={() => handleDescSave(issue.id)}
									placeholder="Write a description using markdown..."
									maxLength={5000}
									minRows={10}
									className="border-white/8 bg-white/[0.02]"
								/>
							) : (
								<button
									type="button"
									onClick={() => {
										setDescValue(issue.description ?? '')
										setEditingDesc(true)
									}}
									className="block min-h-[180px] w-full rounded-[14px] border border-white/6 bg-white/[0.02] px-4 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-6 sm:py-5"
								>
									{issue.description ? (
										<MarkdownPreview
											content={issue.description}
											className="[&_p]:text-[15px] [&_p]:leading-7 [&_ul]:text-[15px] [&_ol]:text-[15px]"
										/>
									) : (
										<span className="text-[14px] italic text-white/32">
											Click to add a description...
										</span>
									)}
								</button>
							)}
						</section>

						<section>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-[18px] font-semibold text-white">Activity</h2>
								<span className="text-[12px] text-white/32">
									Updated {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
								</span>
							</div>

							{sortedActivity.length > 0 ? (
								<div className="space-y-3">
									{sortedActivity.map((event) => (
										<ActivityItem key={event.id} event={event} />
									))}
								</div>
							) : (
								<div className="rounded-[12px] border border-white/6 bg-white/[0.02] px-4 py-3 text-[13px] italic text-white/32">
									No activity yet
								</div>
							)}
						</section>
					</div>

					<div className="space-y-3 lg:sticky lg:top-6">
						<PropertyCard label="Properties">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[14px] text-white/78 transition-colors hover:bg-white/[0.045]">
										<Circle className="h-4 w-4" style={{ color: selectedStatus?.color }} />
										<span>{selectedStatus?.label}</span>
										<ChevronDown className="ml-auto h-3.5 w-3.5 text-white/35" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-[min(280px,calc(100vw-2rem))] rounded-[12px] border-white/10 bg-[#191a1d] p-2"
								>
									{STATUS_OPTIONS.map((option, index) => (
										<DropdownMenuItem
											key={option.value}
											onClick={() =>
												void updateIssue
													.mutateAsync({
														id: issue.id,
														input: { status: option.value as IssueStatus }
													})
													.catch((error) => {
														notify.error(
															error instanceof Error
																? error.message
																: 'Failed to update status'
														)
													})
											}
											className="rounded-[8px] px-3 py-2 text-[13px] text-white/82 focus:bg-white/[0.05]"
										>
											<Circle className="mr-3 h-4 w-4" style={{ color: option.color }} />
											<span>{option.label}</span>
											{issue.status === option.value && (
												<Check className="ml-auto h-4 w-4 text-white/70" />
											)}
											<span className="ml-3 text-[12px] text-white/30">{index + 1}</span>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[14px] text-white/58 transition-colors hover:bg-white/[0.045]">
										<Minus className="h-4 w-4" />
										<span>
											{selectedPriority?.value === 'none'
												? 'Set priority'
												: selectedPriority?.label}
										</span>
										<ChevronDown className="ml-auto h-3.5 w-3.5 text-white/35" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-[min(240px,calc(100vw-2rem))] rounded-[12px] border-white/10 bg-[#191a1d] p-2"
								>
									{PRIORITY_OPTIONS.map((option) => (
										<DropdownMenuItem
											key={option.value}
											onClick={() =>
												void updateIssue
													.mutateAsync({
														id: issue.id,
														input: { priority: option.value as Priority }
													})
													.catch((error) => {
														notify.error(
															error instanceof Error
																? error.message
																: 'Failed to update priority'
														)
													})
											}
											className="rounded-[8px] px-3 py-2 text-[13px] text-white/82 focus:bg-white/[0.05]"
										>
											<span>{option.label}</span>
											{issue.priority === option.value && (
												<Check className="ml-auto h-4 w-4 text-white/70" />
											)}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</PropertyCard>

						<PropertyCard label="Labels">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex w-full items-center gap-2 rounded-full bg-white/[0.055] px-3 py-2 text-[13px] text-white/58 transition-colors hover:bg-white/[0.08]">
										<Tag className="h-3.5 w-3.5" />
										<span>Add label</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-[min(300px,calc(100vw-2rem))] rounded-[12px] border-white/10 bg-[#191a1d] p-0"
								>
									<div className="border-b border-white/6 p-3">
										<Input
											value={labelQuery}
											onChange={(event) => {
												setLabelQuery(event.target.value)
												setLabelDraft((current) => ({
													...current,
													name: event.target.value
												}))
											}}
											placeholder="Add labels..."
											className="h-9 border-white/8 bg-transparent text-[13px] text-white placeholder:text-white/32"
										/>
									</div>
									<div className="max-h-[220px] overflow-auto p-2">
										{filteredLabels.map((label) => {
											const selected = selectedLabelIds.includes(label.id)
											return (
												<DropdownMenuItem
													key={label.id}
													onSelect={(event) => {
														event.preventDefault()
														toggleLabel(label.id)
													}}
													className="rounded-[8px] px-3 py-2 text-[13px] text-white/82 focus:bg-white/[0.05]"
												>
													<span
														className="mr-3 h-2.5 w-2.5 rounded-full"
														style={{ backgroundColor: label.color }}
													/>
													<span>{label.name}</span>
													{selected && (
														<Check className="ml-auto h-4 w-4 text-white/70" />
													)}
													<button
														type="button"
														onClick={(event) => {
															event.stopPropagation()
															void notify
																.confirm(`Delete ${label.name}?`, {
																	confirmLabel: 'Delete',
																	cancelLabel: 'Keep'
																})
																.then((confirmed) => {
																	if (!confirmed) return
																	return notify.promise(deleteLabel.mutateAsync(label.id), {
																		loading: 'Deleting label...',
																		success: 'Label deleted',
																		error: (error) =>
																			error instanceof Error
																				? error.message
																				: 'Failed to delete label'
																	})
																})
														}}
														className="ml-2 text-white/30 hover:text-white/80"
													>
														<X className="h-3.5 w-3.5" />
													</button>
												</DropdownMenuItem>
											)
										})}
									</div>
									<DropdownMenuSeparator className="bg-white/6" />
									<div className="p-3">
										<div className="mb-2 text-[12px] text-white/42">Pick a color for label</div>
										<div className="mb-3 grid grid-cols-3 gap-2">
											{COLOR_OPTIONS.map((option) => (
												<button
													key={option.value}
													type="button"
													onClick={() =>
														setLabelDraft((current) => ({
															...current,
															color: option.value
														}))
													}
													className={cn(
														'flex items-center gap-2 rounded-[8px] border px-2 py-2 text-left text-[12px] text-white/74 transition-colors',
														labelDraft.color === option.value
															? 'border-white/20 bg-white/[0.06]'
															: 'border-white/6 hover:bg-white/[0.04]'
													)}
												>
													<span
														className="h-2.5 w-2.5 rounded-full"
														style={{ backgroundColor: option.value }}
													/>
													<span>{option.label}</span>
												</button>
											))}
										</div>
										<button
											type="button"
											onClick={() => {
												if (!(labelDraft.name || labelQuery).trim()) return
												void notify
													.promise(
														createLabel.mutateAsync({
															name: (labelDraft.name || labelQuery).trim(),
															color: labelDraft.color
														}),
														{
															loading: 'Creating label...',
															success: 'Label created',
															error: (error) =>
																error instanceof Error
																	? error.message
																	: 'Failed to create label'
														}
													)
													.then((label) => {
														setLabelDraft((current) => ({ ...current, name: '' }))
														setLabelQuery('')
														return updateIssue.mutateAsync({
															id: issue.id,
															input: { labelIds: [...selectedLabelIds, label.id] }
														})
													})
													.catch((error) => {
														notify.error(
															error instanceof Error
																? error.message
																: 'Failed to update labels'
														)
													})
											}}
											className="flex h-8 w-full items-center justify-center gap-2 rounded-[8px] bg-white/[0.08] text-[12px] text-white transition-colors hover:bg-white/[0.12]"
										>
											<Plus className="h-3.5 w-3.5" />
											Create label
										</button>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>

							<div className="mt-3 flex flex-wrap gap-2">
								{issue.labels.length === 0 ? (
									<span className="px-1 text-[12px] text-white/32">No labels yet</span>
								) : (
									issue.labels.map((label) => (
										<button
											key={label.id}
											type="button"
											onClick={() => toggleLabel(label.id)}
											className="rounded-full px-3 py-1 text-[12px]"
											style={{
												color: label.color,
												backgroundColor: `${label.color}20`
											}}
										>
											{label.name}
										</button>
									))
								)}
							</div>
						</PropertyCard>

						<PropertyCard label="Project">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="flex w-full items-center gap-2 rounded-full bg-white/[0.055] px-3 py-2 text-[13px] text-white/58 transition-colors hover:bg-white/[0.08]">
										<Folder className="h-3.5 w-3.5" />
										<span>{selectedProject ? selectedProject.name : 'Add to project'}</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-[min(320px,calc(100vw-2rem))] rounded-[12px] border-white/10 bg-[#191a1d] p-0"
								>
									<div className="border-b border-white/6 p-3">
										<Input
											value={projectQuery}
											onChange={(event) => setProjectQuery(event.target.value)}
											placeholder="Add to project..."
											className="h-9 border-white/8 bg-transparent text-[13px] text-white placeholder:text-white/32"
										/>
									</div>
									<div className="max-h-[220px] overflow-auto p-2">
										<button
											type="button"
											onClick={() =>
												void updateIssue
													.mutateAsync({ id: issue.id, input: { projectId: null } })
													.catch((error) => {
														notify.error(
															error instanceof Error
																? error.message
																: 'Failed to update project'
														)
													})
											}
											className="flex w-full items-center rounded-[8px] px-3 py-2 text-[13px] text-white/58 hover:bg-white/[0.05]"
										>
											No project
										</button>
										{filteredProjects.map((project) => (
											<DropdownMenuItem
												key={project.id}
												onClick={() =>
													void updateIssue
														.mutateAsync({
															id: issue.id,
															input: { projectId: project.id }
														})
														.catch((error) => {
															notify.error(
																error instanceof Error
																	? error.message
																	: 'Failed to update project'
															)
														})
												}
												className="rounded-[8px] px-3 py-2 text-[13px] text-white/82 focus:bg-white/[0.05]"
											>
												<Folder className="mr-3 h-3.5 w-3.5 text-white/45" />
												<span>{project.name}</span>
												<span className="ml-2 text-[12px] text-white/30">{project.key}</span>
												{selectedProject?.id === project.id && (
													<Check className="ml-auto h-4 w-4 text-white/70" />
												)}
											</DropdownMenuItem>
										))}
									</div>
									<DropdownMenuSeparator className="bg-white/6" />
									<div className="p-3">
										<button
											type="button"
											onClick={() => {
												if (!projectQuery.trim()) return
												void notify
													.promise(createProject.mutateAsync({ name: projectQuery.trim() }), {
														loading: 'Creating project...',
														success: 'Project created',
														error: (error) =>
															error instanceof Error
																? error.message
																: 'Failed to create project'
													})
													.then((project) => {
														setProjectQuery('')
														return updateIssue.mutateAsync({
															id: issue.id,
															input: { projectId: project.id }
														})
													})
													.catch((error) => {
														notify.error(
															error instanceof Error
																? error.message
																: 'Failed to update project'
														)
													})
											}}
											className="flex h-8 w-full items-center justify-center gap-2 rounded-[8px] bg-white/[0.08] text-[12px] text-white transition-colors hover:bg-white/[0.12]"
										>
											<Plus className="h-3.5 w-3.5" />
											Create new project
										</button>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</PropertyCard>

						<PropertyCard label="Details">
							<DetailRow label="Created" value={format(new Date(issue.createdAt), 'MMM d, yyyy')} />
							<DetailRow
								label="Updated"
								value={formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}
							/>
							{issue.parentTitle && <DetailRow label="Parent issue" value={issue.parentTitle} />}
						</PropertyCard>

						<PropertyCard label="Danger zone">
							<button
								type="button"
								onClick={() => {
									void notify
										.confirm(`Delete ${issue.identifier}?`, {
											confirmLabel: 'Delete',
											cancelLabel: 'Keep'
										})
										.then(async (confirmed) => {
											if (!confirmed) return
											await notify.promise(destroyIssue.mutateAsync(issue.id), {
												loading: 'Deleting issue...',
												success: 'Issue deleted',
												error: (error) =>
													error instanceof Error
														? error.message
														: 'Failed to delete issue'
											})
											navigate('/my-issues')
										})
								}}
								className="flex h-9 w-full items-center justify-center rounded-[8px] border border-red-500/20 bg-red-500/8 text-[12px] font-medium text-red-300 transition-colors hover:bg-red-500/12"
							>
								Delete issue
							</button>
						</PropertyCard>
					</div>
				</div>
			</div>
		</div>
	)
}

function PropertyCard({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<section className="rounded-[12px] border border-white/7 bg-white/[0.03] p-4">
			<div className="mb-3 flex items-center gap-1 text-[12px] font-medium text-white/45">
				<span>{label}</span>
				<ChevronDown className="h-3 w-3" />
			</div>
			<div className="space-y-2">{children}</div>
		</section>
	)
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-3 rounded-[10px] px-3 py-2 text-[13px]">
			<span className="text-white/42">{label}</span>
			<span className="text-right text-white/74">{value}</span>
		</div>
	)
}
