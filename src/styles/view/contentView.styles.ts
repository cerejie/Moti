import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn.utils";
import { pageTitle } from "../common/typography.styles";

// TARTAR's page header: the large title is visible at every width; the app
// bar picks the title up once it scrolls away on compact screens.
export const contentViewRoot = "flex min-w-0 flex-col gap-6";

export const contentViewHead = "flex flex-wrap items-center gap-3";

export const contentViewHeading = "flex min-w-0 flex-1 flex-col gap-1 wide:min-w-fit";

export const contentViewTitle = cn(pageTitle, "truncate");

// A sub-page's link back to its section, above the title and pulled into the gutter.
export const contentViewBack =
  "-ml-3 self-start text-base font-medium [&_svg:not([class*='size-'])]:size-5";

// On compact the slot dissolves so tabs and actions each take their own row.
export const contentViewHeadActions =
  "flex min-w-0 flex-wrap items-center gap-2 compact:contents wide:flex-nowrap";

export const contentViewTabs =
  "-mx-1 min-w-0 basis-full overflow-x-auto overscroll-x-contain px-1 py-0.5 [scrollbar-width:none] empty:hidden compact:order-last wide:basis-auto";

export const contentViewHeadDivider =
  "mx-1 hidden h-6 self-center! wide:block [[data-slot=view-tabs]:empty+&]:hidden";

// Moti keeps actions on their own full-width row on compact (TARTAR inlines
// them), so the title never truncates beside two buttons at 360px.
export const contentViewActions =
  "flex flex-wrap items-center gap-2 compact:basis-full compact:[&>*]:flex-1";

export const contentViewBody = cva("flex min-w-0 flex-col", {
  variants: {
    layout: {
      stack: "gap-6",
      bento: "gap-4",
    },
  },
  defaultVariants: { layout: "stack" },
});
