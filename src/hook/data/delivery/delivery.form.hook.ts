import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { branchListKey, stockQueryKeys } from "../../../keys/query.keys";
import { deliveryReviewModalKey } from "../../../keys/modal.keys";
import {
  deliveryFormSchema,
  type IDeliveryFormInput,
} from "../../../models/data/delivery/delivery.request";
import movementServices from "../../../services/data/movement.services";
import {
  selectDeliveryBranch,
  selectDeliveryLines,
  selectDeliveryOrderListId,
  useDeliveryStore,
} from "../../../store/data/delivery/delivery.store";
import { usePushedRoute } from "../../layout/navigation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";

export const useDelivery = () => {
  const lines = useDeliveryStore(selectDeliveryLines);
  const storedBranchId = useDeliveryStore(selectDeliveryBranch);
  const orderListId = useDeliveryStore(selectDeliveryOrderListId);
  const add = useDeliveryStore((state) => state.add);
  const setQuantity = useDeliveryStore((state) => state.setQuantity);
  const remove = useDeliveryStore((state) => state.remove);
  const clear = useDeliveryStore((state) => state.clear);
  const { writeBranch } = useActiveBranch();

  return {
    lines,
    // An order list fill has no branch of its own; it goes where the owner is receiving.
    branchId: storedBranchId ?? writeBranch?.id ?? null,
    orderListId,
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
  const { goBack } = usePushedRoute();
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
    (values: IDeliveryFormInput) =>
      delivery.branchId
        ? movementServices.receiveDelivery(
            delivery.branchId,
            delivery.lines,
            values.note,
            delivery.orderListId,
          )
        : Promise.reject(new Error("Pick the branch this stock is for")),
    {
      silentError: true,
      // A first delivery is how a branch starts carrying products; its product count must follow.
      invalidate: [...stockQueryKeys, [branchListKey]],
      successMessage:
        delivery.orderListId !== null
          ? "Stock added. Anything that did not arrive stays on the buying list."
          : "Stock added.",
      queuedMessage: "Saved on this device. Waiting to sync.",
      // Back to where Add stock was started; a toast says it worked, nothing to dismiss.
      onSuccess: () => {
        delivery.clear();
        closeModal();
        goBack();
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
      if (!open) closeModal();
    },
  };
};
