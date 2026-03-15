'use client'

import { useEffect } from 'react'

import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'

import type { SidebarConfig } from './types'

import { SidebarFooter } from './sidebar-footer'
import { SidebarHeader } from './sidebar-header'
import { SidebarItem } from './sidebar-item'
import { SidebarSection } from './sidebar-section'
import { SidebarTeam } from './sidebar-team'
import { useSidebarStore } from './store'

type SidebarRootProps = {
	config: SidebarConfig
}

export function SidebarRoot({ config }: SidebarRootProps) {
	const { collapsed, toggleCollapsed } = useSidebarStore()

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
				e.preventDefault()
				toggleCollapsed()
			}
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [toggleCollapsed])

	return (
		<aside
			className={cn(
				'h-screen shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out flex flex-col',
				collapsed ? 'w-0' : 'w-[240px]'
			)}
		>
			<SidebarHeader user={config.user} />

			<div className="mx-3 h-px bg-sidebar-border/70" />

			<ScrollArea className="flex-1 min-h-0">
				<div className="flex flex-col gap-3 py-2">
					{/* Top nav items */}
					<div className="flex flex-col gap-0.5 px-1.5">
						{config.topItems.map((item) => (
							<SidebarItem key={item.id} item={item} />
						))}
					</div>

					{/* Divider */}
					<div className="mx-3 h-px bg-sidebar-border/70" />

					{/* Sections */}
					{config.sections.map((section) => (
						<SidebarSection key={section.id} section={section} />
					))}

					{/* Divider before teams */}
					{config.teams.length > 0 && (
						<>
							<div className="mx-3 h-px bg-sidebar-border/70" />
							<div className="px-3">
								<span className="select-none text-[11px] font-medium uppercase tracking-[0.06em] text-sidebar-foreground/55">
									Your teams
								</span>
							</div>
							<div className="flex flex-col gap-0.5">
								{config.teams.map((team) => (
									<SidebarTeam key={team.id} team={team} />
								))}
							</div>
						</>
					)}
				</div>
			</ScrollArea>

			<SidebarFooter items={config.footerItems} slot={config.footerSlot} />
		</aside>
	)
}
