'use client'

import { create } from 'zustand'

export type ShortcutDebugEvent = {
	id: string
	timestamp: number
	source: 'global' | 'route' | 'structural'
	combo: string
	description: string
	status: 'handled' | 'blocked'
}

type ShortcutDebugState = {
	enabled: boolean
	events: ShortcutDebugEvent[]
	hydrated: boolean
	setEnabled: (enabled: boolean) => void
	toggleEnabled: () => void
	logEvent: (event: Omit<ShortcutDebugEvent, 'id' | 'timestamp'>) => void
	hydrate: () => void
}

const STORAGE_KEY = 'shortcut-debug-enabled'

export const useShortcutDebugStore = create<ShortcutDebugState>()((set, get) => ({
	enabled: false,
	events: [],
	hydrated: false,
	setEnabled: (enabled) => {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
		}
		set({ enabled })
	},
	toggleEnabled: () => get().setEnabled(!get().enabled),
	logEvent: (event) =>
		set((state) => {
			if (!state.enabled) return state

			const nextEvent: ShortcutDebugEvent = {
				...event,
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				timestamp: Date.now()
			}

			return {
				events: [nextEvent, ...state.events].slice(0, 12)
			}
		}),
	hydrate: () => {
		if (typeof window === 'undefined') return
		const enabled = window.localStorage.getItem(STORAGE_KEY) === '1'
		set({ enabled, hydrated: true })
	}
}))
