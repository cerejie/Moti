import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authMeKey, scopedKey } from "../../../keys/query.keys";
import { derivePermissions } from "../../../models/common/permission.model";
import { useConfirm } from "../../common/confirmation.hook";
import { useSyncStatus } from "../../common/network.hook";
import authServices from "../../../services/data/auth.services";
import { selectOnline, useNetworkStore } from "../../../store/common/network.store";
import { resetAllStores } from "../../../store/common/reset.store";
import {
  selectUserId,
  useAuthStore,
} from "../../../store/data/auth/auth.store";
import { useShopStore } from "../../../store/data/shop/shop.store";
import { isNetworkError } from "../../../utils/error.utils";
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

// Offline the server can't revoke the session, so this device's copy is cleared instead.
const signOutAnywhere = async () => {
  try {
    await authServices.signOut();
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    await authServices.signOut("local");
  }
};

// The session subscription clears the stores and the guards return to sign-in.
// Queued writes are kept: they belong to this user and send at their next sign-in here.
export const useSignOut = () => {
  const { pending } = useSyncStatus();
  const confirm = useConfirm();
  const mutation = useMutation({ mutationFn: signOutAnywhere });

  const signOut = () => {
    if (pending === 0) return mutation.mutate();

    confirm({
      kind: "confirm",
      title: "Sign out with unsynced changes?",
      message: `${pending} ${pending === 1 ? "change hasn't" : "changes haven't"} reached the server yet. They stay saved on this device and send the next time you sign in here.`,
      okText: "Sign out anyway",
      onConfirm: () => mutation.mutate(),
    });
  };

  return { signOut, isPending: mutation.isPending };
};
