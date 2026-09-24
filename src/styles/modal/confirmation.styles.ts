import { modalActionSize } from "./modal.styles";

// ConfirmationModal. One instance is mounted in App.tsx and driven by the
// confirm store. The frame is shadcn's AlertDialog. A delete leads with a tinted
// media chip.
export const confirmMedia = "bg-danger-bg text-danger";

export const confirmLead = "flex items-center gap-6";

export const confirmLeadText = "min-w-0 flex-1";

// The ✕ sits centred in the ruled close bar (h-14) every hideHeader modal has.
export const confirmClose = "absolute top-3 right-4";

export const confirmCloseLabel = "sr-only";

export const confirmTitle = "text-2xl font-bold";

export const confirmDescription = "text-md";

export const confirmBody = "flex flex-col gap-4";

// Multi-line change lists arrive joined by newlines.
export const confirmItem = "whitespace-pre-line";

export const confirmPhraseGroup = "flex flex-col gap-2";

// The same ruled action row every AppModal has. Bleeds to the dialog's edges.
// AlertDialogCancel replaces the button's data-slot with its own, so it is
// sized here as well or it ends up smaller than the action beside it.
export const confirmFooter = `-mx-6 -mb-6 border-t border-border px-6 py-4 ${modalActionSize} [&_[data-slot=alert-dialog-cancel]]:h-11 [&_[data-slot=alert-dialog-cancel]]:px-6`;
