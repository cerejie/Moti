import AppLayout from "../layouts/AppLayout";
import type { IRoute } from "../models/common/route.model";
import { protectedViewRoutes } from "./protected.view.routes";

// Sign-in guards wrap this tree in Phase 1; until then the shell is open.
export const protectedRoutes: IRoute[] = [
  {
    key: "app-shell",
    isNotNav: true,
    Component: AppLayout,
    children: protectedViewRoutes,
  },
];
