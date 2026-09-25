import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";
import type {
  IPaginationRequest,
  IPaginationResponse,
} from "../../models/common/pagination.model";
import { totalPages } from "../../models/common/pagination.model";
import type { IUserFilters, IUserRequest } from "../../models/data/user/user.request";
import type {
  IStaffUser,
  ITemporaryPassword,
} from "../../models/data/user/user.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "profiles";
const columns = "id, shop_id, role, full_name, email, is_active, created_at, shop:shops(id, name)";
const staffFunction = "manage-staff";

// Quotes, backslashes and wildcards would break or widen the PostgREST or-filter.
const searchTerm = (search: string) => search.replace(/["\\%]/g, "").trim();

// manage-staff answers every refusal as { error: "<sentence>" }.
const invokeStaff = async (body: Record<string, unknown>): Promise<ITemporaryPassword> => {
  const { data, error } = await supabase.functions.invoke<ITemporaryPassword>(staffFunction, {
    body,
  });

  if (error instanceof FunctionsHttpError) {
    const reply: unknown = await error.context.json().catch(() => null);
    const message =
      reply && typeof reply === "object" && "error" in reply ? String(reply.error) : error.message;
    throw new Error(message);
  }
  // Worded like fetch's own failure so describeError reports it as offline.
  if (error instanceof FunctionsFetchError) throw new TypeError("Failed to fetch");
  if (error || !data) throw toError(error);
  return data;
};

const userServices = {
  getList: async (
    filters: IUserFilters,
    pagination: IPaginationRequest,
    signal: AbortSignal,
  ): Promise<IPaginationResponse<IStaffUser>> => {
    const from = (pagination.pageNumber - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    const term = searchTerm(filters.search);

    let query = supabase.from(table).select(columns, { count: "exact" });
    if (filters.shopId) query = query.eq("shop_id", filters.shopId);
    if (filters.role) query = query.eq("role", filters.role);
    if (filters.status) query = query.eq("is_active", filters.status === "active");
    if (term) query = query.or(`full_name.ilike."%${term}%",email.ilike."%${term}%"`);

    const { data, error, count } = await query
      .order("full_name")
      .order("id")
      .range(from, to)
      .abortSignal(signal);
    if (error) throw toError(error);

    const totalCount = count ?? 0;
    return {
      data: (data ?? []) as unknown as IStaffUser[],
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalPages: totalPages(totalCount, pagination.pageSize),
      totalCount,
    };
  },

  update: (id: string, fullName: string, isActive: boolean) =>
    runWrite({
      kind: "rpc",
      fn: "update_staff_profile",
      label: isActive ? "Update user" : "Deactivate user",
      args: { p_id: id, p_full_name: fullName, p_is_active: isActive },
    }),

  // Online-only: the temporary password exists only in the server's answer.
  create: (values: IUserRequest) => invokeStaff({ action: "create", ...values }),

  resetPassword: (userId: string) =>
    invokeStaff({ action: "reset_password", user_id: userId }),
};

export default userServices;
