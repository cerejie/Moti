import { z } from "zod";
import type { ShopStatus } from "../../../enums/shop.enum";

export const shopSchema = z.object({
  name: z.string().trim().min(1, "Enter the shop name").max(120, "Keep the name under 120 characters"),
});

export type IShopRequest = z.infer<typeof shopSchema>;

// Form inputs hold text; the service turns the numbers into numbers.
export const shopSettingsSchema = z.object({
  default_reorder_level: z
    .string()
    .trim()
    .regex(/^\d{1,6}$/, "Enter the reorder level as a whole number"),
  low_stock_margin_pct: z
    .string()
    .trim()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, "Enter a percentage like 20 or 12.5")
    .refine((value) => Number(value) <= 100, "Keep the margin between 0 and 100"),
  timezone: z.string().min(1, "Choose a timezone"),
});

export type IShopSettingsRequest = z.infer<typeof shopSettingsSchema>;

export interface IShopFilters {
  search: string;
  status?: ShopStatus;
}
