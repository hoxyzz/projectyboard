'use client'

import { useCallback, useRef, useState } from 'react'

import { useShortcutDebugStore } from '@/shared/stores/shortcut-debug-store'

type UseStructuralNavigationOptions = {
	navIds: string[]
}

function isTypingTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false

	return Boolean(
		target.closest('input, textarea, select, [contenteditable="true"], [role="menu"]')
	)
}

export function useStructuralNavigation({ navIds }: UseStructuralNavigationOptions) {
	const refs = useRef(new Map<string, HTMLElement | null>())
	const [activeNavId, setActiveNavId] = useState<string | null>(null)
	const logShortcutEvent = useShortcutDebugStore((s) => s.logEvent)

	const registerNavRef = useCallback(
		(navId: string) => (node: HTMLElement | null) => {
			refs.current.set(navId, node)
		},
		[]
	)

	const focusNav = useCallback((navId: string | null | undefined) => {
		if (!navId) return

		const element = refs.current.get(navId)
		if (!element) return

		element.focus()
		setActiveNavId(navId)
	}, [])

	const resolveNavIdFromTarget = useCallback(
		(target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) return activeNavId ?? navIds[0] ?? null

			return (
				target.closest<HTMLElement>('[data-nav-id]')?.dataset.navId ??
				target.closest<HTMLElement>('[data-parent-nav-id]')?.dataset.parentNavId ??
				activeNavId ??
				navIds[0] ??
				null
			)
		},
		[activeNavId, navIds]
	)

	const move = useCallback(
		(direction: 'up' | 'down', fromNavId?: string | null) => {
			const currentNavId = fromNavId ?? activeNavId ?? navIds[0]
			if (!currentNavId) return

			const currentIndex = navIds.indexOf(currentNavId)
			if (currentIndex === -1) return

			const nextIndex =
				direction === 'down'
					? Math.min(currentIndex + 1, navIds.length - 1)
					: Math.max(currentIndex - 1, 0)

			focusNav(navIds[nextIndex])
		},
		[activeNavId, focusNav, navIds]
	)

	const getTabIndex = useCallback(
		(navId: string) => {
			const fallbackNavId = navIds[0] ?? null
			return (activeNavId ?? fallbackNavId) === navId ? 0 : -1
		},
		[activeNavId, navIds]
	)

	const handleStructuralKeyDownCapture = useCallback(
		(e: React.KeyboardEvent<HTMLElement>) => {
			if (isTypingTarget(e.target)) return
			if ((e.target as HTMLElement).closest('[data-structural-nav-stop="true"]')) return

			const key = e.key.toLowerCase()
			if (!['arrowdown', 'arrowup', 'j', 'k'].includes(key)) return

			e.preventDefault()
			logShortcutEvent({
				source: 'structural',
				combo: key === 'arrowdown' || key === 'j' ? key.toUpperCase() : key.toUpperCase(),
				description: `Move ${key === 'arrowdown' || key === 'j' ? 'down' : 'up'} in structural list`,
				status: 'handled'
			})
			move(key === 'arrowdown' || key === 'j' ? 'down' : 'up', resolveNavIdFromTarget(e.target))
		},
		[logShortcutEvent, move, resolveNavIdFromTarget]
	)

	return {
		activeNavId,
		setActiveNavId,
		registerNavRef,
		focusNav,
		move,
		getTabIndex,
		resolveNavIdFromTarget,
		handleStructuralKeyDownCapture
	}
}
