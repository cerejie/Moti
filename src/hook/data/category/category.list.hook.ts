import { useQuery } from "@tanstack/react-query";
import { categoryOptionsKey, scopedKey } from "../../../keys/query.keys";
import categoryServices from "../../../services/data/category.services";
import { useActiveShop } from "../shop/shop.list.hook";

export const useCategoryOptions = () => {
  const { shopId } = useActiveShop();

  return useQuery({
    queryKey: [scopedKey(categoryOptionsKey, shopId)],
    queryFn: ({ signal }) =>
      shopId ? categoryServices.getOptions(shopId, signal) : [],
    enabled: Boolean(shopId),
  });
};
