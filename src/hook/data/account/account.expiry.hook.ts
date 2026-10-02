import { useEffect } from "react";
import { toast } from "sonner";
import accountServices from "../../../services/data/account.services";
import {
  selectIsAuthenticated,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { endSession } from "./account.logout.hook";

const sessionExpiredMessage = "Your session expired. Sign in again.";

const handleSessionExpired = (): void => {
  if (!selectIsAuthenticated(useAccountStore.getState())) return;

  toast.error(sessionExpiredMessage);
  void endSession();
};

// Ends a table user's session when its token lapses: on any 401, and at the
// token's own expiry time so an idle tab does not wait for a failed request.
export const useAccountExpiryHook = () => {
  const expiresAt = useAccountStore((state) => state.expiresAt);

  useEffect(() => {
    accountServices.onSessionExpired(handleSessionExpired);
    return () => accountServices.onSessionExpired(null);
  }, []);

  useEffect(() => {
    if (expiresAt === null) return;

    const remainingMs = expiresAt * 1000 - Date.now();
    if (remainingMs <= 0) {
      handleSessionExpired();
      return;
    }

    // setTimeout overflows past ~24.8 days; tokens last 8 hours.
    const timer = setTimeout(handleSessionExpired, remainingMs);
    return () => clearTimeout(timer);
  }, [expiresAt]);
};
