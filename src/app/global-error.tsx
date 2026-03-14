'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

type ErrorProps = {
	error: Error & { digest?: string }
	reset: () => void
}

function getMessage(error: Error & { digest?: string }) {
	if (error.message && error.message !== 'An unexpected error occurred.') {
		return error.message
	}

	return 'A fatal application error occurred.'
}

export default function GlobalError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<html lang="en">
			<body className="bg-li-content-bg text-li-text-bright">
				<div className="flex min-h-screen items-center justify-center px-6 py-10">
					<div className="w-full max-w-lg rounded-xl border border-li-content-border bg-li-bg p-6 shadow-2xl">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-li-dot-red/15">
								<AlertTriangle className="h-5 w-5 text-li-dot-red" />
							</div>
							<div>
								<h1 className="text-lg font-semibold">Application error</h1>
								<p className="text-sm text-li-text-muted">
									The root layout failed to render.
								</p>
							</div>
						</div>

						<div className="rounded-lg border border-li-content-border bg-black/20 px-4 py-3">
							<p className="text-sm">{getMessage(error)}</p>
							{error.digest ? (
								<p className="mt-2 text-xs text-li-text-muted">Digest: {error.digest}</p>
							) : null}
						</div>

						<div className="mt-5 flex gap-3">
							<button
								className="inline-flex items-center gap-2 rounded-md bg-li-text-bright px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
								onClick={reset}
								type="button"
							>
								<RefreshCw className="h-4 w-4" />
								Try again
							</button>
							<a
								className="inline-flex items-center rounded-md border border-li-content-border px-4 py-2 text-sm transition-colors hover:bg-li-bg-hover"
								href="/inbox"
							>
								Go to inbox
							</a>
						</div>
					</div>
				</div>
			</body>
		</html>
	)
}
