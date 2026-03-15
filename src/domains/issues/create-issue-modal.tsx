import { zodResolver } from '@hookform/resolvers/zod'
import { notify } from '@remcostoeten/notifier'
import {
	Check,
	ChevronDown,
	Circle,
	Folder,
	Minus,
	Plus,
	Tag,
	X
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { IssueStatus, Priority } from '@/domains/issues/types'

import { Button } from '@/shared/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/shared/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
	useCreateIssue,
	useCreateIssueLabel,
	useCreateIssueProject,
	useDeleteIssueLabel,
	useIssueLabels,
	useIssueProjects
} from '@/domains/issues/hooks/use-issues'
import { cn } from '@/shared/lib/utils'

import { PRIORITY_OPTIONS, STATUS_OPTIONS } from './options'

const createIssueSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'Title is required')
		.max(200, 'Title must be under 200 characters'),
	description: z.string().max(5000, 'Description must be under 5000 characters').default(''),
	status: z.enum(['backlog', 'todo', 'in_progress', 'done', 'cancelled']).default('backlog'),
	priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).default('none'),
	projectId: z.string().default(''),
	labelIds: z.array(z.string()).default([])
})

const createProjectSchema = z.object({
	name: z.string().trim().min(2, 'Project name is required').max(80, 'Project name is too long')
})

const createLabelSchema = z.object({
	name: z.string().trim().min(2, 'Label name is required').max(40, 'Label name is too long'),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{6})$/, 'Pick a valid hex color')
		.default('#8b5cf6')
})

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

type CreateIssueForm = z.infer<typeof createIssueSchema>

type CreateIssueModalProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateIssueModal({ open, onOpenChange }: CreateIssueModalProps) {
	const createIssue = useCreateIssue()
	const createProject = useCreateIssueProject()
	const createLabel = useCreateIssueLabel()
	const deleteLabel = useDeleteIssueLabel()
	const { data: projects = [] } = useIssueProjects()
	const { data: labels = [] } = useIssueLabels()
	const [selectedLabels, setSelectedLabels] = useState<string[]>([])
	const [labelQuery, setLabelQuery] = useState('')
	const [labelDraft, setLabelDraft] = useState({ name: '', color: '#8b5cf6' })
	const [projectQuery, setProjectQuery] = useState('')
	const [projectError, setProjectError] = useState<string | null>(null)
	const [labelError, setLabelError] = useState<string | null>(null)

	const form = useForm<CreateIssueForm>({
		resolver: zodResolver(createIssueSchema),
		defaultValues: {
			title: '',
			description: '',
			status: 'backlog',
			priority: 'none',
			projectId: '',
			labelIds: []
		}
	})

	useEffect(() => {
		if (!open) {
			form.reset()
			setSelectedLabels([])
			setLabelQuery('')
			setProjectQuery('')
			setLabelDraft({ name: '', color: '#8b5cf6' })
			setProjectError(null)
			setLabelError(null)
		}
	}, [form, open])

	const selectedProject = projects.find((project) => project.id === form.watch('projectId'))
	const selectedStatus = STATUS_OPTIONS.find((option) => option.value === form.watch('status'))
	const selectedPriority = PRIORITY_OPTIONS.find((option) => option.value === form.watch('priority'))

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

	const onSubmit = (data: CreateIssueForm) => {
		void notify
			.promise(
				createIssue.mutateAsync({
					title: data.title,
					description: data.description.trim() || undefined,
					status: data.status,
					priority: data.priority,
					projectId: data.projectId || null,
					labelIds: selectedLabels
				}),
				{
					loading: 'Creating issue...',
					success: 'Issue created',
					error: (error) =>
						error instanceof Error ? error.message : 'Failed to create issue'
				}
			)
			.then(() => onOpenChange(false))
	}

	const toggleLabel = (labelId: string) => {
		setSelectedLabels((current) =>
			current.includes(labelId)
				? current.filter((currentId) => currentId !== labelId)
				: [...current, labelId]
		)
	}

	const handleCreateProject = () => {
		const parsed = createProjectSchema.safeParse({ name: projectQuery })
		if (!parsed.success) {
			setProjectError(parsed.error.issues[0]?.message ?? 'Invalid project')
			return
		}

		setProjectError(null)
		void notify
			.promise(createProject.mutateAsync({ name: parsed.data.name }), {
				loading: 'Creating project...',
				success: 'Project created',
				error: (error) =>
					error instanceof Error ? error.message : 'Failed to create project'
			})
			.then((project) => {
				setProjectQuery('')
				form.setValue('projectId', project.id)
			})
	}

	const handleCreateLabel = () => {
		const parsed = createLabelSchema.safeParse({
			name: labelDraft.name || labelQuery,
			color: labelDraft.color
		})
		if (!parsed.success) {
			setLabelError(parsed.error.issues[0]?.message ?? 'Invalid label')
			return
		}

		setLabelError(null)
		void notify
			.promise(
				createLabel.mutateAsync({ name: parsed.data.name, color: parsed.data.color }),
				{
					loading: 'Creating label...',
					success: 'Label created',
					error: (error) =>
						error instanceof Error ? error.message : 'Failed to create label'
				}
			)
			.then((label) => {
				setSelectedLabels((current) => [...current, label.id])
				setLabelDraft((current) => ({ ...current, name: '' }))
				setLabelQuery('')
			})
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="overflow-hidden border-li-content-border bg-[#111214] p-0 text-li-text-bright sm:max-w-[1120px] sm:rounded-[14px] max-sm:h-[100svh] max-sm:max-w-none max-sm:rounded-none">
				<DialogHeader className="border-b border-white/6 px-4 py-4 sm:px-6">
					<DialogTitle className="text-[14px] font-medium text-li-text-muted">
						Create issue
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid min-h-[700px] grid-cols-1 lg:grid-cols-[1fr_320px]"
				>
					<div className="flex min-h-0 flex-col lg:border-r lg:border-white/6">
						<div className="flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
							<input
								{...form.register('title')}
								placeholder="Issue title"
								autoFocus
								className="mb-5 w-full bg-transparent text-[28px] font-semibold tracking-[-0.03em] text-white outline-none placeholder:text-white/28 sm:text-[32px] lg:text-[34px]"
							/>
							{form.formState.errors.title && (
								<p className="mb-4 text-[12px] text-li-dot-red">
									{form.formState.errors.title.message}
								</p>
							)}
							<textarea
								{...form.register('description')}
								placeholder="Add description..."
								rows={12}
								className="min-h-[220px] w-full resize-none bg-transparent text-[14px] leading-6 text-white/86 outline-none placeholder:text-white/32 sm:min-h-[280px] sm:text-[15px] sm:leading-7"
							/>
						</div>

						<div className="flex flex-col gap-4 border-t border-white/6 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex flex-wrap items-center gap-2">
								{selectedProject && (
									<span className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-white/75">
										{selectedProject.key}
									</span>
								)}
								{selectedPriority?.value !== 'none' && (
									<span className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-white/75">
										{selectedPriority?.label}
									</span>
								)}
								{selectedLabels.map((labelId) => {
									const label = labels.find((item) => item.id === labelId)
									if (!label) return null
									return (
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
									)
								})}
							</div>

							<div className="flex items-center justify-end gap-2">
								<DialogClose asChild>
									<Button
										type="button"
										variant="ghost"
										className="h-9 text-[12px] text-li-text-muted hover:bg-white/[0.04] hover:text-li-text-bright"
									>
										Cancel
									</Button>
								</DialogClose>
								<Button
									type="submit"
									disabled={createIssue.isPending}
									className="h-9 bg-white/[0.08] px-4 text-[12px] hover:bg-white/[0.12]"
								>
									{createIssue.isPending ? 'Creating…' : 'Create'}
								</Button>
							</div>
						</div>
					</div>

					<div className="space-y-3 border-t border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:border-t-0 lg:px-6 lg:py-8">
						<PropertyCard label="Properties">
							<PickerRow>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[14px] text-white/78 transition-colors hover:bg-white/[0.045]">
											<Circle
												className="h-4 w-4"
												style={{ color: selectedStatus?.color }}
											/>
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
												onClick={() => form.setValue('status', option.value as IssueStatus)}
												className="rounded-[8px] px-3 py-2 text-[13px] text-white/82 focus:bg-white/[0.05]"
											>
												<Circle
													className="mr-3 h-4 w-4"
													style={{ color: option.color }}
												/>
												<span>{option.label}</span>
												{form.watch('status') === option.value && (
													<Check className="ml-auto h-4 w-4 text-white/70" />
												)}
												<span className="ml-3 text-[12px] text-white/30">{index + 1}</span>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</PickerRow>

							<PickerRow>
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
												onClick={() => form.setValue('priority', option.value as Priority)}
												className="rounded-[8px] px-3 py-2 text-[13px] text-white/82 focus:bg-white/[0.05]"
											>
												<span>{option.label}</span>
												{form.watch('priority') === option.value && (
													<Check className="ml-auto h-4 w-4 text-white/70" />
												)}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</PickerRow>
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
												setLabelError(null)
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
											const selected = selectedLabels.includes(label.id)
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
															setSelectedLabels((current) =>
																current.filter((id) => id !== label.id)
															)
															deleteLabel.mutate(label.id)
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
										<div className="mb-2 text-[12px] text-white/42">
											Pick a color for label
										</div>
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
										<Button
											type="button"
											onClick={handleCreateLabel}
											disabled={createLabel.isPending}
											className="h-8 w-full bg-white/[0.08] text-[12px] hover:bg-white/[0.12]"
										>
											<Plus className="h-3.5 w-3.5" />
											Create label
										</Button>
										{labelError && (
											<p className="mt-2 text-[11px] text-li-dot-red">{labelError}</p>
										)}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>

							<div className="mt-3 flex flex-wrap gap-2">
								{selectedLabels.length === 0 ? (
									<span className="px-1 text-[12px] text-white/32">No labels yet</span>
								) : (
									selectedLabels.map((labelId) => {
										const label = labels.find((item) => item.id === labelId)
										if (!label) return null
										return (
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
										)
									})
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
											onChange={(event) => {
												setProjectError(null)
												setProjectQuery(event.target.value)
											}}
											placeholder="Add to project..."
											className="h-9 border-white/8 bg-transparent text-[13px] text-white placeholder:text-white/32"
										/>
									</div>
									<div className="max-h-[220px] overflow-auto p-2">
										<button
											type="button"
											onClick={() => form.setValue('projectId', '')}
											className="flex w-full items-center rounded-[8px] px-3 py-2 text-[13px] text-white/58 hover:bg-white/[0.05]"
										>
											No project
										</button>
										{filteredProjects.map((project) => (
											<DropdownMenuItem
												key={project.id}
												onClick={() => form.setValue('projectId', project.id)}
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
										<Button
											type="button"
											onClick={handleCreateProject}
											disabled={createProject.isPending}
											className="h-8 w-full bg-white/[0.08] text-[12px] hover:bg-white/[0.12]"
										>
											<Plus className="h-3.5 w-3.5" />
											Create new project
										</Button>
										{projectError && (
											<p className="mt-2 text-[11px] text-li-dot-red">{projectError}</p>
										)}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</PropertyCard>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

function PropertyCard({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<section className="rounded-[12px] border border-white/7 bg-white/[0.03] p-4">
			<div className="mb-3 flex items-center gap-1 text-[12px] font-medium text-white/45">
				<span>{label}</span>
				<ChevronDown className="h-3 w-3" />
			</div>
			{children}
		</section>
	)
}

function PickerRow({ children }: { children: React.ReactNode }) {
	return <div className="rounded-[10px]">{children}</div>
}
