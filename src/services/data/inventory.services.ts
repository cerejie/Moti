import type { InventorySort } from "../../enums/inventory.enum";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../models/common/pagination.model";
import { totalPages } from "../../models/common/pagination.model";
import type {
  IInventoryFilters,
  IItemRequest,
} from "../../models/data/inventory/inventory.request";
import type { IInventoryItem } from "../../models/data/inventory/inventory.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";
import { newWriteId } from "../../utils/write.utils";

const view = "inventory_item_status";
const columns =
  "id, shop_id, category_id, category_name, sku, name, brand, part_number, fitment, unit, on_hand, reorder_level, selling_price, location, archived_at, created_at, updated_at, stock_status";

const sortColumns: Record<InventorySort, { column: string; ascending: boolean }> = {
  name: { column: "name", ascending: true },
  stock_asc: { column: "on_hand", ascending: true },
  stock_desc: { column: "on_hand", ascending: false },
  updated: { column: "updated_at", ascending: false },
};

// LIKE wildcards typed by the user are matched literally.
const likePattern = (search: string) =>
  `%${search.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;

const orNull = (value: string) => (value.trim() === "" ? null : value.trim());

const numberOrNull = (value: string) =>
  value.trim() === "" ? null : Number(value);

// The fields create_item and update_item share.
const itemArgs = (values: IItemRequest) => ({
  p_category_id: orNull(values.category_id),
  p_sku: values.sku,
  p_name: values.name,
  p_brand: orNull(values.brand),
  p_part_number: orNull(values.part_number),
  p_fitment: orNull(values.fitment),
  p_unit: values.unit,
  // Blank uses the shop's default reorder level.
  p_reorder_level: numberOrNull(values.reorder_level),
  p_selling_price: numberOrNull(values.selling_price),
  p_location: orNull(values.location),
});

const inventoryServices = {
  getList: async (
    shopId: string,
    filters: IInventoryFilters,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<IInventoryItem>> => {
    const from = (pagination.pageNumber - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    const sort = sortColumns[filters.sort];

    let query = supabase
      .from(view)
      .select(columns, { count: "exact" })
      .eq("shop_id", shopId);

    if (filters.tab === "archived") query = query.not("archived_at", "is", null);
    else query = query.is("archived_at", null);

    if (filters.tab !== "all" && filters.tab !== "archived") {
      query = query.eq("stock_status", filters.tab);
    }
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.search) query = query.ilike("search_text", likePattern(filters.search));

    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.ascending })
      .order("name")
      .order("id")
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    const totalCount = count ?? 0;
    return {
      data: (data ?? []) as IInventoryItem[],
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalPages: totalPages(totalCount, pagination.pageSize),
      totalCount,
    };
  },

  // Null when the item is gone or belongs to a shop the user can't read.
  getById: async (id: string, signal: AbortSignal): Promise<IInventoryItem | null> => {
    const { data, error } = await supabase
      .from(view)
      .select(columns)
      .eq("id", id)
      .abortSignal(signal)
      .maybeSingle();
    if (error) throw toError(error);
    return data as IInventoryItem | null;
  },

  // The item id is fixed here, so a replayed offline write creates it once.
  create: (shopId: string | null, values: IItemRequest) =>
    runWrite({
      kind: "rpc",
      fn: "create_item",
      label: "Create item",
      args: {
        p_id: newWriteId(),
        p_shop_id: shopId,
        ...itemArgs(values),
        p_opening_quantity: numberOrNull(values.opening_quantity) ?? 0,
      },
    }),

  update: (id: string, values: IItemRequest) =>
    runWrite({
      kind: "rpc",
      fn: "update_item",
      label: "Update item",
      args: { p_id: id, ...itemArgs(values) },
    }),

  setArchived: (id: string, archived: boolean) =>
    runWrite({
      kind: "rpc",
      fn: "set_item_archived",
      label: archived ? "Archive item" : "Restore item",
      args: { p_id: id, p_archived: archived },
    }),
};

export default inventoryServices;
