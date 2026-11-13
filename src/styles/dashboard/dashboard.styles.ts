import { rowLinkRaised } from "../view/rowLink.styles";

// Attention and recent-change lists inside the dashboard's section cards.
export const dashboardList = "flex flex-col divide-y";

// Positioned, so a RowLink inside takes the whole row.
export const dashboardRow = "relative flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0";

export const dashboardRowText = "flex min-w-0 flex-col gap-0.5";

export const dashboardRowEnd = "flex shrink-0 items-center gap-2";

// A row's own action: above the row link's tap area, and thumb-sized on a phone.
export const attentionAction = `${rowLinkRaised} min-h-touch wide:min-h-9`;

// Each panel keeps its own height beside the other instead of stretching to the taller one.
export const dashboardPanels = "wide:items-start";

// The right column stacks Order next above the recent changes.
export const dashboardStack = "flex flex-col gap-4";

// Two tiles per row until xl: beside the sidebar, four only fit from there.
export const summaryGrid = "grid grid-cols-2 gap-3 wide:gap-4 xl:grid-cols-4";
