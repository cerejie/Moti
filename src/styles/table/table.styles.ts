import { cva } from "class-variance-authority";

// DataTable is drawn as a stack of row-cards rather than a ruled grid: the rows
// are separated, each one carries its own border and rounded ends, and the
// header is a tinted bar above them. Ported from the TARTAR transaction table.

// The rows are surface-coloured cards, so the tray behind them has to be the
// canvas or they have nothing to sit on.
export const dataTableTray = "bg-background pt-1 pb-3";

// Separated rows are what turn each one into its own card.
export const dataTableGrid = "border-separate border-spacing-y-2";

// The tinted bar replaces the rule shadcn draws under the header.
export const dataTableHeader = "[&_tr]:border-b-0";

export const dataTableHead =
  "bg-primary-soft px-4 py-2.5 text-xs font-bold uppercase tracking-wider first:rounded-l-md last:rounded-r-md";

// The cards are the cells; the row itself only carries the hover group.
export const dataTableRow = "group/row border-b-0 hover:bg-transparent";

// Hover lifts the whole card's outline rather than repainting its fill, so a
// row with status colours in it does not change hue under the cursor.
export const dataTableCell =
  "border-y border-border bg-card px-4 py-3 transition-colors group-hover/row:border-primary";

export const dataTableCellEnds =
  "first:rounded-l-md first:border-l last:rounded-r-md last:border-r";

// An expanded row keeps its outline lifted and drops its bottom rounding into
// the panel below it.
export const dataTableCellExpanded =
  "border-primary first:rounded-tl-md first:border-l last:rounded-tr-md last:border-r";

export const tableRowClickable = "cursor-pointer";

export const tableHeadNumeric = "text-right";

export const tableCellNumeric = "text-right tabular-nums";

export const tableCellActions = "w-px whitespace-nowrap text-right";

// Names the actions column for screen readers without a visible header.
export const tableHeadHidden = "sr-only";

// The expanded panel spans the full row beneath the record it belongs to, and
// repeats the card shape so the pair reads as one record.
export const tableExpansionCell =
  "rounded-md border border-primary bg-card p-0 whitespace-normal";

export const tableExpansionInner = "px-4 py-4";

// Loading rows keep the column layout in place instead of a spinner.
export const tableSkeletonBar = "h-4 w-full";

// Error and empty states fill the row as a single card, wrapping like body text.
export const tableStateCell =
  "rounded-md border border-border bg-card whitespace-normal";

// Announces the loading state to assistive tech without showing a second label.
export const tableLoadingAnnounce = "sr-only";

export const simpleTableHead = cva("", {
  variants: {
    align: { left: "", center: "text-center", right: "text-right" },
  },
  defaultVariants: { align: "left" },
});

export const simpleTableCell = cva("", {
  variants: {
    align: { left: "", center: "text-center", right: "text-right tabular-nums" },
    wrap: { true: "whitespace-normal align-top", false: "" },
  },
  defaultVariants: { align: "left", wrap: false },
});

// shadcn wraps the table in its own horizontal scroller, which would become
// the sticky header's scroll parent; releasing it lets the header stick to the
// outer viewport instead, and the header gets the surface behind it.
export const simpleTableSticky =
  "[&>[data-slot=table-container]]:overflow-visible [&_[data-slot=table-head]]:sticky [&_[data-slot=table-head]]:top-0 [&_[data-slot=table-head]]:z-10 [&_[data-slot=table-head]]:bg-background";
