import { useQuery } from '@tanstack/react-query'

import { getNotificationService } from '@/services'

export function useNotifications() {
	return useQuery({
		queryKey: ['notifications'],
		queryFn: () => getNotificationService().list()
	})
}

export function useUnreadCount() {
	return useQuery({
		queryKey: ['notifications', 'unread-count'],
		queryFn: () => getNotificationService().getUnreadCount()
	})
}
