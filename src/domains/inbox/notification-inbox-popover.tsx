'use client'

import { formatDistanceToNow } from 'date-fns'
import { Bell } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useNotifications } from '@/domains/inbox/hooks/use-notifications'
import { Link } from '@/shared/lib/navigation'
import { getNotificationService } from '@/services'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

type NotificationInboxPopoverProps = {
	className?: string
}

export function NotificationInboxPopover({ className }: NotificationInboxPopoverProps) {
	const { data: notifications = [] } = useNotifications()
	const qc = useQueryClient()
	const [tab, setTab] = useState('all')

	const unreadCount = useMemo(
		() => notifications.filter((notification) => !notification.read).length,
		[notifications]
	)

	const filteredNotifications = useMemo(
		() =>
			tab === 'unread'
				? notifications.filter((notification) => !notification.read)
				: notifications,
		[notifications, tab]
	)

	const markAsRead = async (id: string) => {
		await getNotificationService().markAsRead?.(id)
		qc.invalidateQueries({ queryKey: ['notifications'] })
	}

	const markAllAsRead = async () => {
		await getNotificationService().markAllAsRead?.()
		qc.invalidateQueries({ queryKey: ['notifications'] })
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label="Open notifications"
					className={className ?? 'relative h-6 w-6 rounded hover:bg-li-bg-hover transition-colors'}
				>
					<Bell className="h-3.5 w-3.5 text-li-text-muted" />
					{unreadCount > 0 && (
						<span className="absolute -right-1.5 -top-1.5 min-w-[16px] rounded-full bg-li-badge-bg px-1 text-center text-[10px] font-medium leading-4 text-li-text-bright">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-[380px] border-li-menu-border bg-li-menu-bg p-0 text-li-text-bright shadow-2xl"
			>
				<Tabs value={tab} onValueChange={setTab}>
					<div className="flex items-center justify-between border-b border-li-menu-border bg-li-menu-bg px-3 py-2">
						<TabsList className="h-auto rounded-md bg-li-bg p-0.5">
							<TabsTrigger
								value="all"
								className="h-7 px-2 text-xs text-li-text data-[state=active]:bg-li-bg-hover data-[state=active]:text-li-text-bright data-[state=active]:shadow-none"
							>
								All
							</TabsTrigger>
							<TabsTrigger
								value="unread"
								className="h-7 px-2 text-xs text-li-text data-[state=active]:bg-li-bg-hover data-[state=active]:text-li-text-bright data-[state=active]:shadow-none"
							>
								Unread
								{unreadCount > 0 && (
									<Badge className="ml-1 h-4 min-w-4 justify-center border-li-border bg-li-badge-bg px-1 text-[10px] text-li-text-bright">
										{unreadCount}
									</Badge>
								)}
							</TabsTrigger>
						</TabsList>
						{unreadCount > 0 && (
							<button
								type="button"
								onClick={markAllAsRead}
								className="text-xs font-medium text-li-text-muted hover:text-li-text-bright"
							>
								Mark all as read
							</button>
						)}
					</div>

					<div className="max-h-80 overflow-y-auto bg-li-menu-bg">
						{filteredNotifications.length === 0 ? (
							<div className="px-3 py-6 text-center text-sm text-li-text-muted">
								No notifications
							</div>
						) : (
							filteredNotifications.map((notification) => (
								<button
									key={notification.id}
									type="button"
									onClick={() => markAsRead(notification.id)}
									className="flex w-full items-start gap-3 border-b border-li-divider px-3 py-3 text-left hover:bg-li-bg-hover"
								>
									<div className="flex-1 space-y-1">
										<p
											className={
												notification.read
													? 'text-sm text-li-text'
													: 'text-sm font-semibold text-li-text-bright'
											}
										>
											{notification.title}
										</p>
										<p className="text-xs text-li-text-muted">
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true
											})}
										</p>
									</div>
									{!notification.read && (
										<span className="mt-1 inline-block size-2 rounded-full bg-li-dot-blue" />
									)}
								</button>
							))
						)}
					</div>
				</Tabs>

				<div className="border-t border-li-menu-border bg-li-menu-bg px-3 py-2">
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="w-full justify-center text-li-text-muted hover:bg-li-menu-bg-hover hover:text-li-text-bright"
					>
						<Link to="/inbox">View all notifications</Link>
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}
