import type { IMutationResult } from "../../models/common/write.model";
import type { IBranchFormInput } from "../../models/data/branch/branch.request";
import type { IBranch } from "../../models/data/branch/branch.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "branches";

// A shop has a handful of branches, so the list stays unpaged. RLS gives
// employees their own active branches only.
const branchServices = {
  getAll: async (signal?: AbortSignal): Promise<IBranch[]> => {
    let query = supabase
      .from(table)
      .select("id, name, sort, archived_at, created_at, branch_stock(count)");
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query.order("sort").order("created_at");
    if (error) throw toError(error);

    return (data ?? []) as IBranch[];
  },

  create: (values: IBranchFormInput, sort: number): Promise<IMutationResult> =>
    runWrite({
      kind: "insert",
      table,
      label: `Add ${values.name}`,
      values: { name: values.name, sort },
    }),

  rename: (id: string, values: IBranchFormInput): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table,
      label: `Rename to ${values.name}`,
      values: { name: values.name },
      match: { id },
    }),

  // The database refuses a branch that still holds stock or is the last active one.
  archive: (branch: IBranch): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table,
      label: `Archive ${branch.name}`,
      values: { archived_at: new Date().toISOString() },
      match: { id: branch.id },
    }),

  restore: (branch: IBranch): Promise<IMutationResult> =>
    runWrite({
      kind: "update",
      table,
      label: `Restore ${branch.name}`,
      values: { archived_at: null },
      match: { id: branch.id },
    }),
};

export default branchServices;
