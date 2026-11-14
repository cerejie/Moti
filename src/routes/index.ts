import { createBrowserRouter } from "react-router-dom";
import RouteRoot from "../components/common/layout/RouteRoot";
import RouteErrorState from "../components/common/status/RouteErrorState";
import type { IRoute } from "../models/common/route.model";
import { protectedRoutes } from "./protected.routes";
import { publicRoutes } from "./public.routes";
import { NotFoundRoute, SignedOutRoute } from "./route.guard";

// React Router empties a route's `lazy` object once its screen loads, and the route
// constants are shared, so each router gets its own copies; otherwise a router rebuilt
// at sign-in or sign-out finds those screens missing.
const withOwnLazy = (routes: IRoute[]): IRoute[] =>
  routes.map((route) => {
    const lazy = typeof route.lazy === "object" ? { ...route.lazy } : route.lazy;
    return route.children
      ? { ...route, lazy, children: withOwnLazy(route.children) }
      : { ...route, lazy };
  });

// Signed-out and signed-in sessions get different route trees, so a protected
// screen does not exist at all until there is a session.
export const createAppRouter = (signedIn: boolean) =>
  createBrowserRouter([
    {
      Component: RouteRoot,
      // Blank under the launch splash while the first screen's chunk loads; without it
      // React Router warns.
      HydrateFallback: () => null,
      ErrorBoundary: RouteErrorState,
      children: withOwnLazy(
        signedIn
          ? [...protectedRoutes, { path: "*", Component: NotFoundRoute }]
          : [...publicRoutes, { path: "*", Component: SignedOutRoute }],
      ),
    },
  ]);
