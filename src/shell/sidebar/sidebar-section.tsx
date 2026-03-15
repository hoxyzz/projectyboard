'use client'

import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

import { cn } from '@/shared/lib/utils'

import type { NavSection } from './types'

import { SidebarContextMenu } from './sidebar-context-menu'
import { SidebarItem } from './sidebar-item'
import { useSidebarStore } from './store'

type SidebarSectionProps = {
	section: NavSection
}

export function SidebarSection({ section }: SidebarSectionProps) {
	const { openSections, toggleSection, initSection } = useSidebarStore()

	useEffect(() => {
		initSection(section.id, section.defaultOpen ?? true)
	}, [section.id, section.defaultOpen, initSection])

	const isOpen = openSections[section.id] ?? section.defaultOpen ?? true

	return (
		<div className="flex flex-col">
			{section.label && (
				<SidebarContextMenu config={section.contextMenu}>
					<button
						onClick={() => section.collapsible && toggleSection(section.id)}
						className={cn(
							'group flex h-[26px] items-center gap-1 px-3',
							section.collapsible && 'cursor-pointer'
						)}
					>
						{section.collapsible && (
							<ChevronRight
								className={cn(
									'h-3 w-3 text-sidebar-foreground/45 transition-transform duration-150',
									isOpen && 'rotate-90'
								)}
							/>
						)}
						<span className="select-none text-[11px] font-medium uppercase tracking-[0.06em] text-sidebar-foreground/55">
							{section.label}
						</span>
						{section.headerAction && (
							<div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
								{section.headerAction}
							</div>
						)}
					</button>
				</SidebarContextMenu>
			)}
			{isOpen && (
				<div className="flex flex-col gap-0.5 px-1.5">
					{section.items.map((item) => (
						<SidebarItem key={item.id} item={item} />
					))}
				</div>
			)}
		</div>
	)
}
