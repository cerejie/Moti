// A --motion-* duration token from theme.css, in milliseconds.
export const motionDuration = (token: "fast" | "base" | "slow") =>
  Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(`--motion-${token}`),
  ) || 0;

export const motionEase = (token: "standard" | "emphasized" | "spring") =>
  getComputedStyle(document.documentElement).getPropertyValue(`--motion-ease-${token}`).trim() ||
  "ease-out";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
