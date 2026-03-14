import { Compass, Inbox } from 'lucide-react'

export default function NotFound() {
	return (
		<div className="flex flex-1 items-center justify-center bg-li-content-bg px-6 py-10">
			<div className="w-full max-w-lg rounded-xl border border-li-content-border bg-li-bg p-6 shadow-2xl">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-li-dot-blue/15">
						<Compass className="h-5 w-5 text-li-dot-blue" />
					</div>
					<div>
						<h1 className="text-lg font-semibold text-li-text-bright">Page not found</h1>
						<p className="text-sm text-li-text-muted">
							This route does not exist or is no longer available.
						</p>
					</div>
				</div>

				<div className="rounded-lg border border-li-content-border bg-black/20 px-4 py-3">
					<p className="text-sm text-li-text-bright">
						The rest of the application is still available.
					</p>
				</div>

				<div className="mt-5 flex gap-3">
					<a
						className="inline-flex items-center gap-2 rounded-md bg-li-text-bright px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
						href="/inbox"
					>
						<Inbox className="h-4 w-4" />
						Go to inbox
					</a>
					<a
						className="inline-flex items-center rounded-md border border-li-content-border px-4 py-2 text-sm text-li-text-bright transition-colors hover:bg-li-bg-hover"
						href="/"
					>
						Go home
					</a>
				</div>
			</div>
		</div>
	)
}
