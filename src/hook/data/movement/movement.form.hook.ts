import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  movementModeReasons,
  movementModeTitles,
  movementModeTypes,
  movementReasonLabels,
  type StockMovementMode,
} from "../../../enums/movement.enum";
import {
  analyzerRankingKey,
  analyzerReorderKey,
  analyzerSummaryKey,
  dashboardAlertsKey,
  dashboardSummaryKey,
  inventoryItemKey,
  inventoryListKey,
  movementItemKey,
  movementListKey,
} from "../../../keys/query.keys";
import { stockMovementModalKey } from "../../../keys/modal.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  stockMovementSchema,
  type IStockMovementRequest,
} from "../../../models/data/movement/movement.request";
import movementServices from "../../../services/data/movement.services";
import { newWriteId } from "../../../utils/write.utils";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";

type IStockMovementTarget = { item: IInventoryItem; mode: StockMovementMode };

type IRecordMovement = { item: IInventoryItem; values: IStockMovementRequest };

const affectedKeys = [
  inventoryListKey,
  inventoryItemKey,
  movementListKey,
  movementItemKey,
  dashboardSummaryKey,
  dashboardAlertsKey,
  analyzerRankingKey,
  analyzerSummaryKey,
  analyzerReorderKey,
];

const successMessages: Record<StockMovementMode, string> = {
  stock_in: "Stock added",
  stock_out: "Stock deducted",
};

// A fresh client id each time the form opens: a retried submit reuses it, a new movement never does.
const emptyMovement = (target?: IStockMovementTarget): IStockMovementRequest => {
  const mode = target?.mode ?? "stock_in";
  return {
    mode,
    reason: movementModeReasons[mode][0] as IStockMovementRequest["reason"],
    quantity: "",
    note: "",
    on_hand: target?.item.on_hand ?? 0,
    client_id: newWriteId(),
  };
};

export const useStockMovementModal = () => {
  const { openModal } = useModal<IStockMovementTarget>(stockMovementModalKey);

  return {
    openAdd: (item: IInventoryItem) => openModal({ item, mode: "stock_in" }),
    openDeduct: (item: IInventoryItem) => openModal({ item, mode: "stock_out" }),
  };
};

export const useStockMovementForm = () => {
  const { modal, openModal, closeModal } =
    useModal<IStockMovementTarget>(stockMovementModalKey);
  const target = modal.data;
  const mode = target?.mode ?? "stock_in";

  const form = useForm<IStockMovementRequest>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: emptyMovement(),
  });

  const mutation = useAppMutation<IRecordMovement>({
    mutationFn: ({ item, values }) => movementServices.record(item, values),
    successMessage: ({ values }) => successMessages[values.mode],
    invalidates: affectedKeys,
    onSuccess: () => closeModal(),
  });

  const { reset } = form;
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    if (!modal.visible) return;
    reset(emptyMovement(target));
    resetMutation();
  }, [modal.visible, target, reset, resetMutation]);

  const quantityText = useWatch({ control: form.control, name: "quantity" });
  const quantity = /^\d+$/.test(quantityText.trim()) ? Number(quantityText) : 0;
  const before = target?.item.on_hand ?? 0;
  const after = movementModeTypes[mode] === "stock_in" ? before + quantity : before - quantity;

  const onSubmit = (values: IStockMovementRequest) => {
    if (target) mutation.mutate({ item: target.item, values });
  };

  return {
    form,
    onSubmit,
    open: modal.visible,
    onOpenChange: (open: boolean) => (open ? openModal(target) : closeModal()),
    item: target?.item ?? null,
    mode,
    title: movementModeTitles[mode],
    reasonOptions: movementModeReasons[mode].map((reason) => ({
      value: reason,
      label: movementReasonLabels[reason],
    })),
    preview: { before, after, unit: target?.item.unit ?? "" },
    errorText: mutation.errorText,
    isPending: mutation.isPending,
  };
};
