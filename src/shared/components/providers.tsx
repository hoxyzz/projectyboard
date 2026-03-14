'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

import { Toaster as Sonner } from '@/shared/components/ui/sonner'
import { Toaster } from '@/shared/components/ui/toaster'
import { TooltipProvider } from '@/shared/components/ui/tooltip'

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				{children}
			</TooltipProvider>
		</QueryClientProvider>
	)
}
