import AppLayout from "../layouts/AppLayout";
import type { IRoute } from "../models/common/route.model";
import { protectedViewRoutes } from "./protected.view.routes";
import { PermissionGate, ProtectedRoute } from "./route.guard";

// Signed-in, active users only; each page is then checked against its `can`.
export const protectedRoutes: IRoute[] = [
  {
    key: "protected",
    isNotNav: true,
    Component: ProtectedRoute,
    children: [
      {
        key: "app-shell",
        isNotNav: true,
        Component: AppLayout,
        children: [
          {
            key: "permission-gate",
            isNotNav: true,
            Component: PermissionGate,
            children: protectedViewRoutes,
          },
        ],
      },
    ],
  },
];
