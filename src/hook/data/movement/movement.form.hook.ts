import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTransitionNavigate } from "../../layout/navigation.hook";
import { stockQueryKeys } from "../../../keys/query.keys";
import {
  countModalKey,
  damagedStockModalKey,
  deliveryReviewModalKey,
} from "../../../keys/modal.keys";
import {
  damagedFormSchema,
  type IDamagedFormInput,
} from "../../../models/data/movement/movement.request";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import { ROUTES } from "../../../routes/route.paths";
import movementServices from "../../../services/data/movement.services";
import { useCountStore } from "../../../store/data/count/count.store";
import { useDeliveryStore } from "../../../store/data/delivery/delivery.store";
import { useModal, useModalActions } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";

const damagedDefaults: IDamagedFormInput = { quantity: "1", note: "" };

export const useDamagedStockModal = () => useModal<IInventoryItem>(damagedStockModalKey);

// One item written off: the quantity, an optional note, and the before → after preview.
export const useDamagedStockForm = () => {
  const { modal, closeModal } = useDamagedStockModal();
  const item = modal.data;
  // The sheet only opens with a branch picked; its item carries that branch's count.
  const { writeBranch } = useActiveBranch();

  const form = useForm<IDamagedFormInput>({
    resolver: zodResolver(damagedFormSchema),
    defaultValues: damagedDefaults,
  });
  const { reset, control } = form;

  useEffect(() => {
    if (modal.visible) reset(damagedDefaults);
  }, [modal.visible, reset]);

  const quantityText = useWatch({ control, name: "quantity" });
  const quantity = /^\d+$/.test(quantityText ?? "") ? Number(quantityText) : 0;
  const onHand = item?.on_hand ?? 0;
  const after = onHand - quantity;

  const mutation = useAppMutation(
    (values: IDamagedFormInput) =>
      item && writeBranch
        ? movementServices.recordDamaged(writeBranch.id, item.id, item.name, values)
        : Promise.reject(new Error(item ? "Pick a branch first" : "No item selected")),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      successMessage: "Recorded as damaged or lost. Stock updated.",
      queuedMessage: "Saved on this device. Waiting to sync.",
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    item,
    form,
    mutation,
    preview: { before: onHand, after, insufficient: after < 0 },
    onSubmit: (values: IDamagedFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

// Add stock, Check stock count and Damaged or lost, from Stocks or with a product picked.
// Add stock and the count are pages; with a product they open straight on its quantities.
// The item's on_hand must be the branch's, so on "All branches" the page asks for one first.
export const useStockActions = () => {
  const navigate = useTransitionNavigate();
  const { openModal } = useModalActions();
  const addToDelivery = useDeliveryStore((state) => state.add);
  const addToCount = useCountStore((state) => state.add);
  const setCountStep = useCountStore((state) => state.setStep);
  const branchId = useActiveBranch().writeBranch?.id;

  return {
    receive: (item?: IInventoryItem) => {
      if (item && branchId) {
        addToDelivery(branchId, item);
        openModal(deliveryReviewModalKey);
      }
      void navigate(ROUTES.receiveDelivery);
    },
    count: (item?: IInventoryItem) => {
      if (item && branchId) {
        addToCount(branchId, item);
        setCountStep("count");
        openModal(countModalKey);
      }
      void navigate(ROUTES.stockCount);
    },
    // With an item the sheet opens where the owner is; the page mounts it.
    damaged: (item?: IInventoryItem) => {
      if (item && branchId) openModal(damagedStockModalKey, item);
      else void navigate(ROUTES.damagedStock);
    },
  };
};
