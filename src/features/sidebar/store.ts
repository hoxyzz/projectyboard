import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SidebarState = {
	collapsed: boolean
	activeItemId: string | null
	openSections: Record<string, boolean>
	openTeams: Record<string, boolean>
	toggleCollapsed: () => void
	setActiveItem: (id: string) => void
	toggleSection: (id: string) => void
	toggleTeam: (id: string) => void
	initSection: (id: string, defaultOpen: boolean) => void
	initTeam: (id: string, defaultOpen: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
	persist(
		(set, get) => ({
			collapsed: false,
			activeItemId: 'inbox',
			openSections: {},
			openTeams: {},
			toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
			setActiveItem: (id) => set({ activeItemId: id }),
			toggleSection: (id) =>
				set((s) => ({
					openSections: { ...s.openSections, [id]: !s.openSections[id] }
				})),
			toggleTeam: (id) =>
				set((s) => ({
					openTeams: { ...s.openTeams, [id]: !s.openTeams[id] }
				})),
			initSection: (id, defaultOpen) => {
				const state = get()
				if (state.openSections[id] === undefined) {
					set((s) => ({
						openSections: { ...s.openSections, [id]: defaultOpen }
					}))
				}
			},
			initTeam: (id, defaultOpen) => {
				const state = get()
				if (state.openTeams[id] === undefined) {
					set((s) => ({
						openTeams: { ...s.openTeams, [id]: defaultOpen }
					}))
				}
			}
		}),
		{ name: 'linear-sidebar-state' }
	)
)
