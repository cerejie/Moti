// Mirrors the app.user_role Postgres enum.
export type UserRole = "superadmin" | "owner" | "employee";

export const userRoleLabels: Record<UserRole, string> = {
  superadmin: "Superadmin",
  owner: "Owner",
  employee: "Employee",
};

// The roles a staff account can be created with; there is only one superadmin.
export type StaffRole = Exclude<UserRole, "superadmin">;

// Owners add employees only; the superadmin also adds owners.
export const assignableRoles = (isSuperadmin: boolean): StaffRole[] =>
  isSuperadmin ? ["owner", "employee"] : ["employee"];
