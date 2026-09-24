import type { IShopOption } from "../../models/data/shop/shop.response";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "shops";
const optionColumns = "id, name, is_active";
const settingsTable = "shop_settings";

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
};

export default shopServices;
