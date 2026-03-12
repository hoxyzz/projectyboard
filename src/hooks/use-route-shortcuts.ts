/**
 * Shared route-level shortcut pattern.
 *
 * Shortcut scheme:
 *   a → r       = toggle read on focused item (action + read)
 *   a → r → a   = mark all read (action + read + all)
 *   n / Shift+N  = new item
 *   o            = open selected
 *   e            = focus editor
 *   /            = focus primary input
 *   Alt+S        = save
 *   1            = filter: all
 *   2            = filter: unread
 */
import { useShortcut } from "@remcostoeten/use-shortcut";

export interface RouteActions {
  /** n / Shift+N — new item */
  onNew?: () => void;
  /** o — open selected item */
  onOpen?: () => void;
  /** e — focus editor */
  onEdit?: () => void;
  /** / — focus primary input */
  onFocusInput?: () => void;
  /** Alt+S — save */
  onSave?: () => void;
  /** a → r — toggle read/unread on focused item */
  onToggleRead?: () => void;
  /** a → r → a — mark all as read */
  onMarkAllRead?: () => void;
  /** 1 — filter: all */
  onFilterAll?: () => void;
  /** 2 — filter: unread */
  onFilterUnread?: () => void;
}

export function useRouteShortcuts(actions: RouteActions) {
  const $ = useShortcut({ ignoreInputs: true, sequenceTimeout: 600 });

  if (actions.onNew) {
    const cb = actions.onNew;
    $.key("n").except("typing").on(() => cb());
    $.shift.key("n").except("typing").on(() => cb());
  }

  if (actions.onOpen) {
    const cb = actions.onOpen;
    $.key("o").except("typing").on(() => cb());
  }

  if (actions.onEdit) {
    const cb = actions.onEdit;
    $.key("e").except("typing").on(() => cb());
  }

  if (actions.onFocusInput) {
    const cb = actions.onFocusInput;
    $.key("/").except("typing").on(() => cb(), { preventDefault: true });
  }

  if (actions.onSave) {
    const cb = actions.onSave;
    $.alt.key("s").on(() => cb(), { preventDefault: true });
  }

  // a → r = toggle read on focused
  if (actions.onToggleRead) {
    const cb = actions.onToggleRead;
    $.key("a").then("r").except("typing").on(() => cb());
  }

  // a → r → a = mark all read
  if (actions.onMarkAllRead) {
    const cb = actions.onMarkAllRead;
    $.key("a").then("r").then("a").except("typing").on(() => cb());
  }

  // Filter shortcuts
  if (actions.onFilterAll) {
    const cb = actions.onFilterAll;
    $.key("1").except("typing").on(() => cb());
  }

  if (actions.onFilterUnread) {
    const cb = actions.onFilterUnread;
    $.key("2").except("typing").on(() => cb());
  }
}
