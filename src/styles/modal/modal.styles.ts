import { cva } from "class-variance-authority";

// AppModal sits on shadcn's Dialog (md+) and a bottom Sheet (phones) and uses
// their header and footer as generated. Only the height cap and the scrolling
// body are added, so a long form scrolls inside the frame instead of past it.
export const modalContent = "max-h-[calc(100dvh-2rem)]";

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

// The body bleeds to the dialog's edges so its scrollbar sits at the border.
export const modalBody = "-mx-6 max-h-[70dvh] overflow-y-auto px-6";

// Keeps the title for screen readers while the modal draws its own heading.
export const modalHeaderHidden = "sr-only";

// Every modal shares one frame: a ruled header row (the title, or just the ✕
// when the body draws its own heading), the scrolling body, and a ruled footer
// holding the actions. Nothing opts out, so no modal has to remember it.

// A visible title header, ruled off from the body. Bleeds to the dialog's
// edges (p-6) and keeps room on the right for the ✕; the title's line box
// matches the ✕ button's height so the two centre on one line.
export const modalHeaderRuled =
  "-mx-6 -mt-6 border-b border-border px-6 py-4 pr-14 [&_[data-slot=dialog-title]]:leading-8";

// A hidden header that still gives the close button a ruled row of its own,
// so the ✕ never sits over the body.
export const modalCloseBar = "-mx-6 -mt-6 h-14 border-b border-border";

// The sheet's own header padding (p-4) already frames the title and the ✕.
export const drawerHeaderRuled = "border-b border-border";

export const drawerCloseBar = "h-14 border-b border-border";

// Footer buttons keep the default type size but take roomier padding.
export const modalActionSize =
  "[&_[data-slot=button]]:h-11 [&_[data-slot=button]]:px-6";

// The ruled action row, matching the header. Bleeds to the dialog's edges.
export const modalFooter = `-mx-6 -mb-6 border-t border-border px-6 py-4 ${modalActionSize}`;

// Clears the home indicator on an installed app; the sheet's own padding
// (p-4) already frames the buttons.
export const drawerFooter = `border-t border-border pb-safe ${modalActionSize}`;

export const drawerContent = "max-h-[92dvh]";

export const drawerBody = "overflow-y-auto px-4";

// A form inside a modal owns the footer, so it must fill the sheet height;
// the API error and the fields stack under one gap.
export const modalForm = "flex min-h-0 flex-col gap-4";

// A body that brings its own padding (tabs, a print sheet) edge to edge.
export const modalBodyFlush = "mx-0 px-0";

// A body that opens with a tab list pulls it up under the header rule; the
// list's own height is the breathing room.
export const modalBodyTabs = "-mt-4";
