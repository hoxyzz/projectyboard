import { notFound } from 'next/navigation'

import { getIssueRepository } from '@/domains/issues/data'
import { IssueDetailView } from '@/domains/issues/issue-detail-screen'
import type { Issue } from '@/domains/issues/types'

type PageProps = {
	params: Promise<{ id: string }>
}

export default async function IssueDetailPage({ params }: PageProps) {
	const { id } = await params
	const issue = await getIssueRepository().getById(id)

	if (!issue) {
		notFound()
	}

	return <IssueDetailView issue={issue as Issue} />
}
