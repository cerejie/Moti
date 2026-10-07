import { cva } from "class-variance-authority";

// TARTAR's modal frame: AppModal is shadcn's Dialog on wide screens and a bottom
// Sheet on compact ones, drawn on the panel surface with a ruled header, a
// scrolling body and a ruled, tinted action row.
export const modalContent =
  "max-h-[calc(100dvh-2rem)] rounded-sheet bg-panel ring-border shadow-overlay";

// sm is the Dialog's own default width; the larger sizes widen it for tables
// and side-by-side detail.
export const modalSize = cva("", {
  variants: {
    size: {
      sm: "sm:max-w-md",
      md: "sm:max-w-xl",
      lg: "sm:max-w-3xl",
      xl: "sm:max-w-5xl",
    },
  },
  defaultVariants: { size: "md" },
});

// The title's line box matches the ✕ (44 px on touch screens) so the two centre on one line.
export const modalHeaderRuled =
  "-mx-6 -mt-6 border-b border-border px-6 py-4 pr-16 [&_[data-slot=dialog-title]]:text-base [&_[data-slot=dialog-title]]:font-semibold [&_[data-slot=dialog-title]]:leading-8 pointer-coarse:[&_[data-slot=dialog-title]]:leading-11";

// Keeps the title for screen readers while the modal draws its own heading.
export const modalHeaderHidden = "sr-only";

// A hidden header still gives the ✕ a ruled row of its own, so it never sits over the body.
export const modalCloseBar = "-mx-6 -mt-6 h-14 border-b border-border";

// The body bleeds to the dialog's edges so its scrollbar sits at the border.
export const modalBody = "-mx-6 -my-1 max-h-[70dvh] overflow-y-auto px-6 py-1";

export const modalActionSize =
  "[&_[data-slot=button]]:h-11 [&_[data-slot=button]]:px-6";

// A row that stays put between the scrolling body and the actions, such as a running total.
export const modalPinned = "-mx-6 border-t border-border px-6";

export const modalFooter = `flex-wrap -mx-6 -mb-6 rounded-b-sheet border-t border-border bg-muted/50 px-6 py-4 ${modalActionSize}`;

// While an iOS keyboard is open the sheet rides on top of it and fits the space left.
export const drawerContent =
  "max-h-[min(92dvh,calc(var(--visible-height)-2rem))] rounded-t-sheet bg-panel data-[side=bottom]:bottom-(--keyboard-inset)";

// How much of the phone a sheet claims: an action list hugs its content, a record
// starts at 60%, a form takes the screen below the status bar, a flow all of it.
export const drawerKind = cva("", {
  variants: {
    kind: {
      action: "",
      detail: "data-[side=bottom]:min-h-[60dvh]",
      form: "data-[side=bottom]:h-[calc(var(--visible-height)-max(env(safe-area-inset-top),0.75rem))] max-h-none",
      flow: "data-[side=bottom]:h-(--visible-height) max-h-none rounded-t-none",
    },
  },
  defaultVariants: { kind: "action" },
});

export const drawerHeaderRuled =
  "border-b border-border pr-16 [&_[data-slot=sheet-title]]:text-base [&_[data-slot=sheet-title]]:font-semibold [&_[data-slot=sheet-title]]:leading-8 pointer-coarse:[&_[data-slot=sheet-title]]:leading-11";

export const drawerCloseBar = "h-14 border-b border-border";

export const drawerBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-1 [&_:is(input,textarea)]:scroll-mt-14 [&_:is(input,textarea)]:scroll-mb-4";

export const drawerPinned = "border-t border-border px-4";

// Keeps the sheet's 1rem bottom and grows it to clear the home indicator on an installed app.
export const drawerFooter = `border-t border-border bg-muted/50 pb-safe ${modalActionSize} [&_[data-slot=button][data-variant=default]]:h-12`;

// A form inside a modal owns the footer; the API error and the fields stack under one gap.
export const modalForm = "flex min-h-0 flex-col gap-6";

// A body that brings its own padding (tabs, a print sheet) edge to edge.
export const modalBodyFlush = "mx-0 px-0";

// A body that opens with a tab list pulls it up under the header rule.
export const modalBodyTabs = "-mt-4";

// The submit button of a destructive form takes the danger fill.
export const confirmAction = cva("", {
  variants: {
    kind: {
      confirm: "",
      delete: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
  },
  defaultVariants: { kind: "confirm" },
});

export const detailGrid = "grid grid-cols-1 gap-x-6 gap-y-4 wide:grid-cols-2";

export const detailItem = cva("flex min-w-0 flex-col gap-1", {
  variants: {
    wide: {
      true: "wide:col-span-2",
      false: "",
    },
  },
  defaultVariants: { wide: false },
});

export const detailLabel = "text-xs font-medium text-muted-foreground";

export const detailValue = "min-w-0 text-sm font-medium text-foreground";
