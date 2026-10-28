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
