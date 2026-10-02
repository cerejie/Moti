import type { ICategoryFormInput } from "../../models/data/category/category.request";
import type {
  ICategory,
  ICategoryOption,
} from "../../models/data/category/category.response";
import type { IMutationResult } from "../../models/common/write.model";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "categories";

// A shop has tens of categories, not thousands, so these lists stay unpaged.
const categoryServices = {
  getAll: async (signal?: AbortSignal): Promise<ICategory[]> => {
    let query = supabase.from(table).select("id, name, created_at, inventory_items(count)");
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("name");
    if (error) throw toError(error);

    return (data ?? []) as ICategory[];
  },

  getOptions: async (signal?: AbortSignal): Promise<ICategoryOption[]> => {
    let query = supabase.from(table).select("id, name");
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("name");
    if (error) throw toError(error);

    return (data ?? []) as ICategoryOption[];
  },

  // The item form passes its own id so a queued item can reference the new category.
  create: (values: ICategoryFormInput, id?: string): Promise<IMutationResult> =>
    runWrite({
      kind: "insert",
      table,
      label: `Add ${values.name}`,
      values: id ? { id, name: values.name } : { name: values.name },
    }),

  update: (id: string, values: ICategoryFormInput): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table,
      label: `Rename to ${values.name}`,
      values: { name: values.name },
      match: { id },
    }),

  remove: (category: ICategory): Promise<IMutationResult> =>
    runWrite({
      kind: "delete",
      table,
      label: `Delete ${category.name}`,
      match: { id: category.id },
    }),
};

export default categoryServices;
