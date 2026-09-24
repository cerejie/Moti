import AuthLayout from "../layouts/AuthLayout";
import type { IRoute } from "../models/common/route.model";
import SignInView from "../pages/Auth/SignInView";
import { PublicRoute } from "./route.guard";
import { ROUTES } from "./route.paths";

// Reachable only while signed out; a signed-in user is sent on to the app.
export const publicRoutes: IRoute[] = [
  {
    key: "public",
    isNotNav: true,
    Component: PublicRoute,
    children: [
      {
        key: "auth-layout",
        isNotNav: true,
        Component: AuthLayout,
        children: [
          {
            key: "sign-in",
            label: "Sign in",
            isNotNav: true,
            path: ROUTES.signIn,
            Component: SignInView,
          },
        ],
      },
    ],
  },
];
