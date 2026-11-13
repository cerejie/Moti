import { cva } from "class-variance-authority";
import { moneyLevel } from "../common/money.styles";

// The note under who made the movement wraps, so it does not set the column's width.
export const movementByCell = "flex min-w-24 flex-col gap-0.5 whitespace-normal";

export const movementNote = "text-xs text-muted-foreground";

// The hero figure: the direction icon beside the signed count, sized like a transaction total.
export const movementHeroValue = "flex items-center gap-3";

export const movementHeroQuantity = cva(moneyLevel({ level: "primary" }), {
  variants: {
    direction: {
      in: "text-success",
      out: "text-danger",
    },
  },
});

// The records a movement belongs to, each a row that opens its page.
export const movementLinkIcon =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-4";

export const movementLinkChevron = "size-4 shrink-0 text-muted-foreground";

// The Stock tab's three actions: a row of equal tiles on phones, header buttons on desktop.
export const stockActions = "grid grid-cols-3 gap-2 wide:flex wide:flex-wrap";

// On phones each tile stacks its icon over a label that may wrap to two lines.
export const stockActionButton =
  "compact:h-auto compact:min-h-16 compact:flex-col compact:gap-1 compact:whitespace-normal compact:px-2 compact:py-2 compact:text-xs compact:leading-tight";
