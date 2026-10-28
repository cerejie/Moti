import { cn } from "../../utils/cn.utils";
import { pageSubtitle, pageTitle } from "../common/typography.styles";

// Pushed detail page: one readable column of grouped sections, like a native detail screen.
export const detailPage = "flex w-full flex-col gap-6 wide:max-w-2xl";

// The record's name is the page title and wraps rather than truncates.
export const detailPageHeading = "flex min-w-0 flex-col gap-1";

export const detailPageTitle = cn(pageTitle, "break-words");

export const detailPageMeta = pageSubtitle;

export const detailPageSection = "flex flex-col gap-2";

export const detailPageSectionTitle =
  "px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase";

// Lifts the grouped rows off the page backdrop.
export const detailPageSurface = "overflow-hidden rounded-card bg-card";

// The hero: the number the page is opened for, with its primary actions.
export const detailHeroBody = "flex flex-col gap-4";

export const detailHeroTop = "flex items-start justify-between gap-3";

export const detailHeroFigure = "flex min-w-0 flex-col gap-1";

export const detailHeroLabel = "text-xs font-medium tracking-wide text-muted-foreground uppercase";

export const detailHeroHint = "text-sm text-muted-foreground";

// The related records under the facts.
export const detailPageList = "flex flex-col divide-y overflow-hidden rounded-card border bg-card";

export const detailPageRow = "flex items-center gap-3 px-4 py-3";

export const detailPageRowText = "flex min-w-0 flex-1 flex-col gap-0.5";

// Manage: full-width actions, edit first and the destructive one last.
export const detailManageActions = "flex flex-col gap-2";

export const detailManageButton = "w-full";

export const detailManageHint = "px-1 text-sm text-muted-foreground";
