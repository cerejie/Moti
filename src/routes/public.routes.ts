import type { IRoute } from "../models/common/route.model";
import ForgotPasswordView from "../pages/Auth/ForgotPasswordView";
import LoginView from "../pages/Auth/LoginView";
import RegisterView from "../pages/Auth/RegisterView";
import { ROUTES } from "./route.paths";

// The signed-out router: only these screens exist until sign-in.
export const publicRoutes: IRoute[] = [
  { key: "home", path: ROUTES.home, label: "Sign in", Component: LoginView },
  { key: "login", path: ROUTES.login, label: "Sign in", Component: LoginView },
  { key: "register", path: ROUTES.register, label: "Create account", Component: RegisterView },
  {
    key: "forgot-password",
    path: ROUTES.forgotPassword,
    label: "Forgot password",
    Component: ForgotPasswordView,
  },
];
