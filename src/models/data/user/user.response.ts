import type { ApprovalStatus, UserRole } from "../../../enums/role.enum";

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  // Set while the user waits for someone to approve a new password.
  password_reset_requested_at: string | null;
  created_at: string;
}
