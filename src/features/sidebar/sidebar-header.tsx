import type { UserConfig } from './types'

interface SidebarHeaderProps {
	user: UserConfig
}

export function SidebarHeader({ user }: SidebarHeaderProps) {
	return (
		<div className="flex items-center justify-between px-3 h-11 shrink-0">
			<div className="flex items-center gap-2 min-w-0">
				<div className="h-5 w-5 rounded bg-li-bg-active flex items-center justify-center text-[11px] font-semibold text-li-text-bright shrink-0">
					{user.name.charAt(0).toUpperCase()}
				</div>
				<span className="text-[13px] font-medium text-li-text-bright truncate">
					{user.name}
				</span>
			</div>
			{user.actions && (
				<div className="flex items-center gap-0.5 shrink-0">{user.actions}</div>
			)}
		</div>
	)
}
