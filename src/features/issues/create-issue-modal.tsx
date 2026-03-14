import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { IssueStatus, Priority } from '@/services'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { useCreateIssue } from '@/hooks/use-issues'
import { getProjectService } from '@/services'

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
	{ value: 'backlog', label: 'Backlog' },
	{ value: 'todo', label: 'Todo' },
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'done', label: 'Done' }
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
	{ value: 'none', label: 'No priority' },
	{ value: 'low', label: 'Low' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'high', label: 'High' },
	{ value: 'urgent', label: 'Urgent' }
]

const LABEL_OPTIONS = [
	{ id: 'l1', name: 'CRUD' },
	{ id: 'l2', name: 'Database' },
	{ id: 'l3', name: 'Feature' },
	{ id: 'l4', name: 'Bug' }
]

const createIssueSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'Title is required')
		.max(200, 'Title must be under 200 characters'),
	status: z.enum(['backlog', 'todo', 'in_progress', 'done', 'cancelled']).default('todo'),
	priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).default('none'),
	projectId: z.string().optional(),
	labelIds: z.array(z.string()).default([])
})

type CreateIssueForm = z.infer<typeof createIssueSchema>

interface CreateIssueModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateIssueModal({ open, onOpenChange }: CreateIssueModalProps) {
	const createIssue = useCreateIssue()
	const { data: projects = [] } = useQuery({
		queryKey: ['projects'],
		queryFn: () => getProjectService().list()
	})

	const form = useForm<CreateIssueForm>({
		resolver: zodResolver(createIssueSchema),
		defaultValues: {
			title: '',
			status: 'todo',
			priority: 'none',
			projectId: '',
			labelIds: []
		}
	})

	const [selectedLabels, setSelectedLabels] = useState<string[]>([])

	const toggleLabel = (id: string) => {
		setSelectedLabels((prev) =>
			prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
		)
	}

	const onSubmit = (data: CreateIssueForm) => {
		createIssue.mutate(
			{
				title: data.title,
				status: data.status,
				priority: data.priority,
				projectId: data.projectId || undefined,
				labelIds: selectedLabels.length > 0 ? selectedLabels : undefined
			},
			{
				onSuccess: () => {
					form.reset()
					setSelectedLabels([])
					onOpenChange(false)
				}
			}
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-li-content-bg border-li-content-border text-li-text-bright sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle className="text-li-text-bright text-[15px]">
						Create issue
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{/* Title */}
					<div className="space-y-1.5">
						<Label className="text-[12px] text-li-text-muted">Title</Label>
						<Input
							{...form.register('title')}
							placeholder="Issue title"
							autoFocus
							className="bg-li-bg border-li-border text-li-text-bright placeholder:text-li-text-muted text-[13px] h-9"
						/>
						{form.formState.errors.title && (
							<p className="text-[11px] text-li-dot-red">
								{form.formState.errors.title.message}
							</p>
						)}
					</div>

					{/* Status & Priority row */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label className="text-[12px] text-li-text-muted">Status</Label>
							<Select
								value={form.watch('status')}
								onValueChange={(v) => form.setValue('status', v as IssueStatus)}
							>
								<SelectTrigger className="bg-li-bg border-li-border text-li-text-bright text-[12px] h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-li-menu-bg border-li-menu-border">
									{STATUS_OPTIONS.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
											className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<Label className="text-[12px] text-li-text-muted">Priority</Label>
							<Select
								value={form.watch('priority')}
								onValueChange={(v) => form.setValue('priority', v as Priority)}
							>
								<SelectTrigger className="bg-li-bg border-li-border text-li-text-bright text-[12px] h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-li-menu-bg border-li-menu-border">
									{PRIORITY_OPTIONS.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
											className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Labels */}
					<div className="space-y-1.5">
						<Label className="text-[12px] text-li-text-muted">Labels</Label>
						<div className="flex flex-wrap gap-1.5">
							{LABEL_OPTIONS.map((label) => (
								<button
									key={label.id}
									type="button"
									onClick={() => toggleLabel(label.id)}
									className={`text-[11px] px-2 py-1 rounded border transition-colors ${
										selectedLabels.includes(label.id)
											? 'bg-li-bg-active border-li-text-muted text-li-text-bright'
											: 'bg-li-bg border-li-border text-li-text-muted hover:text-li-text-bright hover:border-li-text-muted'
									}`}
								>
									{label.name}
								</button>
							))}
						</div>
					</div>

					{/* Project */}
					<div className="space-y-1.5">
						<Label className="text-[12px] text-li-text-muted">Project</Label>
						<Select
							value={form.watch('projectId') || 'none'}
							onValueChange={(v) => form.setValue('projectId', v === 'none' ? '' : v)}
						>
							<SelectTrigger className="bg-li-bg border-li-border text-li-text-bright text-[12px] h-9">
								<SelectValue placeholder="No project" />
							</SelectTrigger>
							<SelectContent className="bg-li-menu-bg border-li-menu-border">
								<SelectItem
									value="none"
									className="text-[12px] text-li-text-muted hover:bg-li-menu-bg-hover cursor-pointer"
								>
									No project
								</SelectItem>
								{projects.map((proj) => (
									<SelectItem
										key={proj.id}
										value={proj.id}
										className="text-[12px] text-li-text-bright hover:bg-li-menu-bg-hover cursor-pointer"
									>
										{proj.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<DialogFooter className="gap-2 pt-2">
						<DialogClose asChild>
							<Button
								type="button"
								variant="ghost"
								className="text-[12px] text-li-text-muted hover:text-li-text-bright hover:bg-li-bg-hover h-8"
							>
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={createIssue.isPending}
							className="text-[12px] bg-li-dot-blue hover:bg-li-dot-blue/90 text-li-text-bright h-8 px-4"
						>
							{createIssue.isPending ? 'Creating…' : 'Create issue'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
