import { useQuery } from "@tanstack/react-query";
import type { MasterfileKind, MasterfileTab } from "../../../enums/masterfile.enum";
import { masterfileOptionsKey, scopedKey } from "../../../keys/query.keys";
import { masterfileTabKey } from "../../../keys/table.keys";
import masterfileServices from "../../../services/data/masterfile.services";
import { useFilters } from "../../common/filter.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type IViewFilters = { tab?: MasterfileTab };

export const useMasterfileOptions = (kind: MasterfileKind) => {
  const { shopId } = useActiveShop();

  return useQuery({
    queryKey: [scopedKey(masterfileOptionsKey, kind, shopId)],
    queryFn: ({ signal }) =>
      shopId ? masterfileServices.getOptions(kind, shopId, signal) : [],
    enabled: Boolean(shopId),
  });
};

export const useMasterfileTab = () => {
  const { filters, setFilters } = useFilters<IViewFilters>(masterfileTabKey);

  return {
    tab: filters.tab ?? "categories",
    setTab: (tab: MasterfileTab) => setFilters({ tab }),
  };
};
