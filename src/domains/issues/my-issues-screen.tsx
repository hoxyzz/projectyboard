'use client'

import { IssuesView } from '@/domains/issues/issues-view'
import { useNavigate } from '@/shared/lib/navigation'

export function MyIssuesView() {
	const navigate = useNavigate()
	return (
		<IssuesView
			onIssueSelect={(issue) => navigate(`/issues/${issue.id}`)}
			onFilterChange={undefined}
		/>
	)
}
