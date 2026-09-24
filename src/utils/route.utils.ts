// Mirrors NavLink's own matching: the root path matches exactly, every other
// path also matches its subpaths, so a subpage keeps its module highlighted.
export const isRouteActive = (path: string, pathname: string) =>
  path === pathname || (path !== "/" && pathname.startsWith(`${path}/`));
