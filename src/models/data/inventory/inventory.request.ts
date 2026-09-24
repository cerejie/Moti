import { z } from "zod";
import type {
  InventorySort,
  InventoryTab,
} from "../../../enums/inventory.enum";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters`);

// Form inputs hold text; the service turns these into numbers for the RPC.
const optionalWholeNumber = (message: string) =>
  z.string().trim().regex(/^\d*$/, message);

export const itemSchema = z.object({
  sku: z.string().trim().min(1, "Enter a SKU").max(60, "Keep the SKU under 60 characters"),
  name: z.string().trim().min(1, "Enter the item name").max(160, "Keep the name under 160 characters"),
  category_id: z.string(),
  brand: optionalText(80),
  part_number: optionalText(80),
  fitment: optionalText(240),
  unit: z.string().trim().min(1, "Enter a unit, e.g. pc").max(20, "Keep the unit under 20 characters"),
  reorder_level: optionalWholeNumber("Enter the reorder level as a whole number"),
  selling_price: z
    .string()
    .trim()
    .regex(/^(\d{1,10}(\.\d{1,2})?)?$/, "Enter a price like 250 or 250.50"),
  location: optionalText(80),
  opening_quantity: optionalWholeNumber("Enter the opening stock as a whole number"),
});

export type IItemRequest = z.infer<typeof itemSchema>;

export const emptyItemRequest: IItemRequest = {
  sku: "",
  name: "",
  category_id: "",
  brand: "",
  part_number: "",
  fitment: "",
  unit: "pc",
  reorder_level: "",
  selling_price: "",
  location: "",
  opening_quantity: "",
};

export interface IInventoryFilters {
  tab: InventoryTab;
  categoryId?: string;
  search: string;
  sort: InventorySort;
}
