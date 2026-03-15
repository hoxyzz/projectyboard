"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";

import { Kbd, getModKey } from "@/shared/components/kbd";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const mod = getModKey();
const APP_SHELL_SELECTOR = "[data-app-shell-root]";

const SECTIONS = [
	{
		title: "Navigation",
		shortcuts: [
			{ keys: ["G", "I"], label: "Go to Inbox" },
			{ keys: ["G", "R"], label: "Go to Reviews" },
			{ keys: ["G", "B"], label: "Go to My Issues" },
			{ keys: ["G", "P"], label: "Go to Projects" },
			{ keys: ["G", "V"], label: "Go to Views" },
		],
	},
	{
		title: "Actions",
		shortcuts: [
			{ keys: [mod, "K"], label: "Open search" },
			{ keys: ["?"], label: "Show this cheatsheet" },
			{ keys: ["N"], label: "Create new issue" },
			{ keys: [mod, "B"], label: "Toggle sidebar" },
		],
	},
	{
		title: "Lists",
		shortcuts: [
			{ keys: ["↓", "/", "J"], label: "Move down" },
			{ keys: ["↑", "/", "K"], label: "Move up" },
			{ keys: ["Enter"], label: "Open item" },
			{ keys: ["Space"], label: "Toggle read / select" },
			{ keys: ["O"], label: "Open full view" },
		],
	},
	{
		title: "Inbox",
		shortcuts: [
			{ keys: ["S"], label: "Toggle read/unread" },
			{ keys: ["⇧", "A"], label: "Mark all as read" },
			{ keys: ["1"], label: "Filter: All" },
			{ keys: ["2"], label: "Filter: Unread" },
		],
	},
	{
		title: "Issue Detail",
		shortcuts: [
			{ keys: ["E"], label: "Focus editor" },
			{ keys: ["/"], label: "Focus input" },
			{ keys: ["Alt", "S"], label: "Save editor" },
		],
	},
	{
		title: "General",
		shortcuts: [
			{ keys: ["Esc"], label: "Close modal / panel" },
			{ keys: ["Tab"], label: "Focus next element" },
			{ keys: ["⇧", "Tab"], label: "Focus previous element" },
		],
	},
];

function ShortcutSection({
	title,
	shortcuts,
}: (typeof SECTIONS)[number]) {
	const sectionId = `shortcut-section-${title.toLowerCase().replace(/\s+/g, "-")}`;

	return (
		<section
			aria-labelledby={sectionId}
			className="rounded-xl border border-li-border/70 bg-li-bg-hover/40 p-4"
		>
			<h3
				id={sectionId}
				className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-li-text-muted"
			>
				{title}
			</h3>
			<ul className="space-y-2" role="list">
				{shortcuts.map((shortcut) => (
					<li
						key={shortcut.label}
						className="flex items-center justify-between gap-3 rounded-md py-1"
					>
						<span className="min-w-0 text-[12px] text-li-text">
							{shortcut.label}
						</span>
						<Kbd keys={shortcut.keys} />
					</li>
				))}
			</ul>
		</section>
	);
}

function ShortcutCheatsheetBody({
	descriptionId,
	onClose,
}: {
	descriptionId: string;
	onClose: () => void;
}) {
	return (
		<>
			<div className="flex items-start justify-between gap-4 border-b border-li-border px-4 py-4 sm:px-5">
				<div>
					<p
						id={descriptionId}
						className="mt-1 max-w-[48ch] text-sm text-li-text-muted"
					>
						Reference for global navigation and action shortcuts. While this panel
						is open, the app behind it is inert.
					</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-md p-2 text-li-text-muted transition-colors hover:bg-li-bg-hover hover:text-li-text-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--border-strong))]"
					aria-label="Close keyboard shortcuts"
				>
					<X className="h-4 w-4" aria-hidden="true" />
				</button>
			</div>

			<div className="max-h-[min(72vh,40rem)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					{SECTIONS.map((section) => (
						<ShortcutSection key={section.title} {...section} />
					))}
				</div>
			</div>
		</>
	);
}

export function ShortcutCheatsheet({ open, onOpenChange }: Props) {
	const isMobile = useIsMobile();
	const descriptionId = useId();

	useEffect(() => {
		const appShell = document.querySelector<HTMLElement>(APP_SHELL_SELECTOR);
		if (!appShell) return;

		if (open) {
			appShell.setAttribute("inert", "");
			appShell.setAttribute("aria-hidden", "true");
			return () => {
				appShell.removeAttribute("inert");
				appShell.removeAttribute("aria-hidden");
			};
		}

		appShell.removeAttribute("inert");
		appShell.removeAttribute("aria-hidden");
	}, [open]);

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent
					aria-describedby={descriptionId}
					className="border-li-border bg-li-bg text-li-text-bright"
				>
					<DrawerHeader className="sr-only">
						<DrawerTitle>Keyboard shortcuts</DrawerTitle>
						<DrawerDescription>
							Reference for keyboard shortcuts across the app.
						</DrawerDescription>
					</DrawerHeader>
					<ShortcutCheatsheetBody
						descriptionId={descriptionId}
						onClose={() => onOpenChange(false)}
					/>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				aria-describedby={descriptionId}
				className={cn(
					"max-h-[90vh] max-w-[min(92vw,44rem)] overflow-hidden border-li-border bg-li-bg p-0 text-li-text-bright shadow-2xl",
				)}
			>
				<DialogHeader className="sr-only">
					<DialogTitle>Keyboard shortcuts</DialogTitle>
					<DialogDescription>
						Reference for keyboard shortcuts across the app.
					</DialogDescription>
				</DialogHeader>
				<ShortcutCheatsheetBody
					descriptionId={descriptionId}
					onClose={() => onOpenChange(false)}
				/>
				<DialogClose className="sr-only">Close</DialogClose>
			</DialogContent>
		</Dialog>
	);
}
