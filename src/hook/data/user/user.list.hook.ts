import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { StaffRole } from "../../../enums/role.enum";
import type { UserStatus } from "../../../enums/user.enum";
import { scopedKey, userListKey } from "../../../keys/query.keys";
import { userTableKey } from "../../../keys/table.keys";
import type { IUserFilters } from "../../../models/data/user/user.request";
import type { IStaffUser } from "../../../models/data/user/user.response";
import userServices from "../../../services/data/user.services";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { useMe, usePermissions } from "../auth/auth.session.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type IUserToolbarFilters = { shop_id?: string; role?: StaffRole; status?: UserStatus };

// Mounted once, by the users panel: it also sends the list back to page one
// when a toolbar filter changes.
export const useUserList = () => {
  const { isSuperadmin } = usePermissions();
  const { shopId } = useActiveShop();
  const { data: me } = useMe();
  const { pagination, setPagination } = usePagination(userTableKey);
  const search = useDebouncedSearch(userTableKey, userTableKey);
  const { filters } = useFilters<IUserToolbarFilters>(userTableKey);

  const filterSignature = [filters.shop_id, filters.role, filters.status].join("|");
  const lastSignature = useRef(filterSignature);

  useEffect(() => {
    if (lastSignature.current === filterSignature) return;
    lastSignature.current = filterSignature;
    setPagination({ pageNumber: 1 });
  }, [filterSignature, setPagination]);

  // The superadmin looks across every shop; an owner's list is their own shop.
  const listFilters: IUserFilters = {
    search,
    shopId: isSuperadmin ? filters.shop_id : (shopId ?? undefined),
    role: filters.role,
    status: filters.status,
  };

  const hasShop = isSuperadmin || Boolean(shopId);

  const query = useQuery({
    queryKey: [scopedKey(userListKey, isSuperadmin ? "all" : shopId), listFilters, pagination],
    queryFn: ({ signal }) => userServices.getList(listFilters, pagination, signal),
    enabled: hasShop,
    placeholderData: keepPreviousData,
  });

  // The same rule update_staff_profile and manage-staff apply: never yourself,
  // never the superadmin, and an owner only their shop's employees.
  const canManage = (user: IStaffUser) =>
    user.id !== me?.id &&
    user.role !== "superadmin" &&
    (isSuperadmin || user.role === "employee");

  return { ...query, hasShop, isSuperadmin, meId: me?.id ?? null, canManage };
};
