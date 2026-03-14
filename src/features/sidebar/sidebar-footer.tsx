import type { NavItem } from './types'

import { SidebarItem } from './sidebar-item'

interface SidebarFooterProps {
	items?: NavItem[]
	slot?: React.ReactNode
}

export function SidebarFooter({ items, slot }: SidebarFooterProps) {
	if (!items?.length && !slot) return null

	return (
		<div className="mt-auto shrink-0 flex flex-col">
			{items && items.length > 0 && (
				<div className="px-3 pb-1">
					<span className="text-[11px] font-medium tracking-[0.06em] uppercase text-li-text-muted select-none">
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
			{slot && <div className="border-t border-li-divider px-3 py-2">{slot}</div>}
		</div>
	)
}
