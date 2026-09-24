// Mirrors the app.user_role Postgres enum.
export type UserRole = "superadmin" | "owner" | "employee";

export const userRoleLabels: Record<UserRole, string> = {
  superadmin: "Superadmin",
  owner: "Owner",
  employee: "Employee",
};
