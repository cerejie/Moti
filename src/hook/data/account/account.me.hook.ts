import { useMemo } from "react";
import { createAppRouter } from "../../../routes";
import {
  selectIsAuthenticated,
  useAccountStore,
} from "../../../store/data/account/account.store";

// Rebuilds the router when the session starts or ends.
export const useAppRouter = () => {
  const signedIn = useAccountStore(selectIsAuthenticated);
  return useMemo(() => createAppRouter(signedIn), [signedIn]);
};
