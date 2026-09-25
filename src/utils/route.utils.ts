import { lazy, type ComponentType } from "react";

// Mirrors NavLink's own matching: the root path matches exactly, every other
// path also matches its subpaths, so a subpage keeps its module highlighted.
export const isRouteActive = (path: string, pathname: string) =>
  path === pathname || (path !== "/" && pathname.startsWith(`${path}/`));

// A route page split into its own chunk. The route renders it at once inside the
// layout's Suspense, and `preload` fetches the chunk before the first visit.
export const lazyPage = (loader: () => Promise<{ default: ComponentType }>) => ({
  Component: lazy(loader),
  preload: loader,
});
