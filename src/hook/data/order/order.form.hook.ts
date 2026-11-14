import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTransitionNavigate } from "../../layout/navigation.hook";
import { toast } from "sonner";
import { deliveryReviewModalKey } from "../../../keys/modal.keys";
import { orderListKey } from "../../../keys/query.keys";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import type { IOrderList, IOrderListLine } from "../../../models/data/order/order.response";
import { ROUTES } from "../../../routes/route.paths";
import orderServices from "../../../services/data/order.services";
import { useDeliveryStore } from "../../../store/data/delivery/delivery.store";
import { orderQuantityFor, toOrderListText } from "../../../utils/order.utils";
import { useConfirm } from "../../common/confirmation.hook";
import { useModalActions } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useShareText } from "../../common/share.hook";
import { openOrderListQueryKey, useOrderList } from "./order.list.hook";

const orderInvalidations = [[orderListKey]] as const;
// Typing "12" is one write, not two.
const quantitySaveDelay = 600;

export const useAddToOrderList = () => {
  const { isOnList } = useOrderList();
  const mutation = useAppMutation(orderServices.addLines, {
    invalidate: orderInvalidations,
    successMessage: "Added to the order list",
  });

  const toLines = (rows: readonly IStockAnalysisRow[]) =>
    rows
      .filter((row) => !isOnList(row.item_id))
      .map((row) => ({ item_id: row.item_id, quantity: orderQuantityFor(row) }));

  return {
    pending: mutation.isPending,
    isOnList,
    add: (row: IStockAnalysisRow) => mutation.mutate(toLines([row])),
    addAll: (rows: readonly IStockAnalysisRow[]) => {
      const lines = toLines(rows);
      if (lines.length === 0) {
        toast.info("Everything here is already on the order list.");
        return;
      }
      mutation.mutate(lines);
    },
  };
};

interface IQuantityChange {
  line: IOrderListLine;
  quantity: number;
}

interface IQuantityQueue {
  timer: ReturnType<typeof setTimeout> | null;
  changes: Map<string, IQuantityChange>;
}

const flushQuantities = (queue: IQuantityQueue, save: (change: IQuantityChange) => void) => {
  if (queue.timer) clearTimeout(queue.timer);
  queue.timer = null;
  queue.changes.forEach(save);
  queue.changes.clear();
};

// The list shows a change at once (offline too); the write follows.
export const useOrderLineActions = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const queue = useRef<IQuantityQueue>({ timer: null, changes: new Map() });
  const quantityMutation = useAppMutation(
    ({ line, quantity }: IQuantityChange) =>
      orderServices.setQuantity(line, quantity),
    { invalidate: orderInvalidations },
  );
  const removeMutation = useAppMutation(orderServices.removeLine, {
    invalidate: orderInvalidations,
    successMessage: "Removed from the order list",
  });
  const { mutate: saveQuantity } = quantityMutation;

  const patchList = (update: (lines: IOrderListLine[]) => IOrderListLine[]) =>
    queryClient.setQueryData<IOrderList | null>(openOrderListQueryKey, (list) =>
      list ? { ...list, lines: update(list.lines) } : list,
    );

  // Leaving the page right after typing still saves the last number.
  useEffect(() => {
    const pending = queue.current;
    return () => flushQuantities(pending, saveQuantity);
  }, [saveQuantity]);

  return {
    setQuantity: (line: IOrderListLine, quantity: number) => {
      patchList((lines) => lines.map((each) => (each.id === line.id ? { ...each, quantity } : each)));
      const pending = queue.current;
      pending.changes.set(line.id, { line, quantity });
      if (pending.timer) clearTimeout(pending.timer);
      pending.timer = setTimeout(() => flushQuantities(pending, saveQuantity), quantitySaveDelay);
    },
    remove: (line: IOrderListLine) =>
      confirm({
        kind: "delete",
        title: `Remove ${line.item.name}?`,
        message: "It comes off the order list. Its stock does not change.",
        itemName: line.item.name,
        okText: "Remove",
        onConfirm: async () => {
          queue.current.changes.delete(line.id);
          await removeMutation.mutateAsync(line);
          patchList((lines) => lines.filter((each) => each.id !== line.id));
        },
      }),
  };
};

export const useShareOrderList = () => {
  const share = useShareText();

  return (lines: readonly IOrderListLine[]) =>
    void share("Order list", toOrderListText(lines, new Date().toISOString()));
};

// Receive delivery opens on its review with the list as the expected quantities.
export const useReceiveOrderList = () => {
  const navigate = useTransitionNavigate();
  const { openModal } = useModalActions();
  const fillFromOrderList = useDeliveryStore((state) => state.fillFromOrderList);

  return (list: IOrderList) => {
    fillFromOrderList(
      list.id,
      list.lines.map(({ item_id, item, quantity }) => ({ item: { ...item, id: item_id }, quantity })),
    );
    openModal(deliveryReviewModalKey);
    void navigate(ROUTES.receiveDelivery);
  };
};
