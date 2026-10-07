import { cva } from "class-variance-authority";

// DataTable, ported from TARTAR: a ruled grid on wide screens, a native list on compact.
export const dataTableRoot = "flex min-w-0 flex-col";

export const dataTableGrid = "border-collapse";

export const dataTableHeader = "[&_tr]:border-border";

export const dataTableHead = cva("h-11 px-3 text-label font-medium text-muted-foreground", {
  variants: {
    align: { left: "", center: "text-center", right: "text-right" },
  },
  defaultVariants: { align: "left" },
});

export const dataTableCollapse = cva("", {
  variants: {
    collapse: { xl: "hidden xl:table-cell", "2xl": "hidden 2xl:table-cell" },
  },
});

export const dataTableRow = "group/row border-b border-border hover:bg-muted/40";

export const dataTableRowStatic = "hover:bg-transparent";

export const dataTableRowClickable = "cursor-pointer";

export const dataTableCell = cva(
  "h-14 px-3 py-2 text-sm whitespace-normal text-foreground pointer-coarse:h-16",
  {
    variants: {
      align: { left: "", center: "text-center", right: "text-right tabular-nums" },
    },
    defaultVariants: { align: "left" },
  },
);

export const dataTableStateCell = "whitespace-normal";

export const dataTableSkeletonBar = cva("h-4", {
  variants: {
    align: { left: "w-4/5", center: "mx-auto w-3/5", right: "ml-auto w-3/5" },
  },
  defaultVariants: { align: "left" },
});

export const dataTableRefreshSpinner = "ml-2 inline-flex size-3.5 align-middle text-brand";

export const dataTableEmpty = "py-8";

export const dataTableLoadingAnnounce = "sr-only";

// Rows kept from an earlier query that cannot be refreshed: a notice above, the rows dimmed.
export const dataTableStaleNotice = "mb-2";

export const dataTableStaleRows = "opacity-60";

export const dataListFrame = "relative";

export const dataList =
  "flex flex-col divide-y divide-foreground/10 border-y border-foreground/10";

export const dataListRow =
  "relative flex min-h-14 items-center gap-3 px-1 py-3 text-sm transition-colors has-data-pressed:bg-muted/70 has-data-focus-visible:ring-2 has-data-focus-visible:ring-ring has-data-focus-visible:ring-inset";

export const dataListMain = "flex min-w-0 flex-1 flex-col gap-0.5";

export const dataListTitle = "min-w-0 truncate text-left font-semibold text-foreground";

// The pseudo-element stretches the press area over the whole row.
export const dataListTitlePress =
  "min-w-0 truncate text-left font-semibold text-foreground outline-none after:absolute after:inset-0";

export const dataListSecondary =
  "flex min-w-0 items-center gap-1.5 overflow-hidden text-xs whitespace-nowrap text-muted-foreground";

export const dataListSecondaryItem = "min-w-0 truncate first:shrink-0 first:max-w-3/5";

export const dataListSeparator = "shrink-0 text-muted-foreground/60";

export const dataListTrail = "flex max-w-2/5 shrink-0 flex-col items-end gap-1 text-right";

export const dataListAmount = "flex flex-col items-end font-semibold tabular-nums";

export const dataListTags = "flex items-center justify-end gap-1";

// Controls sit above the row's stretched press area.
export const dataListRaised = "relative z-10";

export const dataListChevron = "size-4 shrink-0 text-muted-foreground/60";

export const dataListSkeletonMain = "flex flex-1 flex-col gap-2";

export const dataListSkeletonTitle = "h-4 w-2/5";

export const dataListSkeletonAmount = "h-4 w-16";

export const dataListSkeletonMeta = "h-3 w-3/5";

export const tablePanel = "flex min-w-0 flex-col gap-3";

export const tablePanelBody = "min-w-0";

export const tablePanelTitle = "font-heading text-base font-semibold text-foreground";

export const tableLoadMore =
  "flex min-h-11 items-center justify-center gap-2 pt-2 text-xs text-muted-foreground tabular-nums";

export const tablePagination =
  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2";

export const tablePaginationRange =
  "text-sm whitespace-nowrap text-muted-foreground tabular-nums";

export const tablePaginationControls = "flex items-center gap-2";

export const tablePaginationStep = "rounded-full";

export const tablePaginationNav = "mx-0 w-auto";

export const tablePaginationPages = "flex items-center gap-1";

export const tablePaginationPage = cva("size-8 rounded-full tabular-nums", {
  variants: {
    active: { true: "", false: "text-muted-foreground" },
  },
  defaultVariants: { active: false },
});

export const tablePaginationEllipsis = "size-8 text-muted-foreground";

export const tablePaginationSize = "hidden wide:flex";

export const tablePaginationSelect = "w-18";

export const tablePaginationSelectTrigger = "rounded-full";

export const nowrapCell = "whitespace-nowrap";

export const rowActionTrigger = "compact:rounded-full";

export const rowActionMenu = "w-auto min-w-48";

export const rowActionItem = "whitespace-nowrap";
