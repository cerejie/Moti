export type NavDirection = "push" | "back" | "fade";

// theme.css picks the page animation from this attribute while a view transition runs.
export const setNavDirection = (direction: NavDirection) => {
  document.documentElement.dataset.nav = direction;
};

// The browser or Android back gesture pops the stack, so it animates as "back".
export const watchHistoryPop = () => {
  const handlePop = () => setNavDirection("back");
  window.addEventListener("popstate", handlePop);
  return () => window.removeEventListener("popstate", handlePop);
};
