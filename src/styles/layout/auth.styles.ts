import { cva } from "class-variance-authority";

// Sign-in screens: TARTAR's split layout — a carbon hero panel beside a floating
// form card on the app backdrop. Below lg only the card shows, and on phones the
// form sits flat on the backdrop like a native screen.
export const authPage = "flex min-h-dvh flex-1 bg-app px-safe font-sans text-foreground";

export const authHero =
  "relative my-4 ml-4 hidden w-2/5 max-w-xl flex-col overflow-hidden rounded-panel bg-hero p-12 text-on-hero shadow-panel lg:flex";

export const authHeroBrand = "relative z-10 flex items-center gap-3";

export const authHeroBody =
  "relative z-10 my-auto pb-24 animate-in fade-in-0 slide-in-from-bottom-3 duration-700 fill-mode-both motion-reduce:animate-none";

export const authHeroTitle =
  "mb-3 text-3xl leading-tight font-bold tracking-tight text-on-hero";

export const authHeroAccent = "text-on-hero-accent";

export const authHeroCopy = "max-w-md text-md leading-relaxed text-on-hero-muted";

export const authHeroList = "mt-8 flex flex-col gap-3.5";

export const authHeroItem = "flex items-center gap-3 text-sm text-on-hero";

export const authHeroIcon =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-on-hero-accent [&_svg]:size-4";

// Racing stripes in the hero's lower corner: the sporty accent, decoration only.
export const authStripes =
  "pointer-events-none absolute -right-16 bottom-10 flex -skew-x-12 flex-col gap-3 opacity-90";

export const authStripe = cva("h-3 rounded-pill bg-primary", {
  variants: {
    length: {
      long: "w-80",
      medium: "ml-10 w-60 opacity-70",
      short: "ml-20 w-40 opacity-40",
    },
  },
});

export const authMain = "flex flex-1 items-center justify-center px-6 py-6 sm:py-8";

export const authCard =
  "relative w-full max-w-md gap-0 sm:rounded-panel sm:border sm:border-border sm:bg-panel sm:px-10 sm:py-11 sm:shadow-panel sm:animate-in sm:fade-in-0 sm:zoom-in-95 sm:slide-in-from-bottom-4 sm:duration-500 sm:fill-mode-both motion-reduce:animate-none";

export const authCardBrand = "mb-6 lg:hidden";

export const authTitle = "mb-1.5 text-2xl font-bold tracking-tight text-foreground";

export const authSubtitle = "block text-sm text-muted-foreground";

export const authForm = "mt-7 flex flex-col gap-4";

export const authMeta = "-mt-1 flex justify-end";

export const authHint = "h-auto p-0 text-sm font-medium text-muted-foreground hover:text-foreground";

export const authSubmit = "h-12 w-full rounded-lg text-md font-semibold";

export const authAlt =
  "mt-6 flex flex-wrap items-center justify-center gap-1 border-t border-border pt-5 text-sm text-muted-foreground";

export const authAltLink = "h-auto p-0 font-semibold";

export const authSuccess = "mt-7 gap-5 border-0 p-0";

export const authSuccessIcon =
  "size-14 rounded-full bg-primary-soft text-primary [&_svg:not([class*='size-'])]:size-7";

export const authSuccessTitle = "text-lg font-semibold text-foreground";

export const authSuccessText = "text-sm leading-relaxed text-muted-foreground";
