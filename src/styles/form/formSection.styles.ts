import { cva } from "class-variance-authority";

// TARTAR's form layout. Two columns on wide screens, one on compact; a field
// marked span "full" always takes the whole row.
export const formFieldGrid = "grid grid-cols-1 gap-4 wide:grid-cols-2";

export const fieldSpan = cva("", {
  variants: {
    span: { half: "", full: "wide:col-span-2" },
  },
  defaultVariants: { span: "half" },
});

export const formStack = "flex flex-col gap-6";

// A section is a card with a ruled title; on compact it can fold away.
export const formSection = "shrink-0 gap-4 [--card-spacing:--spacing(5)]";

export const formSectionHeader = "mx-(--card-spacing) border-b px-0 pb-3";

export const formSectionTitle = "font-heading text-base font-semibold text-primary";

export const formSectionDisclosure = "group/form-section flex flex-col";

export const formSectionPanelBody = "pt-(--card-spacing)";

export const formSectionHeaderToggle =
  "mx-(--card-spacing) px-0 group-data-expanded/form-section:border-b group-data-expanded/form-section:pb-1";

export const formSectionToggle =
  "group/form-section-toggle -my-2 flex min-h-11 w-full items-center gap-2 rounded-control text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export const formSectionChevron =
  "ml-auto size-4 text-muted-foreground transition-transform group-aria-expanded/form-section-toggle:rotate-180";
