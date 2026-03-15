"use client";

import { useShortcut } from "@remcostoeten/use-shortcut";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { useNotifications } from "@/domains/inbox/hooks/use-notifications";
import { useIssues } from "@/domains/issues/hooks/use-issues";
import type { IssueStatus } from "@/domains/issues/types";
import { ShortcutDebugBar } from "@/shared/components/shortcut-debug-bar";
import { SearchCommand } from "@/shared/components/search-command";
import { ShortcutCheatsheet } from "@/shared/components/shortcut-cheatsheet";
import { buildSidebarConfig } from "@/shell/sidebar/build-config";
import { SidebarRoot } from "@/shell/sidebar/sidebar-root";
import { useTeams } from "@/shared/hooks/use-teams";
import { useCurrentUser } from "@/shared/hooks/use-user";
import { useNavigate } from "@/shared/lib/navigation";
import { useShortcutDebugStore } from "@/shared/stores/shortcut-debug-store";
import { useCounterStore } from "@/shared/stores/counter-store";

const TRACKED_ISSUE_STATUSES: IssueStatus[] = [
	"backlog",
	"todo",
	"in_progress",
];

export function AppLayout({ children }: { children?: ReactNode }) {
	const navigate = useNavigate();
	const { data: user } = useCurrentUser();
	const { data: teams } = useTeams();
	const { data: notifications = [] } = useNotifications();
	const { data: issues } = useIssues();
	const [searchOpen, setSearchOpen] = useState(false);
	const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
	const setCount = useCounterStore((s) => s.setCount);
	const toggleShortcutDebug = useShortcutDebugStore((s) => s.toggleEnabled);
	const logShortcutEvent = useShortcutDebugStore((s) => s.logEvent);

	const inboxCount = useCounterStore((s) => s.counts.inbox);
	const reviewCount = useCounterStore((s) => s.counts.reviews);
	const myIssuesCount = useCounterStore((s) => s.counts["my-issues"]);
	const trackedIssueCount = useMemo(
		() =>
			(issues?.data ?? []).filter((issue) =>
				TRACKED_ISSUE_STATUSES.includes(issue.status),
			).length,
		[issues],
	);
	const unreadCount = useMemo(
		() => notifications.filter((notification) => !notification.read).length,
		[notifications],
	);

	useEffect(() => {
		setCount("inbox", unreadCount);
	}, [unreadCount, setCount]);

	useEffect(() => {
		setCount("my-issues", trackedIssueCount);
	}, [trackedIssueCount, setCount]);

	useEffect(() => {
		setCount("reviews", 0);
	}, [setCount]);

	useEffect(() => {
		if (!cheatsheetOpen) return;
		setSearchOpen(false);
	}, [cheatsheetOpen]);

	// ─── Global keyboard shortcuts ─────────────────────────
	const $ = useShortcut({ ignoreInputs: true, sequenceTimeout: 600 });

	// Search: Cmd/Ctrl + K
	$.mod.key("k").on(
		() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "Mod+K",
				description: "Open search",
				status: "handled",
			});
			setSearchOpen(true);
		},
		{ preventDefault: true },
	);

	// Navigation sequences: g then letter
	$.key("g")
		.then("i")
		.on(() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "G I",
				description: "Navigate to Inbox",
				status: "handled",
			});
			navigate("/inbox");
		});
	$.key("g")
		.then("r")
		.on(() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "G R",
				description: "Navigate to Reviews",
				status: "handled",
			});
			navigate("/reviews");
		});
	$.key("g")
		.then("b")
		.on(() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "G B",
				description: "Navigate to My issues",
				status: "handled",
			});
			navigate("/my-issues");
		});
	$.key("g")
		.then("m")
		.on(() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "G M",
				description: "Navigate to My issues",
				status: "handled",
			});
			navigate("/my-issues");
		});
	$.key("g")
		.then("p")
		.on(() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "G P",
				description: "Navigate to Projects",
				status: "handled",
			});
			navigate("/projects");
		});
	$.key("g")
		.then("v")
		.on(() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "G V",
				description: "Navigate to Views",
				status: "handled",
			});
			navigate("/views");
		});

	// Cheatsheet: ?  (Shift+/ on most keyboards)
	$.shift
		.key("/")
		.except("typing")
		.on(() => {
			if (cheatsheetOpen) return;
			logShortcutEvent({
				source: "global",
				combo: "Shift+/",
				description: "Open shortcut cheatsheet",
				status: "handled",
			});
			setSearchOpen(false);
			setCheatsheetOpen(true);
		});

	$.mod.shift.key("d").on(
		() => {
			if (cheatsheetOpen) return;
			toggleShortcutDebug();
		},
		{ description: "Toggle shortcut debug overlay" },
	);

	// Sidebar toggle: Cmd/Ctrl + B (handled in sidebar-root)

	const sidebarConfig = useMemo(
		() =>
			buildSidebarConfig({
				userName: user?.name ?? "…",
				inboxCount,
				reviewCount,
				myIssuesCount,
				teams: (teams ?? []).map((t) => ({
					id: t.id,
					name: t.name,
					color: t.color,
				})),
				onSearch: () => setSearchOpen(true),
				onTeamSettings: null,
				onLeaveTeam: null,
				onNavigate: (path: string) => navigate(`/${path}`),
			}),
		[user, inboxCount, reviewCount, myIssuesCount, teams, navigate],
	);

	return (
		<div className="flex h-screen w-full overflow-hidden">
			<div data-app-shell-root className="contents">
				<SidebarRoot config={sidebarConfig} />
				{children}
				<ShortcutDebugBar />
			</div>
			<SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
			<ShortcutCheatsheet
				open={cheatsheetOpen}
				onOpenChange={setCheatsheetOpen}
			/>
		</div>
	);
}
