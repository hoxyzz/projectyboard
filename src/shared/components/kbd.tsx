import { cn } from '@/shared/lib/utils'

type KbdProps = {
	keys: string[]
	className?: string
}

/**
 * Renders keyboard shortcut indicators.
 * Pass keys like ["⌘", "K"] or ["Shift", "G", "I"]
 */
export function Kbd({ keys, className }: KbdProps) {
	return (
		<span className={cn('inline-flex items-center gap-0.5', className)}>
			{keys.map((key, i) => (
				<kbd
					key={i}
					className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium text-li-text-muted bg-li-bg border border-li-border rounded shadow-[0_1px_0_0_hsl(var(--li-border))] leading-none"
				>
					{key}
				</kbd>
			))}
		</span>
	)
}

/** Returns ⌘ on mac, Ctrl on others */
export function getModKey(): string {
	return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
		? '⌘'
		: 'Ctrl'
}
