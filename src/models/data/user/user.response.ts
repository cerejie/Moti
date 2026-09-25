import type { UserRole } from "../../../enums/role.enum";

// One row of the Users list: a profile with its shop's name.
export interface IStaffUser {
  id: string;
  shop_id: string | null;
  role: UserRole;
  full_name: string;
  // Null only for accounts made before Phase 6 whose auth user had no email.
  email: string | null;
  is_active: boolean;
  created_at: string;
  shop: { id: string; name: string } | null;
}

// What manage-staff returns after creating an account or resetting a password.
// The password is shown once and never stored.
export interface ITemporaryPassword {
  user_id: string;
  full_name: string;
  email: string;
  temporary_password: string;
}
