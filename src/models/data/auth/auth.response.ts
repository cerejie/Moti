import type { UserRole } from "../../../enums/role.enum";

// The Supabase session reduced to what the app reads.
export interface IAuthSession {
  userId: string;
  email: string | null;
}

export interface IProfileShop {
  id: string;
  name: string;
  is_active: boolean;
}

export interface IProfile {
  id: string;
  shop_id: string | null;
  role: UserRole;
  full_name: string;
  is_active: boolean;
  // Null for the superadmin, who belongs to no shop.
  shop: IProfileShop | null;
}
