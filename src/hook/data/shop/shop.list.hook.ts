import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ShopStatus } from "../../../enums/shop.enum";
import {
  scopedKey,
  shopListKey,
  shopOptionsKey,
  shopSettingsKey,
  shopTimezoneKey,
} from "../../../keys/query.keys";
import { shopTableKey } from "../../../keys/table.keys";
import type { IShopFilters } from "../../../models/data/shop/shop.request";
import shopServices from "../../../services/data/shop.services";
import {
  selectActiveShopId,
  useShopStore,
} from "../../../store/data/shop/shop.store";
import { useFilters } from "../../common/filter.hook";
import { usePagination } from "../../common/pagination.hook";
import { useDebouncedSearch } from "../../common/search.hook";
import { useMe, usePermissions } from "../auth/auth.session.hook";

export const useShopOptions = () => {
  const { isSuperadmin } = usePermissions();

  return useQuery({
    queryKey: [shopOptionsKey],
    queryFn: ({ signal }) => shopServices.getOptions(signal),
    enabled: isSuperadmin,
  });
};

// The shop every owner screen works in: the superadmin's pick from the switcher,
// or the signed-in user's own shop. Null until the superadmin picks one.
export const useActiveShop = () => {
  const { data: me } = useMe();
  const { data: shops = [] } = useShopOptions();
  const pickedShopId = useShopStore(selectActiveShopId);

  if (me?.role !== "superadmin") {
    return { shopId: me?.shop?.id ?? null, shopName: me?.shop?.name ?? null };
  }

  const picked = shops.find((shop) => shop.id === pickedShopId);
  return { shopId: picked?.id ?? null, shopName: picked?.name ?? null };
};

// The working shop's timezone: every shop-local date is read in it.
export const useShopTimezone = () => {
  const { shopId } = useActiveShop();

  return useQuery({
    queryKey: [scopedKey(shopTimezoneKey, shopId)],
    queryFn: ({ signal }) => shopServices.getTimezone(shopId ?? "", signal),
    enabled: Boolean(shopId),
  });
};

type IShopToolbarFilters = { status?: ShopStatus };

// The superadmin's Shops list. Mounted once, by the shops panel: it also sends
// the list back to page one when the status filter changes.
export const useShopList = () => {
  const { pagination, setPagination } = usePagination(shopTableKey);
  const search = useDebouncedSearch(shopTableKey, shopTableKey);
  const { filters } = useFilters<IShopToolbarFilters>(shopTableKey);

  const status = filters.status;
  const lastStatus = useRef(status);

  useEffect(() => {
    if (lastStatus.current === status) return;
    lastStatus.current = status;
    setPagination({ pageNumber: 1 });
  }, [status, setPagination]);

  const listFilters: IShopFilters = { search, status };

  return useQuery({
    queryKey: [shopListKey, listFilters, pagination],
    queryFn: ({ signal }) => shopServices.getList(listFilters, pagination, signal),
    placeholderData: keepPreviousData,
  });
};

export const useShopSettings = () => {
  const { shopId, shopName } = useActiveShop();
  const { manageShopSettings } = usePermissions();

  const query = useQuery({
    queryKey: [scopedKey(shopSettingsKey, shopId)],
    queryFn: ({ signal }) => shopServices.getSettings(shopId ?? "", signal),
    enabled: manageShopSettings && Boolean(shopId),
  });

  return { ...query, shopId, shopName, canManage: manageShopSettings };
};
