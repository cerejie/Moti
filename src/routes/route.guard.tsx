import { Navigate } from "react-router-dom";
import { ROUTES } from "./route.paths";

// Anything unmatched falls back to home.
export const NotFoundRoute = () => <Navigate to={ROUTES.home} replace />;
