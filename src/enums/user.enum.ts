import type { Tone } from "../styles/common/tone.styles";

// Derived from profiles.is_active: an inactive user fails every tenant policy.
export type UserStatus = "active" | "inactive";

export const userStatusLabels: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Deactivated",
};

export const userStatusTones: Record<UserStatus, Tone> = {
  active: "success",
  inactive: "neutral",
};

export const userStatusOf = (isActive: boolean): UserStatus =>
  isActive ? "active" : "inactive";
