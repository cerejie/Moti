import { ROUTES } from "../../../routes/route.paths";
import accountServices from "../../../services/data/account.services";
import { resetAllStores } from "../../../store/common/reset.store";
import { useSyncStore } from "../../../store/common/sync.store";
import { useAccountStore } from "../../../store/data/account/account.store";
import { clearPersistedQueries, queryClient } from "../../../utils/query.utils";
import { resetLocation } from "../../../utils/route.utils";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { releasePushSubscription } from "../../common/push.hook";

// Shared by the sign-out button and the session-expiry handler. The offline
// queue is kept: it belongs to this account and replays when it signs back in.
export const endSession = async (): Promise<void> => {
  // Needs the session still alive to delete this device's subscription row.
  await releasePushSubscription();
  resetLocation(ROUTES.login);
  useAccountStore.getState().clear();
  queryClient.clear();
  clearPersistedQueries();
  resetAllStores();
  await accountServices.logout();
};

export const useAccountLogoutHook = () => {
  const confirm = useConfirm();
  const pending = useSyncStore((state) => state.queue.length);
  const logoutMutation = useAppMutation(endSession);

  const signOut = () => {
    if (pending === 0) {
      logoutMutation.mutate();
      return;
    }

    confirm({
      title: "Sign out with unsynced changes?",
      message: `${pending} change${pending === 1 ? " is" : "s are"} saved on this device but not synced yet. They will sync the next time you sign in here. Another account signing in on this device discards them.`,
      okText: "Sign out",
      onConfirm: () => logoutMutation.mutateAsync(),
    });
  };

  return { signOut, signingOut: logoutMutation.isPending };
};
