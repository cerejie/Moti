import type { IShopOption } from "../../models/data/shop/shop.response";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "shops";
const optionColumns = "id, name, is_active";

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
};

export default shopServices;
