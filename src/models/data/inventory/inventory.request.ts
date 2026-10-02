import { z } from "zod";
import type { InventoryView } from "../../../enums/stock.enum";

const wholeNumber = (label: string) =>
  z.string().trim().regex(/^\d+$/, `${label} must be a whole number`);

const optionalText = (max: number) => z.string().trim().max(max);

// Numbers stay strings in the form (inputs hand back text); the service converts them.
export const itemFormSchema = z.object({
  sku: z.string().trim().min(1, "Enter the SKU").max(40),
  name: z.string().trim().min(1, "Enter the item name").max(120),
  category_id: z.string(),
  brand: optionalText(60),
  part_number: optionalText(60),
  unit: z.string().trim().min(1, "Enter the unit, e.g. pc").max(12),
  reorder_level: wholeNumber("Reorder level"),
  selling_price: z
    .string()
    .trim()
    .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a price like 250 or 249.50"),
  location: optionalText(60),
  opening_stock: wholeNumber("Opening stock"),
});
export type IItemFormInput = z.infer<typeof itemFormSchema>;

export interface IInventoryFilters {
  view: InventoryView;
  categoryId?: string;
  search: string;
}
