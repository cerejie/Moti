import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { stockQueryKeys } from "../../../keys/query.keys";
import { deliveryReviewModalKey, deliverySuccessModalKey } from "../../../keys/modal.keys";
import {
  deliveryFormSchema,
  type IDeliveryFormInput,
} from "../../../models/data/delivery/delivery.request";
import movementServices from "../../../services/data/movement.services";
import {
  selectDeliveryLines,
  useDeliveryStore,
} from "../../../store/data/delivery/delivery.store";
import { useModal, useModalActions } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";

// What the success prompt shows once the delivery list is gone.
export interface IDeliveryReceipt {
  itemCount: number;
  totalQuantity: number;
  queued: boolean;
}

export const useDelivery = () => {
  const lines = useDeliveryStore(selectDeliveryLines);
  const add = useDeliveryStore((state) => state.add);
  const setQuantity = useDeliveryStore((state) => state.setQuantity);
  const remove = useDeliveryStore((state) => state.remove);
  const clear = useDeliveryStore((state) => state.clear);

  return {
    lines,
    itemCount: lines.length,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    add,
    setQuantity,
    remove,
    clear,
  };
};

export const useReceiveDeliveryForm = () => {
  const { modal, closeModal } = useModal(deliveryReviewModalKey);
  const { openModal } = useModalActions();
  const delivery = useDelivery();

  const form = useForm<IDeliveryFormInput>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: { note: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ note: "" });
  }, [modal.visible, reset]);

  const mutation = useAppMutation(
    (values: IDeliveryFormInput) => movementServices.receiveDelivery(delivery.lines, values.note),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      onSuccess: (result) => {
        const receipt: IDeliveryReceipt = {
          itemCount: delivery.itemCount,
          totalQuantity: delivery.totalQuantity,
          queued: result.queued,
        };
        delivery.clear();
        closeModal();
        openModal(deliverySuccessModalKey, receipt);
      },
    },
  );

  return {
    open: modal.visible,
    delivery,
    form,
    mutation,
    onSubmit: (values: IDeliveryFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};
