import { useQuery } from "@tanstack/react-query";
import { brandOptionsKey, scopedKey } from "../../../keys/query.keys";
import brandServices from "../../../services/data/brand.services";
import { useActiveShop } from "../shop/shop.list.hook";

export const useBrandOptions = () => {
  const { shopId } = useActiveShop();

  return useQuery({
    queryKey: [scopedKey(brandOptionsKey, shopId)],
    queryFn: ({ signal }) =>
      shopId ? brandServices.getOptions(shopId, signal) : [],
    enabled: Boolean(shopId),
  });
};
