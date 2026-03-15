import type { UserConfig } from './types'

type SidebarHeaderProps = {
	user: UserConfig
}

export function SidebarHeader({ user }: SidebarHeaderProps) {
	return (
		<div className="flex h-11 shrink-0 items-center justify-between px-3">
			<div className="flex min-w-0 items-center gap-2">
				<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sidebar-accent text-[11px] font-semibold text-sidebar-accent-foreground">
					{user.name.charAt(0).toUpperCase()}
				</div>
				<span className="truncate text-[13px] font-medium text-sidebar-foreground">
					{user.name}
				</span>
			</div>
			{user.actions && (
				<div className="flex shrink-0 items-center gap-0.5">{user.actions}</div>
			)}
		</div>
	)
}
