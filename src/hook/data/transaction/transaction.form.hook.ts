import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { inventoryListKey, stockQueryKeys } from "../../../keys/query.keys";
import { cartModalKey, transactionVoidModalKey } from "../../../keys/modal.keys";
import { transactionPickTableKey } from "../../../keys/table.keys";
import {
  checkoutFormSchema,
  voidFormSchema,
  type ICheckoutFormInput,
  type IVoidFormInput,
} from "../../../models/data/transaction/transaction.request";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import transactionServices from "../../../services/data/transaction.services";
import { useViewStore } from "../../../store/common/view.store";
import {
  selectCartBranch,
  selectCartClientId,
  selectCartLines,
  useCartStore,
} from "../../../store/data/transaction/transaction.store";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useActiveBranch } from "../branch/branch.scope.hook";

const noteDefaults: ICheckoutFormInput = { note: "" };

export const useCart = () => {
  const lines = useCartStore(selectCartLines);
  const branchId = useCartStore(selectCartBranch);
  const clientId = useCartStore(selectCartClientId);
  const add = useCartStore((state) => state.add);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  return {
    branchId,
    clientId,
    lines,
    // Products, never a sum of units: pieces, liters and boxes do not add up.
    itemCount: lines.length,
    add,
    setQuantity,
    remove,
    clear,
  };
};

// Review sale and Save sale: the phone's full-height review and the desktop's side panel
// both run on this. Saving is the confirmation; success is a toast, never a dialog to dismiss.
export const useCheckoutForm = () => {
  const { modal, closeModal } = useModal(cartModalKey);
  const cart = useCart();
  const queryClient = useQueryClient();
  const resetSearch = useViewStore((state) => state.resetSearch);
  const { branches, multiple } = useActiveBranch();
  // Named only when the shop has more than one branch.
  const branchName = multiple
    ? (branches.find((branch) => branch.id === cart.branchId)?.name ?? null)
    : null;

  const form = useForm<ICheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: noteDefaults,
  });

  const mutation = useAppMutation(
    (values: ICheckoutFormInput) =>
      cart.branchId && cart.clientId
        ? transactionServices.checkout(cart.branchId, cart.lines, values.note, cart.clientId)
        : Promise.reject(new Error("Pick a branch to sell from")),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      successMessage: "Sale saved. Stock updated.",
      // Queued: nothing reached the owner's stock yet, so it must not say it did.
      queuedMessage: "Saved on this device. Waiting to sync.",
      onSuccess: () => {
        cart.clear();
        form.reset(noteDefaults);
        resetSearch(transactionPickTableKey);
        closeModal();
      },
      // A refused save (usually another sale took the stock) keeps the draft and refreshes
      // the available numbers, so the seller sees what is really left.
      onError: () => void queryClient.invalidateQueries({ queryKey: [inventoryListKey] }),
    },
  );

  return {
    open: modal.visible,
    cart,
    branchName,
    form,
    mutation,
    onSubmit: (values: ICheckoutFormInput) => {
      // Already sending: a second tap must not start a second save.
      if (!mutation.isPending) mutation.mutate(values);
    },
    // Closing keeps the draft, the note and any error; Back returns to the list as it was.
    onOpenChange: (open: boolean) => {
      if (!open) closeModal();
    },
  };
};

// The owner cancels from the sale's page; the stock goes back in the database.
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
        : Promise.reject(new Error("No sale selected")),
    {
      silentError: true,
      invalidate: stockQueryKeys,
      successMessage: "Sale cancelled. Stock restored.",
      queuedMessage: "Cancellation saved on this device. Waiting to sync.",
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
