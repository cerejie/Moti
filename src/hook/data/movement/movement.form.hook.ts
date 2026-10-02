import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { StockAction } from "../../../enums/stock.enum";
import { stockQueryKeys } from "../../../keys/query.keys";
import { stockMovementModalKey } from "../../../keys/modal.keys";
import {
  movementFormSchema,
  type IMovementFormInput,
} from "../../../models/data/movement/movement.request";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import movementServices from "../../../services/data/movement.services";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";

export interface IStockMovementRequest {
  item: IInventoryItem;
  action: StockAction;
}

const defaultsFor = (action: StockAction | undefined): IMovementFormInput =>
  action === "stock_out"
    ? { type: "stock_out", reason: "damaged", quantity: "1", note: "" }
    : { type: "stock_in", reason: "restock", quantity: "1", note: "" };

const actionMessages: Record<StockAction, string> = {
  stock_in: "Stock added",
  stock_out: "Stock deducted",
};

export const useStockMovementModal = () => useModal<IStockMovementRequest>(stockMovementModalKey);

export const useStockMovementForm = () => {
  const { modal, closeModal } = useStockMovementModal();
  const request = modal.data;
  const item = request?.item;
  const action = request?.action ?? "stock_in";

  const form = useForm<IMovementFormInput>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: defaultsFor(action),
  });
  const { reset, control } = form;

  useEffect(() => {
    if (modal.visible) reset(defaultsFor(request?.action));
  }, [modal.visible, request, reset]);

  const quantityText = useWatch({ control, name: "quantity" });
  const quantity = /^\d+$/.test(quantityText ?? "") ? Number(quantityText) : 0;
  const onHand = item?.on_hand ?? 0;
  const after = action === "stock_in" ? onHand + quantity : onHand - quantity;

  const mutation = useAppMutation(
    (values: IMovementFormInput) =>
      item ? movementServices.record(item.id, item.name, values) : Promise.reject(new Error("No item selected")),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      successMessage: actionMessages[action],
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    item,
    action,
    form,
    mutation,
    preview: { before: onHand, after, insufficient: after < 0 },
    onSubmit: (values: IMovementFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};
