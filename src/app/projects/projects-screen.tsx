'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { notify } from '@remcostoeten/notifier'
import { FolderKanban, Hash, Plus, Tag, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
	useCreateIssueLabel,
	useCreateIssueProject,
	useDeleteIssueLabel,
	useDeleteIssueProject,
	useIssueLabels,
	useIssueProjects
} from '@/domains/issues/hooks/use-issues'

const projectSchema = z.object({
	name: z.string().trim().min(2, 'Project name is required').max(80, 'Project name is too long')
})

const labelSchema = z.object({
	name: z.string().trim().min(2, 'Label name is required').max(40, 'Label name is too long'),
	color: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Choose a valid color')
})

type ProjectForm = z.infer<typeof projectSchema>
type LabelForm = z.infer<typeof labelSchema>

export function ProjectsView() {
	const { data: projects = [] } = useIssueProjects()
	const { data: labels = [] } = useIssueLabels()
	const createProject = useCreateIssueProject()
	const deleteProject = useDeleteIssueProject()
	const createLabel = useCreateIssueLabel()
	const deleteLabel = useDeleteIssueLabel()

	const projectForm = useForm<ProjectForm>({
		resolver: zodResolver(projectSchema),
		defaultValues: { name: '' }
	})

	const labelForm = useForm<LabelForm>({
		resolver: zodResolver(labelSchema),
		defaultValues: { name: '', color: '#8b5cf6' }
	})

	return (
		<div className="flex min-h-0 flex-1 flex-col bg-li-content-bg">
			<div className="flex h-11 items-center border-b border-li-content-border px-4 shrink-0">
				<FolderKanban className="mr-2 h-4 w-4 text-li-text-muted" />
				<span className="text-[14px] font-medium text-li-text-bright">Projects & Labels</span>
			</div>

			<div className="flex-1 overflow-auto">
				<div className="mx-auto max-w-6xl px-6 py-8">
					<div className="mb-8 max-w-2xl">
						<h1 className="text-[24px] font-semibold tracking-[-0.03em] text-li-text-bright">
							Manage issue metadata
						</h1>
						<p className="mt-2 text-[14px] leading-6 text-li-text-muted">
							Projects define issue ID namespaces and labels power filtering and organization.
							Keep both clean and intentional before wiring a real backend.
						</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<section className="rounded-[14px] border border-white/7 bg-white/[0.03] p-5">
							<div className="mb-5 flex items-start justify-between">
								<div>
									<h2 className="text-[16px] font-medium text-li-text-bright">Projects</h2>
									<p className="mt-1 text-[12px] text-li-text-muted">
										Each project gets a unique short key for issue identifiers.
									</p>
								</div>
								<span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/55">
									{projects.length}
								</span>
							</div>

							<form
								onSubmit={projectForm.handleSubmit((data) => {
									void notify
										.promise(createProject.mutateAsync({ name: data.name }), {
											loading: 'Creating project...',
											success: 'Project created',
											error: (error) =>
												error instanceof Error
													? error.message
													: 'Failed to create project'
										})
										.then(() => projectForm.reset())
								})}
								className="mb-5 flex gap-2"
							>
								<Input
									{...projectForm.register('name')}
									placeholder="Create project"
									className="h-10 border-white/8 bg-white/[0.02] text-[13px] text-li-text-bright placeholder:text-white/28"
								/>
								<Button
									type="submit"
									disabled={createProject.isPending}
									className="h-10 bg-white/[0.08] px-4 text-[12px] hover:bg-white/[0.12]"
								>
									<Plus className="h-3.5 w-3.5" />
									Add
								</Button>
							</form>
							{projectForm.formState.errors.name && (
								<p className="mb-4 text-[11px] text-li-dot-red">
									{projectForm.formState.errors.name.message}
								</p>
							)}

							<div className="space-y-2">
								{projects.map((project) => (
									<div
										key={project.id}
										className="flex items-center justify-between rounded-[10px] border border-white/7 bg-white/[0.02] px-4 py-3"
									>
										<div className="min-w-0">
											<div className="text-[14px] font-medium text-li-text-bright">
												{project.name}
											</div>
											<div className="mt-1 flex items-center gap-2 text-[12px] text-li-text-muted">
												<Hash className="h-3 w-3" />
												<span>{project.key}</span>
											</div>
										</div>
										<button
											type="button"
											onClick={() => {
												void notify
													.confirm(`Delete ${project.name}?`, {
														confirmLabel: 'Delete',
														cancelLabel: 'Keep'
													})
													.then((confirmed) => {
														if (!confirmed) return
														return notify.promise(deleteProject.mutateAsync(project.id), {
															loading: 'Deleting project...',
															success: 'Project deleted',
															error: (error) =>
																error instanceof Error
																	? error.message
																	: 'Failed to delete project'
														})
													})
											}}
											className="rounded-[8px] p-2 text-li-text-muted transition-colors hover:bg-white/[0.05] hover:text-li-text-bright"
											aria-label={`Delete ${project.name}`}
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						</section>

						<section className="rounded-[14px] border border-white/7 bg-white/[0.03] p-5">
							<div className="mb-5 flex items-start justify-between">
								<div>
									<h2 className="text-[16px] font-medium text-li-text-bright">Labels</h2>
									<p className="mt-1 text-[12px] text-li-text-muted">
										Keep labels narrow enough to stay useful for filtering.
									</p>
								</div>
								<span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/55">
									{labels.length}
								</span>
							</div>

							<form
								onSubmit={labelForm.handleSubmit((data) => {
									const payload = { name: data.name, color: data.color }
									void notify
										.promise(createLabel.mutateAsync(payload), {
											loading: 'Creating label...',
											success: 'Label created',
											error: (error) =>
												error instanceof Error
													? error.message
													: 'Failed to create label'
										})
										.then(() => labelForm.reset({ name: '', color: data.color }))
								})}
								className="mb-5 flex gap-2"
							>
								<Input
									{...labelForm.register('name')}
									placeholder="Create label"
									className="h-10 border-white/8 bg-white/[0.02] text-[13px] text-li-text-bright placeholder:text-white/28"
								/>
								<input
									type="color"
									{...labelForm.register('color')}
									className="h-10 w-12 rounded-[8px] border border-white/8 bg-white/[0.02] p-1"
									aria-label="Label color"
								/>
								<Button
									type="submit"
									disabled={createLabel.isPending}
									className="h-10 bg-white/[0.08] px-4 text-[12px] hover:bg-white/[0.12]"
								>
									<Plus className="h-3.5 w-3.5" />
									Add
								</Button>
							</form>
							{(labelForm.formState.errors.name || labelForm.formState.errors.color) && (
								<p className="mb-4 text-[11px] text-li-dot-red">
									{labelForm.formState.errors.name?.message ??
										labelForm.formState.errors.color?.message}
								</p>
							)}

							<div className="space-y-2">
								{labels.map((label) => (
									<div
										key={label.id}
										className="flex items-center justify-between rounded-[10px] border border-white/7 bg-white/[0.02] px-4 py-3"
									>
										<div className="flex min-w-0 items-center gap-3">
											<span
												className="h-2.5 w-2.5 rounded-full"
												style={{ backgroundColor: label.color }}
											/>
											<div className="min-w-0">
												<div className="text-[14px] font-medium text-li-text-bright">
													{label.name}
												</div>
												<div className="mt-1 flex items-center gap-2 text-[12px] text-li-text-muted">
													<Tag className="h-3 w-3" />
													<span>{label.color}</span>
												</div>
											</div>
										</div>
										<button
											type="button"
											onClick={() => {
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
											className="rounded-[8px] p-2 text-li-text-muted transition-colors hover:bg-white/[0.05] hover:text-li-text-bright"
											aria-label={`Delete ${label.name}`}
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	)
}
