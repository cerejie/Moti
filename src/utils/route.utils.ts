// Mirrors NavLink's own matching: the root path matches exactly, every other
// path also matches its subpaths, so a subpage keeps its module highlighted.
export const isRouteActive = (path: string, pathname: string) =>
  path === pathname || (path !== "/" && pathname.startsWith(`${path}/`));

// Moves the address bar without a navigation, so a router rebuilt for the new
// session (sign-in, sign-out) starts on this path instead of the old one.
export const resetLocation = (path: string) => {
  window.history.replaceState(null, "", path);
};
