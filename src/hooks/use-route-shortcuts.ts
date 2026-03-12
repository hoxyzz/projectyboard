/**
 * Shared route-level shortcut pattern.
 *
 * Pages call useRouteShortcuts() and pass their action map.
 * Shortcuts only fire outside editable contexts via `.except("typing")`.
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
  /** Shift+R — mark selection unread */
  onMarkUnread?: () => void;
  /** Shift+A then R — mark all read */
  onMarkAllRead?: () => void;
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

  if (actions.onMarkUnread) {
    const cb = actions.onMarkUnread;
    $.shift.key("r").except("typing").on(() => cb());
  }

  if (actions.onMarkAllRead) {
    const cb = actions.onMarkAllRead;
    $.shift.key("a").then("r").on(() => cb());
  }
}
