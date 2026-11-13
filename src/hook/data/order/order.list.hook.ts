import { useQuery } from "@tanstack/react-query";
import { orderListKey } from "../../../keys/query.keys";
import orderServices from "../../../services/data/order.services";

export const openOrderListQueryKey = [orderListKey, "open"] as const;

export const useOrderList = (enabled = true) => {
  const query = useQuery({
    queryKey: openOrderListQueryKey,
    queryFn: ({ signal }) => orderServices.getOpen(signal),
    enabled,
  });
  const lines = query.data?.lines ?? [];

  return {
    query,
    list: query.data ?? null,
    lines,
    itemCount: lines.length,
    isOnList: (itemId: string) => lines.some((line) => line.item_id === itemId),
  };
};
