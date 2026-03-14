import { notFound } from 'next/navigation'

import { getIssueData } from '@/domains/issues/data'
import type { Issue } from '@/domains/issues/types'
import { IssueDetailView } from '@/views/issue-detail-view'

type PageProps = {
	params: Promise<{ id: string }>
}

export default async function IssueDetailPage({ params }: PageProps) {
	const { id } = await params
	const issue = await getIssueData().getById(id)

	if (!issue) {
		notFound()
	}

	return <IssueDetailView issue={issue as Issue} />
}
