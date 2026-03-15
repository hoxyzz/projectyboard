import { useEffect, useRef } from 'react'

import { useShortcutDebugStore } from '@/shared/stores/shortcut-debug-store'

export type RouteActions = {
	onNew?: () => void
	onOpen?: () => void
	onEdit?: () => void
	onFocusList?: () => void
	onJumpToIndex?: (index: number) => void
	onFocusInput?: () => void
	onSave?: () => void
	onToggleRead?: () => void
	onMarkAllRead?: () => void
	onFilterAll?: () => void
	onFilterUnread?: () => void
}

function isTyping(e: KeyboardEvent): boolean {
	const tag = (e.target as HTMLElement)?.tagName
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
	if ((e.target as HTMLElement)?.isContentEditable) return true
	return false
}

export function useRouteShortcuts(actions: RouteActions) {
	const actionsRef = useRef(actions)
	actionsRef.current = actions
	const logShortcutEvent = useShortcutDebugStore((s) => s.logEvent)

	useEffect(() => {
		function handler(e: KeyboardEvent) {
			if (isTyping(e)) return

			const a = actionsRef.current
			const key = e.key.toLowerCase()
			const shift = e.shiftKey
			const alt = e.altKey
			const meta = e.metaKey || e.ctrlKey

			// Don't intercept modifier combos we don't handle
			if (meta) return

			// Alt+S = save
			if (alt && key === 's' && a.onSave) {
				e.preventDefault()
				logShortcutEvent({
					source: 'route',
					combo: 'Alt+S',
					description: 'Save current context',
					status: 'handled'
				})
				a.onSave()
				return
			}
			if (alt && /^[1-9]$/.test(key) && a.onJumpToIndex) {
				e.preventDefault()
				logShortcutEvent({
					source: 'route',
					combo: `Alt+${key}`,
					description: `Jump to visible row ${key}`,
					status: 'handled'
				})
				a.onJumpToIndex(Number(key) - 1)
				return
			}
			if (alt) return

			// Shift+A = mark all read
			if (shift && key === 'a' && a.onMarkAllRead) {
				e.preventDefault()
				logShortcutEvent({
					source: 'route',
					combo: 'Shift+A',
					description: 'Mark all as read',
					status: 'handled'
				})
				a.onMarkAllRead()
				return
			}
			// Shift+N = new
			if (shift && key === 'n' && a.onNew) {
				e.preventDefault()
				logShortcutEvent({
					source: 'route',
					combo: 'Shift+N',
					description: 'Create new item',
					status: 'handled'
				})
				a.onNew()
				return
			}
			if (shift) return

			// Single keys (no modifiers)
			switch (key) {
				case 's':
					if (a.onToggleRead) {
						logShortcutEvent({
							source: 'route',
							combo: 'S',
							description: 'Toggle read state',
							status: 'handled'
						})
						a.onToggleRead()
					}
					break
				case 'n':
					if (a.onNew) {
						logShortcutEvent({
							source: 'route',
							combo: 'N',
							description: 'Create new item',
							status: 'handled'
						})
						a.onNew()
					}
					break
				case 'o':
					if (a.onOpen) {
						logShortcutEvent({
							source: 'route',
							combo: 'O',
							description: 'Open focused item',
							status: 'handled'
						})
						a.onOpen()
					}
					break
				case 'e':
					if (a.onEdit) {
						logShortcutEvent({
							source: 'route',
							combo: 'E',
							description: 'Edit focused item',
							status: 'handled'
						})
						a.onEdit()
					}
					break
				case 'l':
					if (a.onFocusList) {
						e.preventDefault()
						logShortcutEvent({
							source: 'route',
							combo: 'L',
							description: 'Focus active list',
							status: 'handled'
						})
						a.onFocusList()
					}
					break
				case '/':
					if (a.onFocusInput) {
						e.preventDefault()
						logShortcutEvent({
							source: 'route',
							combo: '/',
							description: 'Focus route input',
							status: 'handled'
						})
						a.onFocusInput()
					}
					break
				case '1':
					if (a.onFilterAll) {
						logShortcutEvent({
							source: 'route',
							combo: '1',
							description: 'Filter: all',
							status: 'handled'
						})
						a.onFilterAll()
					}
					break
				case '2':
					if (a.onFilterUnread) {
						logShortcutEvent({
							source: 'route',
							combo: '2',
							description: 'Filter: unread',
							status: 'handled'
						})
						a.onFilterUnread()
					}
					break
			}
		}

		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [logShortcutEvent])
}
