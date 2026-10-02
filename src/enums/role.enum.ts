import { z } from "zod";
import type { Tone } from "../styles/common/tone.styles";

export const userRoleValues = ["owner", "employee"] as const;
export const userRoleSchema = z.enum(userRoleValues);
export type UserRole = z.infer<typeof userRoleSchema>;

// The developer is the one Supabase Auth account; it has no users row.
export type AuthorityRole = "developer";

export type EffectiveRole = UserRole | AuthorityRole;

export const effectiveRoleLabels: Record<EffectiveRole, string> = {
  developer: "Developer",
  owner: "Owner",
  employee: "Employee",
};

// Mirrors app.can_manage_role in the database.
const manageableRoles: Record<EffectiveRole, readonly UserRole[]> = {
  developer: ["owner", "employee"],
  owner: ["employee"],
  employee: [],
};

export const manageableRolesOf = (
  role: EffectiveRole | null,
): readonly UserRole[] => (role ? manageableRoles[role] : []);

export const approvalStatusValues = ["pending", "approved", "rejected"] as const;
export const approvalStatusSchema = z.enum(approvalStatusValues);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Active",
  rejected: "Disabled",
};

export const approvalStatusTones: Record<ApprovalStatus, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "neutral",
};
