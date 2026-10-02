import { z } from "zod";
import type { InventoryView } from "../../../enums/stock.enum";

const wholeNumber = (label: string) =>
  z.string().trim().regex(/^\d+$/, `${label} must be a whole number`);

const optionalText = (max: number) => z.string().trim().max(max);

// Numbers stay strings in the form (inputs hand back text); the service converts them.
// Category and brand are typed names; the form hook turns them into ids on save.
// The item code is not here: the database builds it from category and brand.
export const itemFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the item name").max(120),
  category: z.string().trim().min(1, "Pick or type a category").max(60),
  brand: z.string().trim().min(1, "Pick or type a brand").max(60),
  unit: z.string().trim().min(1, "Enter the unit, e.g. pc").max(12),
  reorder_level: wholeNumber("Warning low stock quantity"),
  selling_price: z
    .string()
    .trim()
    .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a price like 250 or 249.50"),
  location: optionalText(60),
  opening_stock: wholeNumber("Opening stock"),
});
export type IItemFormInput = z.infer<typeof itemFormSchema>;

// What the service saves once the typed category and brand are resolved.
export type IItemSaveValues = Omit<IItemFormInput, "category" | "brand"> & {
  category_id: string | null;
  brand_id: string | null;
};

export interface IInventoryFilters {
  view: InventoryView;
  categoryId?: string;
  brandId?: string;
  search: string;
}
