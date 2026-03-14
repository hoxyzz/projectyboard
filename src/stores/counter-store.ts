/**
 * Sidebar counter store.
 *
 * Single source of truth for badge counts displayed in the sidebar.
 * Each route registers its count via a key. The sidebar reads derived
 * values — no counting logic lives in sidebar components.
 *
 * Backend-agnostic: hooks/adapters push counts here; the store doesn't
 * know where data comes from.
 */
import { create } from 'zustand'

export type CounterKey = 'inbox' | 'reviews' | 'my-issues'

type CounterState = {
	counts: Record<CounterKey, number>
	setCount: (key: CounterKey, count: number) => void
	getCount: (key: CounterKey) => number
}

export const useCounterStore = create<CounterState>()((set, get) => ({
	counts: {
		inbox: 0,
		reviews: 0,
		'my-issues': 0
	},
	setCount: (key, count) =>
		set((s) => ({
			counts: { ...s.counts, [key]: count }
		})),
	getCount: (key) => get().counts[key] ?? 0
}))
