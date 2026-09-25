// Users list and the one-time temporary password.

export const userToolbarSelects = "flex flex-wrap items-center gap-2";

// User column: the name, then email (and shop for the superadmin) as one muted line.
export const userCell = "flex min-w-0 flex-col gap-0.5 whitespace-normal";

export const userName = "font-medium text-foreground";

export const userMeta = "text-xs text-muted-foreground break-all";

// Phone rows fold role and status into one right-aligned stack.
export const userBadgeStack = "flex flex-col items-end gap-1";

export const passwordPanel = "flex w-full flex-col gap-2 text-left";

export const passwordLabel = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

// Selectable in one tap, large enough to read out over the counter.
export const passwordValue =
  "min-w-0 flex-1 select-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-lg tracking-wider text-foreground break-all";

export const passwordRow = "flex items-center gap-2";

export const passwordNote = "text-xs text-muted-foreground";
