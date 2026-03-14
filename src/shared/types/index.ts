export type PaginatedResult<T> = {
	data: T[]
	total: number
	page: number
	pageSize: number
	hasMore: boolean
}

export type OptionalAction<T = void> = T extends void
	? () => void
	: (payload: T) => void
