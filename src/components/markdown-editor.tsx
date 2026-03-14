import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
	value: string
	onChange: (value: string) => void
	onBlur?: () => void
	placeholder?: string
	maxLength?: number
	className?: string
	minRows?: number
}

export function MarkdownEditor({
	value,
	onChange,
	onBlur,
	placeholder = 'Write markdown…',
	maxLength = 5000,
	className,
	minRows = 6
}: MarkdownEditorProps) {
	const [tab, setTab] = useState<'write' | 'preview'>('write')

	return (
		<div
			className={cn('border border-li-border rounded-md overflow-hidden bg-li-bg', className)}
		>
			{/* Tabs */}
			<div className="flex items-center border-b border-li-border px-1 h-8 gap-0.5">
				<button
					type="button"
					onClick={() => setTab('write')}
					className={cn(
						'text-[11px] px-2.5 py-1 rounded transition-colors',
						tab === 'write'
							? 'text-li-text-bright bg-li-bg-hover'
							: 'text-li-text-muted hover:text-li-text-bright'
					)}
				>
					Write
				</button>
				<button
					type="button"
					onClick={() => setTab('preview')}
					className={cn(
						'text-[11px] px-2.5 py-1 rounded transition-colors',
						tab === 'preview'
							? 'text-li-text-bright bg-li-bg-hover'
							: 'text-li-text-muted hover:text-li-text-bright'
					)}
				>
					Preview
				</button>
				<span className="ml-auto text-[10px] text-li-text-muted">
					{value.length}/{maxLength}
				</span>
			</div>

			{/* Content */}
			{tab === 'write' ? (
				<textarea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
					rows={minRows}
					maxLength={maxLength}
					placeholder={placeholder}
					className="w-full text-[13px] text-li-text-bright bg-transparent p-3 outline-none resize-none leading-relaxed placeholder:text-li-text-muted font-mono"
				/>
			) : (
				<div className="p-3 min-h-[calc(1.6em*6+1.5rem)] prose-invert max-w-none">
					{value ? (
						<ReactMarkdown
							components={{
								h1: ({ children }) => (
									<h1 className="text-[18px] font-bold text-li-text-bright mb-2 mt-0">
										{children}
									</h1>
								),
								h2: ({ children }) => (
									<h2 className="text-[16px] font-semibold text-li-text-bright mb-1.5 mt-3">
										{children}
									</h2>
								),
								h3: ({ children }) => (
									<h3 className="text-[14px] font-medium text-li-text-bright mb-1 mt-2">
										{children}
									</h3>
								),
								p: ({ children }) => (
									<p className="text-[13px] text-li-text leading-relaxed mb-2">
										{children}
									</p>
								),
								ul: ({ children }) => (
									<ul className="text-[13px] text-li-text list-disc pl-5 mb-2 space-y-0.5">
										{children}
									</ul>
								),
								ol: ({ children }) => (
									<ol className="text-[13px] text-li-text list-decimal pl-5 mb-2 space-y-0.5">
										{children}
									</ol>
								),
								li: ({ children }) => (
									<li className="text-[13px] text-li-text leading-relaxed">
										{children}
									</li>
								),
								code: ({ children, className: codeClassName }) => {
									const isInline = !codeClassName
									return isInline ? (
										<code className="text-[12px] bg-li-bg-hover text-li-dot-orange px-1 py-0.5 rounded font-mono">
											{children}
										</code>
									) : (
										<code className="block text-[12px] bg-li-bg-hover text-li-text-bright p-3 rounded font-mono overflow-x-auto mb-2">
											{children}
										</code>
									)
								},
								pre: ({ children }) => (
									<pre className="bg-li-bg-hover rounded-md overflow-hidden mb-2">
										{children}
									</pre>
								),
								blockquote: ({ children }) => (
									<blockquote className="border-l-2 border-li-dot-blue pl-3 text-[13px] text-li-text-muted italic mb-2">
										{children}
									</blockquote>
								),
								a: ({ children, href }) => (
									<a
										href={href}
										className="text-li-dot-blue hover:underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										{children}
									</a>
								),
								strong: ({ children }) => (
									<strong className="text-li-text-bright font-semibold">
										{children}
									</strong>
								),
								em: ({ children }) => (
									<em className="text-li-text italic">{children}</em>
								),
								hr: () => <hr className="border-li-divider my-3" />
							}}
						>
							{value}
						</ReactMarkdown>
					) : (
						<p className="text-[13px] text-li-text-muted italic">Nothing to preview</p>
					)}
				</div>
			)}
		</div>
	)
}

/** Read-only rendered markdown */
export function MarkdownPreview({ content, className }: { content: string; className?: string }) {
	if (!content) return null
	return (
		<div className={cn('max-w-none', className)}>
			<ReactMarkdown
				components={{
					h1: ({ children }) => (
						<h1 className="text-[16px] font-bold text-li-text-bright mb-1.5 mt-0">
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className="text-[14px] font-semibold text-li-text-bright mb-1 mt-2">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="text-[13px] font-medium text-li-text-bright mb-1 mt-1.5">
							{children}
						</h3>
					),
					p: ({ children }) => (
						<p className="text-[12.5px] text-li-text leading-relaxed mb-1.5">
							{children}
						</p>
					),
					ul: ({ children }) => (
						<ul className="text-[12.5px] text-li-text list-disc pl-4 mb-1.5 space-y-0.5">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="text-[12.5px] text-li-text list-decimal pl-4 mb-1.5 space-y-0.5">
							{children}
						</ol>
					),
					code: ({ children, className: codeClassName }) => {
						const isInline = !codeClassName
						return isInline ? (
							<code className="text-[11px] bg-li-bg-hover text-li-dot-orange px-1 py-0.5 rounded font-mono">
								{children}
							</code>
						) : (
							<code className="block text-[11px] bg-li-bg-hover text-li-text-bright p-2 rounded font-mono overflow-x-auto mb-1.5">
								{children}
							</code>
						)
					},
					pre: ({ children }) => (
						<pre className="bg-li-bg-hover rounded overflow-hidden mb-1.5">
							{children}
						</pre>
					),
					blockquote: ({ children }) => (
						<blockquote className="border-l-2 border-li-dot-blue pl-2 text-[12px] text-li-text-muted italic mb-1.5">
							{children}
						</blockquote>
					),
					a: ({ children, href }) => (
						<a href={href} className="text-li-dot-blue hover:underline text-[12.5px]">
							{children}
						</a>
					),
					strong: ({ children }) => (
						<strong className="text-li-text-bright font-semibold">{children}</strong>
					),
					hr: () => <hr className="border-li-divider my-2" />
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	)
}
