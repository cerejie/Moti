import { useEffect } from "react";
import type { PushMode } from "../../models/common/push.model";
import pushServices from "../../services/data/push.services";
import {
  selectPushPermission,
  selectPushPromptDismissed,
  selectPushSubscribed,
  usePushStore,
} from "../../store/common/push.store";
import { env } from "../../utils/env.utils";
import {
  applicationServerKeyOf,
  isAppleTouchDevice,
  isPushSupported,
  isStandalone,
  subscriptionInputOf,
} from "../../utils/push.utils";
import { usePermissions } from "../account/account.permission.hook";
import { useAppMutation } from "./mutation.hook";

const blockedMessage =
  "Notifications are blocked. Allow them for Moti in your browser or phone settings.";
const noWorkerMessage =
  "Notifications need the installed app or the published site. Reload and try again.";
const incompleteMessage = "This device returned an incomplete push subscription.";

const currentRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? null;
};

const currentSubscription = async (): Promise<PushSubscription | null> => {
  const registration = await currentRegistration();
  return registration ? registration.pushManager.getSubscription() : null;
};

const subscribeThisDevice = async (): Promise<void> => {
  const permission = await Notification.requestPermission();
  usePushStore.getState().setPermission(permission);
  if (permission !== "granted") throw new Error(blockedMessage);

  const registration = await currentRegistration();
  if (!registration) throw new Error(noWorkerMessage);

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKeyOf(env.vapidPublicKey),
    }));
  const input = subscriptionInputOf(subscription, navigator.userAgent);
  if (!input) throw new Error(incompleteMessage);

  await pushServices.save(input);
  usePushStore.getState().setSubscribed(true);
};

const unsubscribeThisDevice = async (): Promise<void> => {
  const subscription = await currentSubscription();
  if (subscription) {
    await pushServices.remove(subscription.endpoint);
    await subscription.unsubscribe();
  }
  usePushStore.getState().setSubscribed(false);
};

// Sign-out: this device must stop receiving the previous account's alerts.
export const releasePushSubscription = async (): Promise<void> => {
  const subscription = await currentSubscription().catch(() => null);
  if (!subscription) return;
  await pushServices.remove(subscription.endpoint).catch(() => undefined);
  await subscription.unsubscribe().catch(() => false);
  usePushStore.getState().setSubscribed(false);
};

// Mounted once by the shell: keeps permission and subscription in step with the
// device, including changes made in system settings while the app was away.
export const usePushStatusListener = () => {
  const setPermission = usePushStore((state) => state.setPermission);
  const setSubscribed = usePushStore((state) => state.setSubscribed);

  useEffect(() => {
    if (!isPushSupported()) return;
    const listeners = new AbortController();

    const sync = () => {
      setPermission(Notification.permission);
      void currentSubscription()
        .then((subscription) => setSubscribed(subscription !== null))
        .catch(() => setSubscribed(false));
    };

    sync();
    document.addEventListener("visibilitychange", sync, { signal: listeners.signal });

    return () => listeners.abort();
  }, [setPermission, setSubscribed]);
};

export const usePushNotifications = () => {
  const permission = usePushStore(selectPushPermission);
  const subscribed = usePushStore(selectPushSubscribed);

  const enableMutation = useAppMutation(subscribeThisDevice, {
    successMessage: "Low-stock notifications are on for this device",
  });
  const disableMutation = useAppMutation(unsubscribeThisDevice, {
    successMessage: "Notifications are off for this device",
  });

  const modeOf = (): PushMode => {
    if (!env.vapidPublicKey) return "unconfigured";
    if (!isPushSupported()) {
      return isAppleTouchDevice() && !isStandalone() ? "needs-install" : "unsupported";
    }
    if (permission === "denied") return "blocked";
    return subscribed ? "on" : "off";
  };

  return {
    mode: modeOf(),
    enable: () => enableMutation.mutate(),
    disable: () => disableMutation.mutate(),
    enabling: enableMutation.isPending,
    disabling: disableMutation.isPending,
  };
};

// The one-time nudge on the owner's dashboard to turn alerts on.
export const usePushPrompt = () => {
  const { receiveStockAlerts } = usePermissions();
  const { mode, enable, enabling } = usePushNotifications();
  const dismissed = usePushStore(selectPushPromptDismissed);
  const dismissPrompt = usePushStore((state) => state.dismissPrompt);

  return {
    visible: receiveStockAlerts && mode === "off" && !dismissed,
    enable,
    enabling,
    dismiss: dismissPrompt,
  };
};
