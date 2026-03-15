import type { ReactNode } from 'react'

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger
} from '@/shared/components/ui/context-menu'

import type { ContextMenuConfig } from './types'

type SidebarContextMenuProps = {
	config?: ContextMenuConfig
	children: ReactNode
}

export function SidebarContextMenu({ config, children }: SidebarContextMenuProps) {
	if (!config) return <>{children}</>

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-52 rounded-lg border-sidebar-border bg-sidebar p-1 text-sidebar-foreground shadow-xl">
				{config.items.map((item, i) =>
					item.separator ? (
						<ContextMenuSeparator key={`sep-${i}`} className="bg-sidebar-border/70" />
					) : (
						<ContextMenuItem
							key={item.id}
							onClick={item.action}
							disabled={item.disabled}
							className="cursor-pointer gap-2 rounded-md text-[12.5px] text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						>
							{item.icon && <item.icon className="h-3.5 w-3.5 text-sidebar-foreground/58" />}
							{item.label}
						</ContextMenuItem>
					)
				)}
			</ContextMenuContent>
		</ContextMenu>
	)
}
