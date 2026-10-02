import type {
  IInventoryFilters,
  IItemSaveValues,
} from "../../models/data/inventory/inventory.request";
import type {
  IInventoryItem,
  IInventorySummary,
} from "../../models/data/inventory/inventory.response";
import {
  pageRange,
  toPage,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { IMutationResult } from "../../models/common/write.model";
import { runWrite } from "../../store/common/sync.store";
import { toIlikePattern } from "../../utils/search.utils";
import { supabase, toError } from "../../utils/supabase.utils";
import { newWriteId } from "../../utils/write.utils";
import brandServices from "./brand.services";

const table = "inventory_items";
const columns =
  "id, sku, name, category_id, category:categories(name), brand_id, brand:brands(name), part_number, unit, on_hand, reorder_level, selling_price, location, stock_status, archived_at, updated_at";
const alertLimit = 50;

const textOrNull = (value: string) => (value.trim() === "" ? null : value.trim());

const editableValues = (values: IItemSaveValues) => ({
  sku: values.sku.trim(),
  name: values.name.trim(),
  category_id: values.category_id,
  brand_id: values.brand_id,
  part_number: textOrNull(values.part_number),
  unit: values.unit.trim(),
  reorder_level: Number(values.reorder_level),
  selling_price: values.selling_price === "" ? null : Number(values.selling_price),
  location: textOrNull(values.location),
});

const inventoryServices = {
  getList: async (
    filters: IInventoryFilters,
    pagination: IPaginationRequest,
    signal?: AbortSignal,
  ): Promise<IPaginationResponse<IInventoryItem>> => {
    const [from, to] = pageRange(pagination);
    let query = supabase.from(table).select(columns, { count: "exact" });

    if (filters.view === "archived") query = query.not("archived_at", "is", null);
    else query = query.is("archived_at", null);
    if (filters.view === "low" || filters.view === "out") {
      query = query.eq("stock_status", filters.view);
    }
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.brandId) query = query.eq("brand_id", filters.brandId);

    const pattern = toIlikePattern(filters.search);
    if (pattern) {
      // The brand name lives on brands, so matching brands are looked up first.
      const brandIds = await brandServices.getIdsMatching(filters.search, signal);
      const byBrand = brandIds.length > 0 ? `,brand_id.in.(${brandIds.join(",")})` : "";
      query = query.or(
        `name.ilike.${pattern},sku.ilike.${pattern},part_number.ilike.${pattern}${byBrand}`,
      );
    }

    if (signal) query = query.abortSignal(signal);
    const { data, error, count } = await query.order("name").range(from, to);
    if (error) throw toError(error);

    return toPage((data ?? []) as unknown as IInventoryItem[], count ?? 0, pagination);
  },

  getSummary: async (signal?: AbortSignal): Promise<IInventorySummary> => {
    let query = supabase.rpc("inventory_summary");
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.single();
    if (error) throw toError(error);

    const row = data as IInventorySummary;
    // bigint aggregates can arrive as strings.
    return {
      item_count: Number(row.item_count),
      units_on_hand: Number(row.units_on_hand),
      low_count: Number(row.low_count),
      out_count: Number(row.out_count),
    };
  },

  // Emptiest shelves first, so out-of-stock items lead.
  getAlerts: async (signal?: AbortSignal): Promise<IInventoryItem[]> => {
    let query = supabase
      .from(table)
      .select(columns)
      .is("archived_at", null)
      .in("stock_status", ["out", "low"]);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("on_hand").order("name").limit(alertLimit);
    if (error) throw toError(error);

    return (data ?? []) as unknown as IInventoryItem[];
  },

  create: (values: IItemSaveValues): Promise<IMutationResult> => {
    const editable = editableValues(values);
    return runWrite({
      kind: "rpc",
      fn: "create_item",
      label: `Add ${editable.name}`,
      args: {
        p_sku: editable.sku,
        p_name: editable.name,
        p_category_id: editable.category_id,
        p_brand_id: editable.brand_id,
        p_part_number: editable.part_number,
        p_unit: editable.unit,
        p_reorder_level: editable.reorder_level,
        p_selling_price: editable.selling_price,
        p_location: editable.location,
        p_opening_stock: Number(values.opening_stock),
        p_client_id: newWriteId(),
      },
    });
  },

  update: (id: string, values: IItemSaveValues): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table,
      label: `Update ${values.name.trim()}`,
      values: editableValues(values),
      match: { id },
    }),

  setArchived: (item: IInventoryItem, archived: boolean): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table,
      label: `${archived ? "Archive" : "Restore"} ${item.name}`,
      values: { archived_at: archived ? new Date().toISOString() : null },
      match: { id: item.id },
    }),
};

export default inventoryServices;
