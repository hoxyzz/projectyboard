import React from "react";

export type SidebarIcon = React.ComponentType<{ className?: string }>;

export type NavBadge = {
  count: number;
};

export type NavItem = {
  id: string;
  label: string;
  icon?: SidebarIcon;
  href?: string;
  badge?: NavBadge;
  action?: () => void;
  shortcut?: string;
  indent?: number; // indentation level (0 = none, 1 = one step, 2 = two steps, etc.)
  contextMenu?: ContextMenuConfig;
};

export type ContextMenuItem = {
  id: string;
  label: string;
  icon?: SidebarIcon;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
};

export type ContextMenuConfig = {
  items: ContextMenuItem[];
};

export type NavSection = {
  id: string;
  label?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: NavItem[];
  headerAction?: React.ReactNode;
  contextMenu?: ContextMenuConfig;
};

export type TeamConfig = {
  id: string;
  label: string;
  color?: string;
  items: NavItem[];
  headerAction?: React.ReactNode;
  contextMenu?: ContextMenuConfig;
};

export type UserConfig = {
  name: string;
  avatar?: string;
  actions?: React.ReactNode;
};

export type SidebarConfig = {
  user: UserConfig;
  topItems: NavItem[];
  sections: NavSection[];
  teams: TeamConfig[];
  footerItems?: NavItem[];
  footerSlot?: React.ReactNode;
};
