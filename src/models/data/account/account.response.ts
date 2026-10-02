import type { UserRole } from "../../../enums/role.enum";

export interface IAuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface ICustomLoginResponse {
  token: string;
  // Unix seconds, matching the token's exp claim.
  expires_at: number;
  user: IAuthUser;
}

// What the login service hands back: a table user's token, or the developer.
export type ILoginResult =
  | { kind: "custom"; session: ICustomLoginResponse }
  | { kind: "developer"; email: string };
