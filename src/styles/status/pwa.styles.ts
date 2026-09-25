// Offline strip, install banner and the update prompt.

// A full-width strip under the topbar, gutters matching the content column.
export const offlineBanner =
  "flex items-center gap-2 border-b px-4 py-2 text-sm md:px-6 lg:px-8 [&_svg]:size-4 [&_svg]:shrink-0";

export const offlineBannerLead = "font-semibold";

export const installBanner = "mt-4";

// Floats over the page, clear of the phone tab bar and the home indicator.
export const updatePrompt =
  "fixed inset-x-4 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom,0rem)+1rem)] z-40 bg-card text-card-foreground shadow-lg md:inset-x-auto md:right-6 md:bottom-6 md:w-96";

// The iOS Share glyph, sized to sit inside a line of text.
export const iosShareIcon = "inline size-4 align-text-bottom";

export const installNote = "text-sm text-muted-foreground";
