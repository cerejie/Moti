import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../models/common/pagination.model";
import { totalPages } from "../../models/common/pagination.model";
import type {
  IShopFilters,
  IShopRequest,
  IShopSettingsRequest,
} from "../../models/data/shop/shop.request";
import type {
  IShop,
  IShopOption,
  IShopSettings,
} from "../../models/data/shop/shop.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";
import { newWriteId } from "../../utils/write.utils";

const table = "shops";
const optionColumns = "id, name, is_active";
const listColumns = "id, name, is_active, created_at, profiles(count)";
const settingsTable = "shop_settings";
const settingsColumns = "shop_id, default_reorder_level, low_stock_margin_pct, timezone";

type IShopRow = Omit<IShop, "staff_count"> & { profiles: { count: number }[] };

// LIKE wildcards typed by the user are matched literally.
const likePattern = (search: string) =>
  `%${search.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;

const shopServices = {
  // Unpaged: feeds the superadmin's shop switcher.
  getOptions: async (signal: AbortSignal): Promise<IShopOption[]> => {
    const { data, error } = await supabase
      .from(table)
      .select(optionColumns)
      .order("name")
      .abortSignal(signal);
    if (error) throw toError(error);
    return (data ?? []) as IShopOption[];
  },

  getList: async (
    filters: IShopFilters,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<IShop>> => {
    const from = (pagination.pageNumber - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    let query = supabase.from(table).select(listColumns, { count: "exact" });
    if (filters.status) query = query.eq("is_active", filters.status === "active");
    if (filters.search) query = query.ilike("name", likePattern(filters.search));

    const { data, error, count } = await query
      .order("name")
      .order("id")
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    const totalCount = count ?? 0;
    return {
      data: ((data ?? []) as IShopRow[]).map(({ profiles, ...shop }) => ({
        ...shop,
        staff_count: profiles[0]?.count ?? 0,
      })),
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalPages: totalPages(totalCount, pagination.pageSize),
      totalCount,
    };
  },

  // The shops trigger creates the shop's settings row with the defaults.
  create: (values: IShopRequest) =>
    runWrite({
      kind: "insert",
      table,
      label: "Add shop",
      values: { id: newWriteId(), name: values.name },
    }),

  rename: (id: string, values: IShopRequest) =>
    runWrite({
      kind: "update",
      table,
      label: "Rename shop",
      values: { name: values.name },
      match: { id },
    }),

  setActive: (id: string, isActive: boolean) =>
    runWrite({
      kind: "update",
      table,
      label: isActive ? "Reactivate shop" : "Suspend shop",
      values: { is_active: isActive },
      match: { id },
    }),

  // The IANA zone every shop-local date (analyzer periods, date filters) is read in.
  getTimezone: async (shopId: string, signal: AbortSignal): Promise<string> => {
    const { data, error } = await supabase
      .from(settingsTable)
      .select("timezone")
      .eq("shop_id", shopId)
      .abortSignal(signal)
      .single();
    if (error) throw toError(error);
    return (data as { timezone: string }).timezone;
  },

  getSettings: async (shopId: string, signal: AbortSignal): Promise<IShopSettings> => {
    const { data, error } = await supabase
      .from(settingsTable)
      .select(settingsColumns)
      .eq("shop_id", shopId)
      .abortSignal(signal)
      .single();
    if (error) throw toError(error);
    return data as IShopSettings;
  },

  updateSettings: (shopId: string, values: IShopSettingsRequest) =>
    runWrite({
      kind: "update",
      table: settingsTable,
      label: "Update shop settings",
      values: {
        default_reorder_level: Number(values.default_reorder_level),
        low_stock_margin_pct: Number(values.low_stock_margin_pct),
        timezone: values.timezone,
      },
      match: { shop_id: shopId },
    }),
};

export default shopServices;
