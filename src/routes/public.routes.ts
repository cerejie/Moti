import type { IRoute } from "../models/common/route.model";
import { ROUTES } from "./route.paths";

const loginView = async () => (await import("../pages/Auth/LoginView")).default;

// The signed-out router: only these screens exist until sign-in. Each screen is
// its own chunk, so a signed-in session never downloads them.
export const publicRoutes: IRoute[] = [
  { key: "home", path: ROUTES.home, label: "Sign in", lazy: { Component: loginView } },
  { key: "login", path: ROUTES.login, label: "Sign in", lazy: { Component: loginView } },
  {
    key: "register",
    path: ROUTES.register,
    label: "Create account",
    lazy: { Component: async () => (await import("../pages/Auth/RegisterView")).default },
  },
  {
    key: "forgot-password",
    path: ROUTES.forgotPassword,
    label: "Forgot password",
    lazy: { Component: async () => (await import("../pages/Auth/ForgotPasswordView")).default },
  },
];
