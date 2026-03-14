'use client'

import { useShortcut } from '@remcostoeten/use-shortcut'
import { ReactNode, useMemo, useState } from 'react'

import { SearchCommand } from '@/shared/components/search-command'
import { ShortcutCheatsheet } from '@/shared/components/shortcut-cheatsheet'
import { buildSidebarConfig } from '@/shell/sidebar/build-config'
import { SidebarRoot } from '@/shell/sidebar/sidebar-root'
import { useTeams } from '@/shared/hooks/use-teams'
import { useCurrentUser } from '@/shared/hooks/use-user'
import { useNavigate } from '@/shared/lib/navigation'
import { useCounterStore } from '@/shared/stores/counter-store'

export function AppLayout({ children }: { children?: ReactNode }) {
	const navigate = useNavigate()
	const { data: user } = useCurrentUser()
	const { data: teams } = useTeams()
	const [searchOpen, setSearchOpen] = useState(false)
	const [cheatsheetOpen, setCheatsheetOpen] = useState(false)

	// Reactive counters from shared store
	const inboxCount = useCounterStore((s) => s.counts.inbox)
	const reviewCount = useCounterStore((s) => s.counts.reviews)
	const myIssuesCount = useCounterStore((s) => s.counts['my-issues'])

	// ─── Global keyboard shortcuts ─────────────────────────
	const $ = useShortcut({ ignoreInputs: true, sequenceTimeout: 600 })

	// Search: Cmd/Ctrl + K
	$.mod.key('k').on(() => setSearchOpen(true), { preventDefault: true })

	// Navigation sequences: g then letter
	$.key('g')
		.then('i')
		.on(() => navigate('/inbox'))
	$.key('g')
		.then('r')
		.on(() => navigate('/reviews'))
	$.key('g')
		.then('b')
		.on(() => navigate('/my-issues'))
	$.key('g')
		.then('m')
		.on(() => navigate('/my-issues'))
	$.key('g')
		.then('p')
		.on(() => navigate('/projects'))
	$.key('g')
		.then('v')
		.on(() => navigate('/views'))

	// Cheatsheet: ?  (Shift+/ on most keyboards)
	$.shift
		.key('/')
		.except('typing')
		.on(() => setCheatsheetOpen(true))

	// Sidebar toggle: Cmd/Ctrl + B (handled in sidebar-root)

	const sidebarConfig = useMemo(
		() =>
			buildSidebarConfig({
				userName: user?.name ?? '…',
				inboxCount,
				reviewCount,
				myIssuesCount,
				teams: (teams ?? []).map((t) => ({
					id: t.id,
					name: t.name,
					color: t.color
				})),
				onSearch: () => setSearchOpen(true),
				onNotifications: () => navigate('/inbox'),
				onTeamSettings: null,
				onLeaveTeam: null,
				onNavigate: (path: string) => navigate(`/${path}`)
			}),
		[user, inboxCount, reviewCount, myIssuesCount, teams, navigate]
	)

	return (
		<div className="flex h-screen w-full overflow-hidden">
			<SidebarRoot config={sidebarConfig} />
			{children}
			<SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
			<ShortcutCheatsheet open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
		</div>
	)
}
