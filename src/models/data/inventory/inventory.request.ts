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
  // Display only: the server sets the code from the category and brand.
  item_code: z.string(),
  name: z.string().trim().min(1, "Enter the item name").max(160, "Keep the name under 160 characters"),
  category_id: z.string().min(1, "Choose a category"),
  brand_id: z.string().min(1, "Choose a brand"),
  part_number: optionalText(80),
  fitment: optionalText(240),
  unit_id: z.string().min(1, "Choose a unit"),
  reorder_level: optionalWholeNumber("Enter the reorder level as a whole number"),
  selling_price: z
    .string()
    .trim()
    .regex(/^(\d{1,10}(\.\d{1,2})?)?$/, "Enter a price like 250 or 250.50"),
  location_id: z.string(),
  opening_quantity: optionalWholeNumber("Enter the opening stock as a whole number"),
});

export type IItemRequest = z.infer<typeof itemSchema>;

export const emptyItemRequest: IItemRequest = {
  item_code: "",
  name: "",
  category_id: "",
  brand_id: "",
  part_number: "",
  fitment: "",
  unit_id: "",
  reorder_level: "",
  selling_price: "",
  location_id: "",
  opening_quantity: "",
};

export interface IInventoryFilters {
  tab: InventoryTab;
  categoryId?: string;
  search: string;
  sort: InventorySort;
}
