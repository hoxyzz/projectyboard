import type { ReactNode } from 'react'

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger
} from '@/components/ui/context-menu'

import type { ContextMenuConfig } from './types'

interface SidebarContextMenuProps {
	config?: ContextMenuConfig
	children: ReactNode
}

export function SidebarContextMenu({ config, children }: SidebarContextMenuProps) {
	if (!config) return <>{children}</>

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className="w-52 bg-li-menu-bg border-li-menu-border rounded-lg shadow-xl p-1">
				{config.items.map((item, i) =>
					item.separator ? (
						<ContextMenuSeparator key={`sep-${i}`} className="bg-li-divider" />
					) : (
						<ContextMenuItem
							key={item.id}
							onClick={item.action}
							disabled={item.disabled}
							className="text-[12.5px] text-li-text hover:text-li-text-bright hover:bg-li-menu-bg-hover rounded-md cursor-pointer gap-2"
						>
							{item.icon && <item.icon className="h-3.5 w-3.5 text-li-text-muted" />}
							{item.label}
						</ContextMenuItem>
					)
				)}
			</ContextMenuContent>
		</ContextMenu>
	)
}
