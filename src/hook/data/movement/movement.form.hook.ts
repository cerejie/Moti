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

const damagedDefaults: IDamagedFormInput = { quantity: "1", note: "" };

export const useDamagedStockModal = () => useModal<IInventoryItem>(damagedStockModalKey);

// One item written off: the quantity, an optional note, and the before → after preview.
export const useDamagedStockForm = () => {
  const { modal, closeModal } = useDamagedStockModal();
  const item = modal.data;

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
      item
        ? movementServices.recordDamaged(item.id, item.name, values)
        : Promise.reject(new Error("No item selected")),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      successMessage: "Recorded as damaged or lost",
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

// The Stock tab's three actions, and the same three from an item with that item picked.
// Receive and Count are pages; with an item they open straight on its quantities.
export const useStockActions = () => {
  const navigate = useTransitionNavigate();
  const { openModal } = useModalActions();
  const addToDelivery = useDeliveryStore((state) => state.add);
  const addToCount = useCountStore((state) => state.add);
  const setCountStep = useCountStore((state) => state.setStep);

  return {
    receive: (item?: IInventoryItem) => {
      if (item) {
        addToDelivery(item);
        openModal(deliveryReviewModalKey);
      }
      void navigate(ROUTES.receiveDelivery);
    },
    count: (item?: IInventoryItem) => {
      if (item) {
        addToCount(item);
        setCountStep("count");
        openModal(countModalKey);
      }
      void navigate(ROUTES.stockCount);
    },
    // With an item the sheet opens where the owner is; the page mounts it.
    damaged: (item?: IInventoryItem) => {
      if (item) openModal(damagedStockModalKey, item);
      else void navigate(ROUTES.damagedStock);
    },
  };
};
