/**
 * Sidebar configuration factory.
 *
 * Accepts data from hooks/services and returns a SidebarConfig.
 * Items can be toggled centrally via the `enabled` flag pattern.
 */
import {
	Archive,
	Bell,
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
	Settings
} from 'lucide-react'

import type { OptionalAction } from '@/types'
import type { SidebarConfig } from './types'

export interface SidebarConfigParams {
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
	onNotifications?: OptionalAction
	onTeamSettings?: OptionalAction<string>
	onLeaveTeam?: OptionalAction<string>
	onNavigate?: OptionalAction<string>
}

export function buildSidebarConfig(params: SidebarConfigParams): SidebarConfig {
	const {
		userName,
		inboxCount,
		reviewCount,
		myIssuesCount,
		teams,
		onSearch,
		onNotifications,
		onTeamSettings,
		onLeaveTeam
	} = params

	return {
		user: {
			name: userName,
			actions: (
				<div className="flex items-center gap-0.5">
					<button
						className="h-6 w-6 flex items-center justify-center rounded hover:bg-li-bg-hover transition-colors"
						onClick={() => onSearch?.()}
					>
						<Search className="h-3.5 w-3.5 text-li-text-muted" />
					</button>
					<button
						className="h-6 w-6 flex items-center justify-center rounded hover:bg-li-bg-hover transition-colors"
						onClick={() => onNotifications?.()}
					>
						<Bell className="h-3.5 w-3.5 text-li-text-muted" />
					</button>
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
				<span className="text-[11px] text-li-text-muted">What's new</span>
				<span className="text-[12px] text-li-text">Deeplink to AI coding tools</span>
			</div>
		)
	}
}
