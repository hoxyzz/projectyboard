'use client'

import { Notifier } from '@remcostoeten/notifier'
import '@remcostoeten/notifier/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

import { TooltipProvider } from '@/shared/components/ui/tooltip'

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Notifier
					position="top-right"
					colorMode="dark"
					radius="rounded"
					iconColor="neutral"
					maxVisible={4}
					duration={2800}
					border={{
						enabled: true,
						width: 1,
						color: 'rgba(255,255,255,0.08)'
					}}
					theme={{
						background: '#16171a',
						text: '#f3f4f6',
						textMuted: '#9ca3af',
						border: 'rgba(255,255,255,0.08)',
						borderHighlight: 'rgba(255,255,255,0.14)',
						buttonHover: 'rgba(255,255,255,0.06)',
						shadow: '0 18px 48px rgba(0,0,0,0.38)'
					}}
				/>
				{children}
			</TooltipProvider>
		</QueryClientProvider>
	)
}
