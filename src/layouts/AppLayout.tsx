import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { SidebarRoot } from "@/features/sidebar";
import { buildSidebarConfig } from "@/features/sidebar/build-config";
import { useCurrentUser } from "@/hooks/use-user";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useTeams } from "@/hooks/use-teams";
import { SearchCommand } from "@/components/search-command";
import { ShortcutCheatsheet } from "@/components/shortcut-cheatsheet";
import { useShortcut } from "@remcostoeten/use-shortcut";

/**
 * Shell layout — sidebar + routed content area.
 */
export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const { data: unreadCount } = useUnreadCount();
  const { data: teams } = useTeams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  // ─── Global keyboard shortcuts ─────────────────────────
  const $ = useShortcut({ ignoreInputs: true, sequenceTimeout: 600 });

  // Search: Cmd/Ctrl + K
  $.mod.key("k").on(() => setSearchOpen(true));

  // Route sequences: Shift+G then letter
  $.shift.key("g").then("i").on(() => navigate("/inbox"));
  $.shift.key("g").then("r").on(() => navigate("/reviews"));
  $.shift.key("g").then("m").on(() => navigate("/my-issues"));
  $.shift.key("g").then("p").on(() => navigate("/projects"));
  $.shift.key("g").then("v").on(() => navigate("/views"));

  // Notification bell: Shift+N then N
  $.shift.key("n").then("n").on(() => navigate("/inbox"));

  // Cheatsheet: Shift+?
  // Cheatsheet: Shift+/ (which is ? on most keyboards)
  $.shift.key("/").on(() => setCheatsheetOpen(true));

  const sidebarConfig = useMemo(
    () =>
      buildSidebarConfig({
        userName: user?.name ?? "…",
        inboxCount: unreadCount ?? 0,
        reviewCount: 2,
        teams: (teams ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
        })),
        onSearch: () => setSearchOpen(true),
        onNotifications: () => navigate("/inbox"),
        onInvitePeople: null,
        onImportIssues: null,
        onTeamSettings: null,
        onLeaveTeam: null,
        onNavigate: (path: string) => navigate(`/${path}`),
      }),
    [user, unreadCount, teams, navigate]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidebarRoot config={sidebarConfig} />
      <Outlet />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <ShortcutCheatsheet open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}
