import type { Tone } from "../styles/common/tone.styles";

// Derived from shops.is_active: a suspended shop locks out its owner and staff.
export type ShopStatus = "active" | "suspended";

export const shopStatusLabels: Record<ShopStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const shopStatusTones: Record<ShopStatus, Tone> = {
  active: "success",
  suspended: "danger",
};

export const shopStatusOf = (isActive: boolean): ShopStatus =>
  isActive ? "active" : "suspended";
