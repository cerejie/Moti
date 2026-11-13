import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userListKey } from "../../../keys/query.keys";
import { userTableKey } from "../../../keys/table.keys";
import type { IFieldOption } from "../../../models/common/field.model";
import type { UserView } from "../../../models/data/user/user.request";
import type { IUser } from "../../../models/data/user/user.response";
import userServices from "../../../services/data/user.services";
import { findCachedRow } from "../../../utils/query.utils";
import { useFilters } from "../../common/filter.hook";

// A shop has a handful of accounts, so the list is unpaged.
export const useUserList = () => {
  const { filters, setFilters } = useFilters<{ view?: UserView }>(userTableKey);
  const view = filters.view ?? "all";

  const query = useQuery({
    queryKey: [userListKey, view],
    queryFn: ({ signal }) => userServices.getList(view, signal),
  });

  return { query, view, setView: (next: UserView) => setFilters({ view: next }) };
};

// The people a history can be filtered by; shares the Team list's cache.
export const useUserOptions = () => {
  const query = useQuery({
    queryKey: [userListKey, "all"],
    queryFn: ({ signal }) => userServices.getList("all", signal),
  });

  const options: IFieldOption[] = (query.data ?? []).map((user) => ({
    value: user.id,
    label: user.full_name,
  }));

  return { options, isLoading: query.isLoading };
};

// Keyed under the list prefix, so every account change refreshes it too.
export const useUser = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useQuery<IUser>({
    queryKey: [userListKey, "detail", userId],
    queryFn: ({ signal }) => userServices.getById(userId ?? "", signal),
    enabled: Boolean(userId),
    placeholderData: () => findCachedRow<IUser>(queryClient, userListKey, userId),
  });
};
