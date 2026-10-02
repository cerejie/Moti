export interface IPushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}

// What the notifications card can offer on this device right now.
export type PushMode =
  | "unconfigured"
  | "unsupported"
  | "needs-install"
  | "blocked"
  | "off"
  | "on";
