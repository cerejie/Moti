import type { IBrandRequest } from "../../models/data/brand/brand.request";
import type { IBrand } from "../../models/data/brand/brand.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "brands";
const optionColumns = "id, name, code, inventory_items(count), category_brands(category_id)";

type IBrandRow = {
  id: string;
  name: string;
  code: string;
  inventory_items: { count: number }[];
  category_brands: { category_id: string }[];
};

const brandArgs = (values: IBrandRequest) => ({
  p_name: values.name,
  p_code: values.code,
  p_category_ids: values.category_ids,
});

const brandServices = {
  // Unpaged: brands feed the item form's select and the masterfile list.
  getOptions: async (shopId: string, signal: AbortSignal): Promise<IBrand[]> => {
    const { data, error } = await supabase
      .from(table)
      .select(optionColumns)
      .eq("shop_id", shopId)
      .order("name")
      .abortSignal(signal);
    if (error) throw toError(error);

    return ((data ?? []) as IBrandRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      category_ids: row.category_brands.map((link) => link.category_id),
      item_count: row.inventory_items[0]?.count ?? 0,
    }));
  },

  // The caller picks the id, so a form can select the new brand before it syncs.
  create: (id: string, shopId: string | null, values: IBrandRequest) =>
    runWrite({
      kind: "rpc",
      fn: "create_brand",
      label: "Create brand",
      args: { p_id: id, p_shop_id: shopId, ...brandArgs(values) },
    }),

  update: (id: string, values: IBrandRequest) =>
    runWrite({
      kind: "rpc",
      fn: "update_brand",
      label: "Update brand",
      args: { p_id: id, ...brandArgs(values) },
    }),

  remove: (id: string) =>
    runWrite({
      kind: "rpc",
      fn: "delete_brand",
      label: "Delete brand",
      args: { p_id: id },
    }),
};

export default brandServices;
