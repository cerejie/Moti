// Native phone list: one surface for the whole list, rows split by hairlines.
export const listGroup = "flex flex-col divide-y divide-border overflow-hidden rounded-xl border bg-card";

export const listGroupItem = "list-none";

export const listRow =
  "flex min-h-14 w-full cursor-default items-center gap-3 px-4 py-2.5 text-left outline-none transition-colors data-[pressed]:bg-muted data-[focus-visible]:ring-3 data-[focus-visible]:ring-inset data-[focus-visible]:ring-ring/50";

export const listRowText = "flex min-w-0 flex-1 flex-col gap-0.5";

export const listRowTitle = "truncate font-semibold text-foreground";

export const listRowSubtitle = "truncate text-xs text-muted-foreground";

export const listRowTrailing = "flex shrink-0 flex-col items-end gap-0.5 text-right";

export const listRowChevron = "size-4 shrink-0 text-muted-foreground";

export const listSkeletonRow = "flex min-h-14 items-center px-4";

export const listSkeletonBar = "h-8 w-full";
