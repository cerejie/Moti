import { Navigate, Outlet, useLocation } from "react-router-dom";
import AccessBlocked from "../components/auth/status/AccessBlocked";
import ErrorState from "../components/common/status/ErrorState";
import StateBox from "../components/common/status/StateBox";
import { useMe, usePermissions } from "../hook/data/auth/auth.session.hook";
import { useRouteAllowed } from "../hook/layout/navigation.hook";
import AuthLayout from "../layouts/AuthLayout";
import {
  selectAuthStatus,
  useAuthStore,
} from "../store/data/auth/auth.store";
import { ROUTES } from "./route.paths";

const SessionLoading = () => (
  <AuthLayout>
    <StateBox loading title="Loading Moti" />
  </AuthLayout>
);

// Where sign-in returns to: the page ProtectedRoute bounced the user from.
const returnPath = (state: unknown) => {
  if (state && typeof state === "object" && "from" in state) {
    const { from } = state as { from?: { pathname?: unknown } };
    if (typeof from?.pathname === "string") return from.pathname;
  }
  return ROUTES.home;
};

// Authenticated area. Waits for the session and the profile, then lets in only
// an active user whose shop is active. Subscribed to the store, so a sign-out in
// any tab lands on sign-in immediately.
export const ProtectedRoute = () => {
  const status = useAuthStore(selectAuthStatus);
  const location = useLocation();
  const me = useMe();

  if (status === "loading") return <SessionLoading />;

  if (status === "signedOut") {
    return <Navigate to={ROUTES.signIn} replace state={{ from: location }} />;
  }

  if (me.isPending) return <SessionLoading />;

  // A failed background re-check keeps the profile it already has.
  if (me.isError && !me.data) {
    return (
      <AuthLayout>
        <ErrorState error={me.error} onRetry={() => void me.refetch()} />
      </AuthLayout>
    );
  }

  const profile = me.data;
  const shopActive = profile?.role === "superadmin" || profile?.shop?.is_active;

  if (!profile || !profile.is_active || !shopActive) {
    return (
      <AuthLayout>
        <AccessBlocked profile={profile} />
      </AuthLayout>
    );
  }

  return <Outlet />;
};

// Auth pages. A signed-in user goes back to where they were headed.
export const PublicRoute = () => {
  const status = useAuthStore(selectAuthStatus);
  const location = useLocation();

  if (status === "loading") return <SessionLoading />;

  if (status === "signedIn") {
    return <Navigate to={returnPath(location.state)} replace />;
  }

  return <Outlet />;
};

// A page the user's role may not open — typed or bookmarked — falls back to the landing page.
export const PermissionGate = () => {
  const allowed = useRouteAllowed();

  if (!allowed) return <Navigate to={ROUTES.home} replace />;

  return <Outlet />;
};

// "/" is each role's landing page: the dashboard for managers, Transaction for staff.
export const LandingRedirect = () => {
  const { viewInsights } = usePermissions();

  return <Navigate to={viewInsights ? ROUTES.dashboard : ROUTES.transaction} replace />;
};

// Anything unmatched falls back to home, which re-runs the auth gate.
export const NotFoundRoute = () => <Navigate to={ROUTES.home} replace />;
