import type { IBrandFormInput } from "../../models/data/brand/brand.request";
import type { IBrand, IBrandOption } from "../../models/data/brand/brand.response";
import type { IMutationResult } from "../../models/common/write.model";
import { runWrite } from "../../store/common/sync.store";
import { toIlikePattern } from "../../utils/search.utils";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "brands";

// A shop carries tens of brands, not thousands, so these lists stay unpaged.
const brandServices = {
  getAll: async (signal?: AbortSignal): Promise<IBrand[]> => {
    let query = supabase.from(table).select("id, name, created_at, inventory_items(count)");
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("name");
    if (error) throw toError(error);

    return (data ?? []) as IBrand[];
  },

  getOptions: async (signal?: AbortSignal): Promise<IBrandOption[]> => {
    let query = supabase.from(table).select("id, name");
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("name");
    if (error) throw toError(error);

    return (data ?? []) as IBrandOption[];
  },

  // Lets the inventory search match a brand name through brand_id.
  getIdsMatching: async (search: string, signal?: AbortSignal): Promise<string[]> => {
    const pattern = toIlikePattern(search);
    if (!pattern) return [];

    let query = supabase.from(table).select("id").ilike("name", pattern);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw toError(error);

    return (data ?? []).map((row: { id: string }) => row.id);
  },

  // The item form passes its own id so a queued item can reference the new brand.
  create: (values: IBrandFormInput, id?: string): Promise<IMutationResult> =>
    runWrite({
      kind: "insert",
      table,
      label: `Add ${values.name}`,
      values: id ? { id, name: values.name } : { name: values.name },
    }),

  update: (id: string, values: IBrandFormInput): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table,
      label: `Rename to ${values.name}`,
      values: { name: values.name },
      match: { id },
    }),

  remove: (brand: IBrand): Promise<IMutationResult> =>
    runWrite({
      kind: "delete",
      table,
      label: `Delete ${brand.name}`,
      match: { id: brand.id },
    }),
};

export default brandServices;
