import { createBrowserRouter } from "react-router-dom";
import RouteRoot from "../components/common/layout/RouteRoot";
import { protectedRoutes } from "./protected.routes";
import { publicRoutes } from "./public.routes";
import { NotFoundRoute, SignedOutRoute } from "./route.guard";

// Signed-out and signed-in sessions get different route trees, so a protected
// screen does not exist at all until there is a session.
export const createAppRouter = (signedIn: boolean) =>
  createBrowserRouter([
    {
      Component: RouteRoot,
      children: signedIn
        ? [...protectedRoutes, { path: "*", Component: NotFoundRoute }]
        : [...publicRoutes, { path: "*", Component: SignedOutRoute }],
    },
  ]);
