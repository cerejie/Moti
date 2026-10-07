import { cva } from "class-variance-authority";
import { modalActionSize } from "./modal.styles";

// ConfirmationModal, TARTAR's frame. One instance is mounted in App.tsx and
// driven by the confirm store: an AlertDialog on wide screens, a bottom sheet
// with a centred icon and stacked full-width buttons on compact ones.
export const confirmContent = "rounded-sheet bg-panel ring-border shadow-overlay";

export const confirmMedia = cva("", {
  variants: {
    kind: {
      confirm: "bg-brand-soft text-brand",
      delete: "bg-danger-bg text-danger",
    },
  },
  defaultVariants: { kind: "confirm" },
});

export const confirmBody = "flex flex-col gap-4";

export const confirmSheetBody = "px-4";

// Multi-line change lists arrive joined by newlines.
export const confirmItem = "whitespace-pre-line";

export const confirmPhraseGroup = "flex flex-col gap-2";

// AlertDialogCancel replaces the button's data-slot with its own, so it is
// sized here as well or it ends up smaller than the action beside it.
export const confirmFooter = `sm:flex-wrap -mx-6 -mb-6 rounded-b-sheet border-t border-border bg-muted/50 px-6 py-4 ${modalActionSize} [&_[data-slot=alert-dialog-cancel]]:h-11 [&_[data-slot=alert-dialog-cancel]]:px-6`;

export const confirmSheetHeader = "items-center pt-6 text-center";

export const confirmSheetMedia =
  "flex size-12 items-center justify-center rounded-full [&_svg]:size-6";

export const confirmSheetFooter =
  "flex-col gap-2 px-4 pb-safe [&_[data-slot=button]]:h-11 [&_[data-slot=button]]:w-full";
