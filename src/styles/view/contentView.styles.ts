import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn.utils";
import { appShellGutterBleed } from "../layout/appShell.styles";

// Page shell. Replaces common/PageHeader.tsx plus the per-page wrapper each
// screen declared for itself.
export const contentViewRoot = "flex flex-col gap-6";

export const contentViewHeader =
  "flex flex-col gap-4 md:flex-row md:items-start md:justify-between";

export const contentViewHeading = "flex flex-col gap-1";

// A sub-page's back link stands in for the heading. It is pulled out of the
// column's gutter toward the rail so it reads as navigation, not as part of
// the table below it, and drops a little under the topbar.
export const contentViewBack =
  "-ml-3 mt-4 self-start text-base font-medium md:-ml-5 lg:-ml-12 [&_svg:not([class*='size-'])]:size-6";

export const contentViewActions = "flex flex-wrap items-center gap-2";

// On a phone the actions row goes full width so buttons keep a 44px target.
export const contentViewActionsMobile = "w-full [&>*]:flex-1";

// The card surface: the frame cancels the shell's gutters and lays down its
// own 10px on every side, so the card sits that far from the rail, the topbar,
// the panel edge and the bottom, and grows to fill the scroll box. Inside, the
// header and body keep the plain shell's 24px rhythm (CardContent ships gap-3).
export const contentViewCardFrame = cn(
  appShellGutterBleed,
  "flex flex-1 flex-col p-8",
);

// No ring and no shadow so the frame reads as a plain white surface.
export const contentViewCard = "w-full flex-1 shadow-none ring-0";

export const contentViewCardBody = "gap-6";

export const contentViewBody = cva("flex flex-col", {
  variants: {
    layout: {
      stack: "gap-6",
      bento: "gap-4",
    },
  },
  defaultVariants: { layout: "stack" },
});
