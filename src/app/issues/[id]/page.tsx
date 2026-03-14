import { notFound } from 'next/navigation'

import type { Issue } from '@/services'

import { getIssueService } from '@/services'
import { IssueDetailView } from '@/views/issue-detail-view'

type PageProps = {
	params: Promise<{ id: string }>
}

export default async function IssueDetailPage({ params }: PageProps) {
	const { id } = await params
	const issue = await getIssueService().getById(id)

	if (!issue) {
		notFound()
	}

	return <IssueDetailView issue={issue as Issue} />
}
