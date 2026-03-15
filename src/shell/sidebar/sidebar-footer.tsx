import type { NavItem } from './types'

import { SidebarItem } from './sidebar-item'

type SidebarFooterProps = {
	items?: NavItem[]
	slot?: React.ReactNode
}

export function SidebarFooter({ items, slot }: SidebarFooterProps) {
	if (!items?.length && !slot) return null

	return (
		<div className="mt-auto flex shrink-0 flex-col">
			{items && items.length > 0 && (
				<div className="px-3 pb-1">
					<span className="select-none text-[11px] font-medium uppercase tracking-[0.06em] text-sidebar-foreground/55">
						Try
					</span>
				</div>
			)}
			{items && (
				<div className="flex flex-col gap-0.5 px-1.5 pb-2">
					{items.map((item) => (
						<SidebarItem key={item.id} item={item} />
					))}
				</div>
			)}
			{slot && <div className="border-t border-sidebar-border/70 px-3 py-2">{slot}</div>}
		</div>
	)
}
