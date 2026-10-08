// Only the wide shell renders the sidebar; below lg the panel is an icon rail
// (labels stay for screen readers), so tablet tables keep their width.
export const sidebarRoot =
  "h-auto shrink-0 overflow-hidden rounded-panel border py-2 shadow-panel max-lg:w-18";

export const sidebarContent = "gap-1 px-2 py-1";

export const sidebarGroup = "px-1 py-1";

export const sidebarGroupLabel =
  "h-7 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase max-lg:sr-only";

export const sidebarMenu = "gap-1";

// Hover takes a quiet grey; the brand fill is reserved for the active item.
export const sidebarMenuButton =
  "h-11 gap-3 rounded-xl px-3 text-body font-medium text-muted-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:font-semibold data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent data-active:hover:text-sidebar-accent-foreground [&_svg]:size-5 max-lg:justify-center max-lg:px-0 max-lg:[&>span]:sr-only";
