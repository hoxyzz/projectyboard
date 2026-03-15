/**
 * Sidebar configuration factory.
 *
 * Accepts data from hooks/services and returns a SidebarConfig.
 * Items can be toggled centrally via the `enabled` flag pattern.
 */
import {
	Archive,
	BellRing,
	CircleDot,
	CircleUser,
	Eye,
	FolderKanban,
	GitPullRequest,
	Inbox,
	Link as LinkIcon,
	LogOut,
	MessageSquare,
	MoreHorizontal,
	Search,
	Settings,
	Keyboard
} from 'lucide-react'

import { NotificationInboxPopover } from '@/domains/inbox/notification-inbox-popover'
import type { OptionalAction } from '@/shared/types'
import type { SidebarConfig } from './types'

export type SidebarConfigParams = {
	userName: string
	inboxCount: number
	reviewCount: number
	myIssuesCount: number
	teams: Array<{
		id: string
		name: string
		color?: string
	}>
	onSearch?: OptionalAction
	onTeamSettings?: OptionalAction<string>
	onLeaveTeam?: OptionalAction<string>
	onNavigate?: OptionalAction<string>
	onCheatsheet?: OptionalAction
}

export function buildSidebarConfig(params: SidebarConfigParams): SidebarConfig {
	const {
		userName,
		inboxCount,
		reviewCount,
		myIssuesCount,
		teams,
		onSearch,
		onTeamSettings,
		onLeaveTeam,
		onCheatsheet
	} = params

	return {
		user: {
			name: userName,
			actions: (
				<div className="flex items-center gap-0.5">
					<button
						className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						onClick={() => onSearch?.()}
						title="Search"
					>
						<Search className="h-3.5 w-3.5" />
					</button>
					<button
						className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						onClick={() => onCheatsheet?.()}
						title="Keyboard shortcuts"
					>
						<Keyboard className="h-3.5 w-3.5" />
					</button>
					<NotificationInboxPopover className="relative flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
				</div>
			)
		},
		topItems: [
			{
				id: 'inbox',
				label: 'Inbox',
				icon: Inbox,
				badge: { count: inboxCount },
				href: '/inbox',
				shortcut: 'G I'
			},
			{
				id: 'reviews',
				label: 'Reviews',
				icon: GitPullRequest,
				badge: { count: reviewCount },
				href: '/reviews',
				shortcut: 'G R'
			},
			{
				id: 'my-issues',
				label: 'My issues',
				icon: CircleUser,
				badge: { count: myIssuesCount },
				href: '/my-issues',
				shortcut: 'G B'
			}
		],
		sections: [
			{
				id: 'workspace',
				label: 'Workspace',
				collapsible: true,
				defaultOpen: true,
				items: [
					{
						id: 'projects',
						label: 'Projects',
						icon: FolderKanban,
						href: '/projects',
						shortcut: 'G P'
					},
					{ id: 'views', label: 'Views', icon: Eye, href: '/views', shortcut: 'G V' },
					{ id: 'more', label: 'More', icon: MoreHorizontal, href: '/views' }
				],
				contextMenu: {
					items: [
						{ id: 'ws-settings', label: 'Workspace settings', icon: Settings },
						{ id: 'ws-members', label: 'Members', icon: CircleUser },
						{ id: 'ws-sep', label: '', separator: true },
						{ id: 'ws-customize', label: 'Customize sidebar', icon: Settings }
					]
				}
			}
		],
		teams: teams.map((team) => ({
			id: team.id,
			label: team.name,
			color: team.color,
			items: [
				{
					id: `${team.id}-issues`,
					label: 'Issues',
					icon: CircleDot,
					href: `/${team.id}/issues`
				},
				{
					id: `${team.id}-projects`,
					label: 'Projects',
					icon: FolderKanban,
					href: `/${team.id}/projects`
				},
				{ id: `${team.id}-views`, label: 'Views', icon: Eye, href: `/${team.id}/views` }
			],
			contextMenu: {
				items: [
					{
						id: 'team-settings',
						label: 'Team settings',
						icon: Settings,
						action: () => onTeamSettings?.(team.id)
					},
					{ id: 'copy-link', label: 'Copy link', icon: LinkIcon },
					{ id: 'archive', label: 'Archive', icon: Archive },
					{ id: 'sep1', label: '', separator: true },
					{ id: 'subscribe', label: 'Subscribe', icon: BellRing },
					{ id: 'slack', label: 'Configure Slack notifications...', icon: MessageSquare },
					{ id: 'sep2', label: '', separator: true },
					{
						id: 'leave',
						label: 'Leave team',
						icon: LogOut,
						action: () => onLeaveTeam?.(team.id)
					}
				]
			}
		})),
		footerItems: [],
		footerSlot: (
			<div className="flex flex-col gap-0.5">
				<span className="text-[11px] text-sidebar-foreground/55">What's new</span>
				<span className="text-[12px] text-sidebar-foreground/78">Deeplink to AI coding tools</span>
			</div>
		)
	}
}
