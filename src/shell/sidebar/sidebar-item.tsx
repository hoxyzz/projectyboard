import { Kbd } from '@/shared/components/kbd'
import { Link, useLocation } from '@/shared/lib/navigation'
import { cn } from '@/shared/lib/utils'

import type { NavItem } from './types'

import { SidebarContextMenu } from './sidebar-context-menu'
import { useSidebarStore } from './store'

type SidebarItemProps = {
	item: NavItem
	indent?: boolean | number
}

export function SidebarItem({ item, indent }: SidebarItemProps) {
	const { setActiveItem } = useSidebarStore()
	const location = useLocation()

	const isActive = item.href
		? location.pathname === item.href
		: useSidebarStore.getState().activeItemId === item.id

	const indentLevel = item.indent ?? (typeof indent === 'number' ? indent : indent ? 1 : 0)
	const indentPx = indentLevel > 0 ? `${14 + indentLevel * 16}px` : undefined

	const content = (
		<>
			{item.icon && (
				<item.icon
					className={cn(
						'h-4 w-4 shrink-0',
						isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/58'
					)}
				/>
			)}
			<span className="truncate text-[13px]">{item.label}</span>

			{/* Right side: badge count + shortcut on hover */}
			<span className="ml-auto flex items-center gap-1.5 shrink-0">
				{item.badge != null && (
					<span className="min-w-[16px] text-right text-[11px] tabular-nums text-sidebar-foreground/50">
						{item.badge.count}
					</span>
				)}
				{item.shortcut && (
					<Kbd
						keys={item.shortcut.split(' ')}
						className="opacity-0 group-hover/item:opacity-100 transition-opacity"
					/>
				)}
			</span>
		</>
	)

	const className = cn(
		'group/item flex h-[27px] cursor-pointer select-none items-center gap-2 rounded-md px-2 transition-colors duration-75',
		isActive
			? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
			: 'text-sidebar-foreground/72 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
	)

	const style = indentPx ? { paddingLeft: indentPx } : undefined

	const inner = item.href ? (
		<Link
			to={item.href}
			className={className}
			style={style}
			onClick={() => setActiveItem(item.id)}
		>
			{content}
		</Link>
	) : (
		<button
			className={cn(className, 'w-full text-left')}
			style={style}
			onClick={() => {
				setActiveItem(item.id)
				item.action?.()
			}}
		>
			{content}
		</button>
	)

	return <SidebarContextMenu config={item.contextMenu}>{inner}</SidebarContextMenu>
}
