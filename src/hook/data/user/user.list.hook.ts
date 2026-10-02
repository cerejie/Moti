import { useQuery } from "@tanstack/react-query";
import { userListKey } from "../../../keys/query.keys";
import { userTableKey } from "../../../keys/table.keys";
import type { UserView } from "../../../models/data/user/user.request";
import userServices from "../../../services/data/user.services";
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
