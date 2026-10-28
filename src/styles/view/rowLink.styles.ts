// Stretched over the nearest positioned row, so the whole row takes the tap.
export const rowLink =
  "cursor-pointer outline-none transition-opacity after:absolute after:inset-0 data-pressed:opacity-60 focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50 motion-reduce:transition-none";

// A control beside the link sits above its tap area and keeps its own press.
export const rowLinkRaised = "relative z-10";
