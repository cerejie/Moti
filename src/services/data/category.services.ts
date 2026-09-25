import type { ICategoryRequest } from "../../models/data/category/category.request";
import type { ICategory } from "../../models/data/category/category.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "categories";
const optionColumns = "id, name, code, inventory_items(count), category_brands(brand_id)";

type ICategoryRow = {
  id: string;
  name: string;
  code: string;
  inventory_items: { count: number }[];
  category_brands: { brand_id: string }[];
};

const categoryArgs = (values: ICategoryRequest) => ({
  p_name: values.name,
  p_code: values.code,
  p_brand_ids: values.brand_ids,
});

const categoryServices = {
  // Unpaged: a shop has a handful of categories, and they feed selects.
  getOptions: async (shopId: string, signal: AbortSignal): Promise<ICategory[]> => {
    const { data, error } = await supabase
      .from(table)
      .select(optionColumns)
      .eq("shop_id", shopId)
      .order("name")
      .abortSignal(signal);
    if (error) throw toError(error);

    return ((data ?? []) as ICategoryRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      brand_ids: row.category_brands.map((link) => link.brand_id),
      item_count: row.inventory_items[0]?.count ?? 0,
    }));
  },

  // The caller picks the id, so a form can select the new category before it syncs.
  create: (id: string, shopId: string | null, values: ICategoryRequest) =>
    runWrite({
      kind: "rpc",
      fn: "create_category",
      label: "Create category",
      args: { p_id: id, p_shop_id: shopId, ...categoryArgs(values) },
    }),

  update: (id: string, values: ICategoryRequest) =>
    runWrite({
      kind: "rpc",
      fn: "update_category",
      label: "Update category",
      args: { p_id: id, ...categoryArgs(values) },
    }),

  remove: (id: string) =>
    runWrite({
      kind: "rpc",
      fn: "delete_category",
      label: "Delete category",
      args: { p_id: id },
    }),
};

export default categoryServices;
