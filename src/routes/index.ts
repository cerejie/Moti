import { createBrowserRouter } from "react-router-dom";
import RouteRoot from "../components/common/layout/RouteRoot";
import RouteErrorState from "../components/common/status/RouteErrorState";
import { protectedRoutes } from "./protected.routes";
import { publicRoutes } from "./public.routes";
import { NotFoundRoute, SignedOutRoute } from "./route.guard";

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
      children: signedIn
        ? [...protectedRoutes, { path: "*", Component: NotFoundRoute }]
        : [...publicRoutes, { path: "*", Component: SignedOutRoute }],
    },
  ]);
