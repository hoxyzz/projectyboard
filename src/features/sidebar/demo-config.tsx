import {
  Inbox,
  GitPullRequest,
  CircleUser,
  FolderKanban,
  Eye,
  MoreHorizontal,
  UserPlus,
  Search,
  Bell,
  Settings,
  Link as LinkIcon,
  Archive,
  BellRing,
  MessageSquare,
  LogOut,
  CircleDot,
  Import,
} from "lucide-react";
import type { SidebarConfig } from "@/features/sidebar";

export const demoSidebarConfig: SidebarConfig = {
  user: {
    name: "ryoa",
    actions: (
      <div className="flex items-center gap-0.5">
        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-li-bg-hover transition-colors">
          <Search className="h-3.5 w-3.5 text-li-text-muted" />
        </button>
        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-li-bg-hover transition-colors">
          <Bell className="h-3.5 w-3.5 text-li-text-muted" />
        </button>
      </div>
    ),
  },
  topItems: [
    { id: "inbox", label: "Inbox", icon: Inbox, badge: { count: 54 }, href: "/" },
    { id: "reviews", label: "Reviews", icon: GitPullRequest, badge: { count: 2 }, href: "/" },
    { id: "my-issues", label: "My issues", icon: CircleUser, href: "/" },
  ],
  sections: [
    {
      id: "workspace",
      label: "Workspace",
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: "projects", label: "Projects", icon: FolderKanban, href: "/" },
        { id: "views", label: "Views", icon: Eye, href: "/" },
        { id: "more", label: "More", icon: MoreHorizontal, href: "/" },
      ],
      contextMenu: {
        items: [
          { id: "ws-settings", label: "Workspace settings", icon: Settings },
          { id: "ws-members", label: "Members", icon: CircleUser },
          { id: "ws-sep", label: "", separator: true },
          { id: "ws-customize", label: "Customize sidebar", icon: Settings },
        ],
      },
    },
  ],
  teams: [
    {
      id: "remco",
      label: "Remco",
      color: "hsl(142, 60%, 45%)",
      items: [
        { id: "remco-issues", label: "Issues", icon: CircleDot, href: "/" },
        { id: "remco-projects", label: "Projects", icon: FolderKanban, href: "/" },
        { id: "remco-views", label: "Views", icon: Eye, href: "/" },
      ],
      contextMenu: {
        items: [
          { id: "team-settings", label: "Team settings", icon: Settings },
          { id: "copy-link", label: "Copy link", icon: LinkIcon },
          { id: "archive", label: "Archive", icon: Archive },
          { id: "sep1", label: "", separator: true },
          { id: "subscribe", label: "Subscribe", icon: BellRing },
          { id: "slack", label: "Configure Slack notifications...", icon: MessageSquare },
          { id: "sep2", label: "", separator: true },
          { id: "leave", label: "Leave team", icon: LogOut },
        ],
      },
    },
  ],
  footerItems: [
    { id: "import", label: "Import issues", icon: Import },
    { id: "invite", label: "Invite people", icon: UserPlus },
  ],
  footerSlot: (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-li-text-muted">What's new</span>
      <span className="text-[12px] text-li-text">Deeplink to AI coding tools</span>
    </div>
  ),
};
