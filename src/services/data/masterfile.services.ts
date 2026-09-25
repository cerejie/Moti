import type { MasterfileKind } from "../../enums/masterfile.enum";
import type { IMasterfileRequest } from "../../models/data/masterfile/masterfile.request";
import type { IMasterfileEntry } from "../../models/data/masterfile/masterfile.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";
import { newWriteId } from "../../utils/write.utils";

const optionColumns = "id, name, inventory_items(count)";

// The table and write functions behind each kind.
const sources: Record<
  MasterfileKind,
  { table: string; create: string; update: string; remove: string; label: string }
> = {
  unit: {
    table: "units",
    create: "create_unit",
    update: "update_unit",
    remove: "delete_unit",
    label: "unit",
  },
  location: {
    table: "storage_locations",
    create: "create_storage_location",
    update: "update_storage_location",
    remove: "delete_storage_location",
    label: "location",
  },
};

type IEntryRow = {
  id: string;
  name: string;
  inventory_items: { count: number }[];
};

const masterfileServices = {
  // Unpaged: a shop has a handful of units and locations, and they feed selects.
  getOptions: async (
    kind: MasterfileKind,
    shopId: string,
    signal: AbortSignal,
  ): Promise<IMasterfileEntry[]> => {
    const { data, error } = await supabase
      .from(sources[kind].table)
      .select(optionColumns)
      .eq("shop_id", shopId)
      .order("name")
      .abortSignal(signal);
    if (error) throw toError(error);

    return ((data ?? []) as IEntryRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      item_count: row.inventory_items[0]?.count ?? 0,
    }));
  },

  create: (kind: MasterfileKind, shopId: string | null, values: IMasterfileRequest) =>
    runWrite({
      kind: "rpc",
      fn: sources[kind].create,
      label: `Create ${sources[kind].label}`,
      args: { p_id: newWriteId(), p_shop_id: shopId, p_name: values.name },
    }),

  rename: (kind: MasterfileKind, id: string, values: IMasterfileRequest) =>
    runWrite({
      kind: "rpc",
      fn: sources[kind].update,
      label: `Rename ${sources[kind].label}`,
      args: { p_id: id, p_name: values.name },
    }),

  remove: (kind: MasterfileKind, id: string) =>
    runWrite({
      kind: "rpc",
      fn: sources[kind].remove,
      label: `Delete ${sources[kind].label}`,
      args: { p_id: id },
    }),
};

export default masterfileServices;
