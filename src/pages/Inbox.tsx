import { useState, useRef, useCallback, useEffect } from "react";
import { Inbox as InboxIcon, Check, CheckCheck, Circle } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { getNotificationService } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Kbd } from "@/components/kbd";
import { useCounterStore } from "@/stores/counter-store";
import { useRouteShortcuts } from "@/hooks/use-route-shortcuts";

export default function InboxPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const setCount = useCounterStore((s) => s.setCount);

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Push unread count to shared counter store
  useEffect(() => {
    setCount("inbox", unreadCount);
  }, [unreadCount, setCount]);

  const markAsRead = async (id: string) => {
    const svc = getNotificationService();
    await svc.markAsRead?.(id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAsUnread = async (id: string) => {
    // Mock: toggle read → unread
    const svc = getNotificationService();
    // The mock service doesn't have markAsUnread, so we'd need to add it.
    // For now, we toggle via the underlying data.
    const notif = notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = false;
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }
  };

  const markAllAsRead = async () => {
    const svc = getNotificationService();
    await svc.markAllAsRead?.();
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  // ─── Route shortcuts ──────────────────────────────────
  useRouteShortcuts({
    onMarkUnread: () => {
      if (focusedIdx >= 0 && filtered[focusedIdx]) {
        const n = filtered[focusedIdx];
        if (n.read) markAsUnread(n.id);
        else markAsRead(n.id);
      }
    },
    onMarkAllRead: () => markAllAsRead(),
  });

  const clampIdx = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, filtered.length - 1)),
    [filtered.length]
  );

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setFocusedIdx((i) => clampIdx(i + 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setFocusedIdx((i) => clampIdx(i - 1));
      } else if (e.key === "Enter" && focusedIdx >= 0 && filtered[focusedIdx]) {
        const n = filtered[focusedIdx];
        if (!n.read) markAsRead(n.id);
      } else if (e.key === " " && focusedIdx >= 0 && filtered[focusedIdx]) {
        e.preventDefault();
        const n = filtered[focusedIdx];
        if (!n.read) markAsRead(n.id);
      }
    },
    [focusedIdx, filtered, clampIdx]
  );

  return (
    <div className="flex-1 flex flex-col bg-li-content-bg min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between h-11 px-4 border-b border-li-content-border shrink-0">
        <div className="flex items-center gap-2">
          <InboxIcon className="h-4 w-4 text-li-text-muted" />
          <span className="text-[14px] font-medium text-li-text-bright">Inbox</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-li-dot-blue text-li-text-bright rounded-full px-1.5 py-0.5 font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "flex items-center gap-1.5 text-[12px] px-2 py-1 rounded transition-colors",
              filter === "all"
                ? "text-li-text-bright bg-li-bg-hover"
                : "text-li-text-muted hover:text-li-text-bright"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "flex items-center gap-1.5 text-[12px] px-2 py-1 rounded transition-colors",
              filter === "unread"
                ? "text-li-text-bright bg-li-bg-hover"
                : "text-li-text-muted hover:text-li-text-bright"
            )}
          >
            Unread
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-[12px] text-li-text-muted hover:text-li-text-bright transition-colors px-2 py-1 rounded hover:bg-li-bg-hover ml-1"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
              <Kbd keys={["⇧", "A", "R"]} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={listRef}
        className="flex-1 overflow-auto outline-none"
        tabIndex={0}
        onKeyDown={handleListKeyDown}
        onFocus={() => {
          if (focusedIdx < 0 && filtered.length > 0) setFocusedIdx(0);
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-sm text-li-text-muted">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 flex-col gap-2">
            <InboxIcon className="h-10 w-10 text-li-text-muted" />
            <p className="text-sm text-li-text-muted">
              {filter === "unread" ? "No unread notifications" : "No notifications"}
            </p>
          </div>
        ) : (
          filtered.map((n, idx) => (
            <div
              key={n.id}
              className={cn(
                "flex items-center h-[42px] px-4 border-b border-li-divider transition-colors cursor-pointer hover:bg-li-bg-hover group",
                !n.read && "bg-li-bg-hover/50",
                focusedIdx === idx && "ring-1 ring-inset ring-li-dot-blue bg-li-bg-hover"
              )}
              onClick={() => !n.read && markAsRead(n.id)}
              tabIndex={-1}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-2 flex justify-center shrink-0">
                  {!n.read && (
                    <Circle className="h-2 w-2 text-li-dot-blue fill-li-dot-blue" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[13px] truncate",
                    n.read ? "text-li-text-muted" : "text-li-text-bright font-medium"
                  )}
                >
                  {n.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="text-[11px] text-li-text-muted">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-li-text-muted hover:text-li-text-bright"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
