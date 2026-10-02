import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { stockQueryKeys } from "../../../keys/query.keys";
import {
  cartModalKey,
  checkoutSuccessModalKey,
  transactionVoidModalKey,
} from "../../../keys/modal.keys";
import {
  checkoutFormSchema,
  voidFormSchema,
  type ICartLine,
  type ICheckoutFormInput,
  type IVoidFormInput,
} from "../../../models/data/transaction/transaction.request";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import transactionServices from "../../../services/data/transaction.services";
import { selectCartLines, useCartStore } from "../../../store/data/transaction/transaction.store";
import { useModal, useModalActions } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";

// What the success prompt shows once the cart is gone.
export interface ICheckoutReceipt {
  itemCount: number;
  totalQuantity: number;
  totalAmount: number | null;
  queued: boolean;
}

// Display only: the priced lines add up; null when no line has a price.
const totalAmountOf = (lines: readonly ICartLine[]): number | null => {
  const priced = lines.filter((line) => line.item.selling_price !== null);
  if (priced.length === 0) return null;
  return priced.reduce((sum, line) => sum + (line.item.selling_price ?? 0) * line.quantity, 0);
};

export const useCart = () => {
  const lines = useCartStore(selectCartLines);
  const add = useCartStore((state) => state.add);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  return {
    lines,
    itemCount: lines.length,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    totalAmount: totalAmountOf(lines),
    hasUnpriced: lines.some((line) => line.item.selling_price === null),
    add,
    setQuantity,
    remove,
    clear,
  };
};

export const useCheckoutForm = () => {
  const { modal, closeModal } = useModal(cartModalKey);
  const { openModal } = useModalActions();
  const cart = useCart();

  const form = useForm<ICheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { note: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ note: "" });
  }, [modal.visible, reset]);

  const mutation = useAppMutation(
    (values: ICheckoutFormInput) => transactionServices.checkout(cart.lines, values.note),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      onSuccess: (result) => {
        const receipt: ICheckoutReceipt = {
          itemCount: cart.itemCount,
          totalQuantity: cart.totalQuantity,
          totalAmount: cart.totalAmount,
          queued: result.queued,
        };
        cart.clear();
        closeModal();
        openModal(checkoutSuccessModalKey, receipt);
      },
    },
  );

  return {
    open: modal.visible,
    cart,
    form,
    mutation,
    onSubmit: (values: ICheckoutFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

// The owner voids from the transaction detail; the stock goes back in the database.
export const useVoidForm = () => {
  const { modal, closeModal } = useModal<ITransaction>(transactionVoidModalKey);
  const transaction = modal.data;

  const form = useForm<IVoidFormInput>({
    resolver: zodResolver(voidFormSchema),
    defaultValues: { reason: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ reason: "" });
  }, [modal.visible, reset]);

  const mutation = useAppMutation(
    (values: IVoidFormInput) =>
      transaction
        ? transactionServices.void(transaction, values.reason)
        : Promise.reject(new Error("No transaction selected")),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      successMessage: "Transaction voided. Stock is back on the shelf.",
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    transaction,
    form,
    mutation,
    onSubmit: (values: IVoidFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};
