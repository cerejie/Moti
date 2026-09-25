import { z } from "zod";
import type { StaffRole } from "../../../enums/role.enum";
import type { UserStatus } from "../../../enums/user.enum";

// Email, role and shop are fixed once the account exists; editing changes the name only.
export const userSchema = z.object({
  full_name: z.string().trim().min(1, "Enter the person's name").max(120, "Keep the name under 120 characters"),
  email: z.string().trim().min(1, "Enter an email").email("Enter a valid email address"),
  role: z.enum(["owner", "employee"], { error: "Choose a role" }),
  shop_id: z.string().min(1, "Choose a shop"),
});

export type IUserRequest = z.infer<typeof userSchema>;

export interface IUserFilters {
  search: string;
  // Omitted for the superadmin's "all shops" view.
  shopId?: string;
  role?: StaffRole;
  status?: UserStatus;
}
