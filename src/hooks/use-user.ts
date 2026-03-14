import { useQuery } from '@tanstack/react-query'

import { getUserService } from '@/services'

export function useCurrentUser() {
	return useQuery({
		queryKey: ['current-user'],
		queryFn: () => getUserService().getCurrentUser()
	})
}
