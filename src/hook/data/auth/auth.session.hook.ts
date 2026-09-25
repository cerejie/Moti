import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authMeKey, scopedKey } from "../../../keys/query.keys";
import { derivePermissions } from "../../../models/common/permission.model";
import authServices from "../../../services/data/auth.services";
import { selectOnline, useNetworkStore } from "../../../store/common/network.store";
import { resetAllStores } from "../../../store/common/reset.store";
import {
  selectUserId,
  useAuthStore,
} from "../../../store/data/auth/auth.store";
import { useShopStore } from "../../../store/data/shop/shop.store";
import { queryClient } from "../../../utils/query.utils";

// The previous user's stores and cached rows must never reach the next session
// on the same device.
const clearSessionData = () => {
  resetAllStores();
  useShopStore.getState().clear();
  queryClient.clear();
};

// Mounted once by App: the app's only onAuthStateChange subscription. It mirrors
// the session into the auth store, which is what the route guards read.
export const useAuthSession = () => {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(
    () =>
      authServices.onSessionChange((session) => {
        const previous = useAuthStore.getState().userId;
        if (previous && previous !== session?.userId) clearSessionData();
        setSession(session);
      }),
    [setSession],
  );
};

// Re-read every minute while online, so a deactivated user or a suspended shop
// reaches the locked-out screen without a reload.
export const useMe = () => {
  const userId = useAuthStore(selectUserId);
  const online = useNetworkStore(selectOnline);

  return useQuery({
    queryKey: [scopedKey(authMeKey, userId)],
    queryFn: async ({ signal }) =>
      userId ? authServices.getMe(userId, signal) : null,
    enabled: Boolean(userId),
    refetchInterval: online ? 60_000 : false,
  });
};

export const usePermissions = () => {
  const { data: me } = useMe();
  return derivePermissions(me?.role ?? null);
};

// The session subscription clears the stores and the guards return to sign-in.
export const useSignOut = () =>
  useMutation({ mutationFn: authServices.signOut });
