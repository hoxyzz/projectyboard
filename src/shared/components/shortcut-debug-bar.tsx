'use client'

import { useEffect } from 'react'

import { cn } from '@/shared/lib/utils'
import { useShortcutDebugStore } from '@/shared/stores/shortcut-debug-store'

function formatTime(timestamp: number) {
	return new Intl.DateTimeFormat(undefined, {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).format(timestamp)
}

export function ShortcutDebugBar() {
	const enabled = useShortcutDebugStore((state) => state.enabled)
	const events = useShortcutDebugStore((state) => state.events)
	const hydrate = useShortcutDebugStore((state) => state.hydrate)

	useEffect(() => {
		hydrate()
	}, [hydrate])

	if (!enabled) return null

	return (
		<div className="pointer-events-none fixed bottom-3 left-3 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-xl border border-li-menu-border bg-li-menu-bg/95 shadow-2xl backdrop-blur-sm">
			<div className="border-b border-li-divider px-3 py-2">
				<div className="flex items-center justify-between">
					<span className="text-[11px] font-medium uppercase tracking-[0.08em] text-li-text-muted">
						Shortcut Debug
					</span>
					<span className="text-[10px] text-li-text-muted">toggle: Mod+Shift+D</span>
				</div>
			</div>
			<div className="max-h-[280px] overflow-auto px-2 py-2">
				{events.length === 0 ? (
					<div className="px-2 py-3 text-[12px] text-li-text-muted">
						No shortcut events yet.
					</div>
				) : (
					<div className="space-y-1.5">
						{events.map((event) => (
							<div
								key={event.id}
								className="rounded-lg border border-li-divider bg-li-bg/70 px-2.5 py-2"
							>
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-2">
										<span
											className={cn(
												'inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium',
												event.status === 'handled'
													? 'bg-li-dot-green/15 text-li-dot-green'
													: 'bg-li-dot-orange/15 text-li-dot-orange'
											)}
										>
											{event.status}
										</span>
										<span className="text-[10px] uppercase tracking-[0.06em] text-li-text-muted">
											{event.source}
										</span>
									</div>
									<span className="text-[10px] text-li-text-muted">
										{formatTime(event.timestamp)}
									</span>
								</div>
								<div className="mt-1 text-[12px] text-li-text-bright">{event.combo}</div>
								<div className="mt-0.5 text-[11px] text-li-text-muted">
									{event.description}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
