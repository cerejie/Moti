import { cva } from "class-variance-authority";

// SectionCard sits on shadcn's Card and keeps its spacing, radius and shadow.
// Only the tone colours and the unpadded variant are added here.
export const sectionCardRoot = cva("", {
  variants: {
    tone: {
      surface: "",
      ink: "border-transparent bg-primary text-primary-foreground",
      accent: "border-primary-border bg-primary-soft text-foreground",
    },
    padded: {
      true: "",
      false: "py-0",
    },
    // Drops shadcn's outline ring and hairline shadow; only the surface stays.
    bordered: {
      true: "",
      false: "shadow-none ring-0",
    },
  },
  defaultVariants: { tone: "surface", padded: true, bordered: true },
});

// Header keeps shadcn's title/description/action grid; the tighter row gap
// matches the rest of the app's heading blocks.
export const sectionCardHeader = "gap-x-4 gap-y-0.5";

export const sectionCardActions = "flex items-center gap-2";

export const sectionCardBody = "flex flex-col gap-4";

// Lets the body take the rest of a stretched card, for a map or a chart.
export const sectionCardFill = "min-h-0 flex-1";

export const sectionCardFooter = "justify-end gap-2 border-t";

// An unpadded card still needs its own inner padding on header and footer,
// while the body sits flush so a table or map reaches the card edge and its
// toolbar and pagination rows meet it on their own borders.
export const sectionCardInset = "py-4";

export const sectionCardFlush = "gap-0 px-0";
