import { createBrowserRouter } from "react-router-dom";
import RouteRoot from "../components/common/layout/RouteRoot";
import { protectedRoutes } from "./protected.routes";
import { publicRoutes } from "./public.routes";
import { NotFoundRoute } from "./route.guard";

export const router = createBrowserRouter([
  {
    Component: RouteRoot,
    children: [
      ...publicRoutes,
      ...protectedRoutes,
      { path: "*", Component: NotFoundRoute },
    ],
  },
]);
