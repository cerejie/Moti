import type { ICategoryRequest } from "../../models/data/category/category.request";
import type { ICategory } from "../../models/data/category/category.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";
import { newWriteId } from "../../utils/write.utils";

const table = "categories";
const optionColumns = "id, name, inventory_items(count)";

type ICategoryRow = {
  id: string;
  name: string;
  inventory_items: { count: number }[];
};

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
      item_count: row.inventory_items[0]?.count ?? 0,
    }));
  },

  create: (shopId: string | null, values: ICategoryRequest) =>
    runWrite({
      kind: "rpc",
      fn: "create_category",
      label: "Create category",
      args: { p_id: newWriteId(), p_shop_id: shopId, p_name: values.name },
    }),

  rename: (id: string, values: ICategoryRequest) =>
    runWrite({
      kind: "rpc",
      fn: "update_category",
      label: "Rename category",
      args: { p_id: id, p_name: values.name },
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
