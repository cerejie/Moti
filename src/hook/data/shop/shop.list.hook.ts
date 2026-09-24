import { useQuery } from "@tanstack/react-query";
import { shopOptionsKey } from "../../../keys/query.keys";
import shopServices from "../../../services/data/shop.services";
import {
  selectActiveShopId,
  useShopStore,
} from "../../../store/data/shop/shop.store";
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
