import { Navigate } from "react-router-dom";
import { ROUTES } from "./route.paths";

// Signed in, anything unmatched falls back to home.
export const NotFoundRoute = () => <Navigate to={ROUTES.home} replace />;

// Signed out, anything unmatched falls back to sign-in.
export const SignedOutRoute = () => <Navigate to={ROUTES.login} replace />;
