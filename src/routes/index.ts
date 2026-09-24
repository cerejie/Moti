import { createBrowserRouter } from "react-router-dom";
import RouteRoot from "../components/common/layout/RouteRoot";
import { protectedRoutes } from "./protected.routes";
import { NotFoundRoute } from "./route.guard";

export const router = createBrowserRouter([
  {
    Component: RouteRoot,
    children: [...protectedRoutes, { path: "*", Component: NotFoundRoute }],
  },
]);
