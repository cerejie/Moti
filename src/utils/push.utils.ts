import type { IPushSubscriptionInput } from "../models/common/push.model";

// The VAPID public key arrives base64url-encoded; PushManager wants the raw bytes.
export const applicationServerKeyOf = (base64Url: string): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const key = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    key[index] = binary.charCodeAt(index);
  }
  return key;
};

export const subscriptionInputOf = (
  subscription: PushSubscription,
  userAgent: string,
): IPushSubscriptionInput | null => {
  const { endpoint, keys } = subscription.toJSON();
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;
  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth, userAgent };
};

export const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

// iOS only offers web push to an app added to the Home Screen.
export const isAppleTouchDevice = (): boolean =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export const isStandalone = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
