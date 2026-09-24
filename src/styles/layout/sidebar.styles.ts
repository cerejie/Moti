// Brand row: the mark beside the wordmark, centred as a pair, at the same
// footprint as the registry's lg menu button but static - no link, hover or
// tooltip. Collapsed, it is held at 48px while the mark steps down.
export const sidebarBrandButton =
  "flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-md p-3 transition-[width,height,padding] group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-0!";

export const sidebarBrandLogo =
  "size-8 shrink-0 group-data-[collapsible=icon]:size-7";

export const sidebarBrandText =
  "grid min-w-0 text-3xl leading-tight group-data-[collapsible=icon]:hidden";

export const sidebarBrandName = "truncate font-semibold tracking-tight";

// Heading above the items, in full foreground rather than the registry's
// faded 70%. Collapsed, the registry only fades it out, so it must also stop
// catching the pointer over the icons beneath it.
export const sidebarGroupLabel =
  "text-base font-semibold text-sidebar-foreground group-data-[collapsible=icon]:pointer-events-none";

// Rail spacing: header and groups share one side gutter so the brand row and
// the pills line up; the groups sit tight vertically.
// Collapsed, the header, groups and footer widen the gutter to 24px so a 48px square
// centres in the 96px rail by padding alone, the way the registry centres its
// 32px square in 48px; nothing reflows while the width animates.
export const sidebarHeader = "px-4 group-data-[collapsible=icon]:px-6";

export const sidebarContent = "gap-0";

export const sidebarGroup = "px-5 py-1 group-data-[collapsible=icon]:px-6";

export const sidebarMenu = "gap-3";

// Items render at the registry's size; hover takes the light primary tint so the
// solid accent stays reserved for the active item. Collapsed, the item is a
// 48px square whose 12px padding centres the 24px icon; the label stays in the
// DOM and is clipped by the button's overflow as the width animates.
export const sidebarMenuButton =
  "hover:bg-sidebar-hover hover:text-sidebar-foreground active:bg-sidebar-hover active:text-sidebar-foreground data-active:hover:bg-sidebar-accent data-active:hover:text-sidebar-accent-foreground data-active:active:bg-sidebar-accent data-active:active:text-sidebar-accent-foreground h-12 text-lg [&_svg]:size-5 px-3 gap-3 group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-3! group-data-[collapsible=icon]:[&_svg]:size-6";
