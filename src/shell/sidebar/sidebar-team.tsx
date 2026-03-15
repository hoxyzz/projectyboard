'use client'

import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

import type { TeamConfig } from './types'

import { SidebarContextMenu } from './sidebar-context-menu'
import { SidebarItem } from './sidebar-item'
import { useSidebarStore } from './store'

type SidebarTeamProps = {
	team: TeamConfig
}

export function SidebarTeam({ team }: SidebarTeamProps) {
	const { openTeams, toggleTeam, initTeam } = useSidebarStore()
	const [menuOpen, setMenuOpen] = useState(false)

	useEffect(() => {
		initTeam(team.id, true)
	}, [team.id, initTeam])

	const isOpen = openTeams[team.id] ?? true

	return (
		<div className="flex flex-col">
			<SidebarContextMenu config={team.contextMenu}>
				<div className="group mx-1.5 flex h-[27px] cursor-pointer select-none items-center rounded-md px-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/70">
					<button
						onClick={() => toggleTeam(team.id)}
						className="flex min-w-0 flex-1 items-center gap-2"
					>
						<ChevronRight
							className={cn(
								'h-3 w-3 shrink-0 text-sidebar-foreground/45 transition-transform duration-150',
								isOpen && 'rotate-90'
							)}
						/>
						<span
							className="h-2 w-2 rounded-full shrink-0"
							style={{
								backgroundColor: team.color || 'hsl(var(--li-dot-green))'
							}}
						/>
						<span className="truncate text-[13px] text-sidebar-foreground">
							{team.label}
						</span>
					</button>

					{team.contextMenu && (
						<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
							<DropdownMenuTrigger asChild>
								<button
									className={cn(
										'flex h-5 w-5 shrink-0 items-center justify-center rounded text-sidebar-foreground/58 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
										menuOpen
											? 'opacity-100'
											: 'opacity-0 group-hover:opacity-100'
									)}
									onClick={(e) => e.stopPropagation()}
								>
									<MoreHorizontal className="h-3.5 w-3.5" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-52 rounded-lg border-sidebar-border bg-sidebar p-1 text-sidebar-foreground shadow-xl"
							>
								{team.contextMenu.items.map((menuItem, i) =>
									menuItem.separator ? (
										<DropdownMenuSeparator
											key={`sep-${i}`}
											className="bg-sidebar-border/70"
										/>
									) : (
										<DropdownMenuItem
											key={menuItem.id}
											onClick={menuItem.action}
											disabled={menuItem.disabled}
											className="cursor-pointer gap-2 rounded-md text-[12.5px] text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
										>
											{menuItem.icon && (
												<menuItem.icon className="h-3.5 w-3.5 text-sidebar-foreground/58" />
											)}
											{menuItem.label}
										</DropdownMenuItem>
									)
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</SidebarContextMenu>

			{isOpen && (
				<div className="flex flex-col gap-0.5 px-1.5">
					{team.items.map((item) => (
						<SidebarItem key={item.id} item={item} indent={1} />
					))}
				</div>
			)}
		</div>
	)
}
