import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  transactionLinesKey,
  transactionListKey,
} from "../../../keys/query.keys";
import {
  cartSheetModalKey,
  transactionDetailModalKey,
  transactionSuccessModalKey,
  voidTransactionModalKey,
} from "../../../keys/modal.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  voidTransactionSchema,
  type ICartLine,
  type IVoidTransactionRequest,
} from "../../../models/data/transaction/transaction.request";
import type {
  ICreateTransactionResult,
  ITransaction,
} from "../../../models/data/transaction/transaction.response";
import transactionServices from "../../../services/data/transaction.services";
import { useCartStore } from "../../../store/data/transaction/transaction.store";
import { formatTransactionNo } from "../../../utils/format.utils";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { usePermissions } from "../auth/auth.session.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type ICreateTransaction = { shopId: string; clientId: string; lines: ICartLine[] };

type IVoidTransaction = { transaction: ITransaction; values: IVoidTransactionRequest };

// What the success view says: the number, or that it waits to sync.
type ITransactionSuccess = { transactionNo: number | null; queued: boolean };

// Every screen a stock change shows up on, plus the transaction history.
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
  transactionListKey,
  transactionLinesKey,
];

// An unpriced line adds nothing to the total.
export const lineTotal = (line: ICartLine) => line.quantity * (line.unit_price ?? 0);

// The cart of the shop being worked in; another shop's cart reads as empty.
export const useCart = () => {
  const { shopId } = useActiveShop();
  const cart = useCartStore();
  const lines = cart.shopId === shopId ? cart.lines : [];

  return {
    lines,
    clientId: cart.clientId,
    units: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + lineTotal(line), 0),
    quantityOf: (itemId: string) =>
      lines.find((line) => line.item_id === itemId)?.quantity ?? 0,
    addItem: (item: IInventoryItem) => {
      if (!shopId) return;
      cart.addLine(shopId, {
        item_id: item.id,
        name: item.name,
        item_code: item.item_code,
        unit: item.unit,
        unit_price: item.selling_price,
        on_hand: item.on_hand,
      });
    },
    setQuantity: cart.setQuantity,
    removeLine: cart.removeLine,
    clear: cart.clear,
  };
};

export const useCartSheet = () => {
  const { modal, openModal, closeModal } = useModal(cartSheetModalKey);

  return {
    open: modal.visible,
    openSheet: () => openModal(),
    onOpenChange: (open: boolean) => (open ? openModal() : closeModal()),
    closeSheet: closeModal,
  };
};

export const useTransactionSuccess = () => {
  const { modal } = useModal<ITransactionSuccess>(transactionSuccessModalKey);
  const result = modal.data;

  if (!result || result.queued) {
    return {
      title: "Saved offline",
      message: "The transaction syncs when you're back online, and gets its number then.",
    };
  }

  return {
    title: "Transaction confirmed",
    message:
      result.transactionNo === null
        ? "The transaction is saved and its stock deducted."
        : `Transaction ${formatTransactionNo(result.transactionNo)} is saved and its stock deducted.`,
  };
};

// Confirm sends the whole cart as one write. Mounted by the desktop cart and
// the phone sheet; only one of them is on screen at a time.
export const useConfirmTransaction = () => {
  const { shopId } = useActiveShop();
  const { lines, clientId, clear } = useCart();
  const { closeSheet } = useCartSheet();
  const { openModal: openSuccess } = useModal<ITransactionSuccess>(transactionSuccessModalKey);

  const mutation = useAppMutation<ICreateTransaction, ICreateTransactionResult>({
    mutationFn: (variables) =>
      transactionServices.create(variables.shopId, variables.clientId, variables.lines),
    successMessage: "Transaction confirmed",
    invalidates: affectedKeys,
    onSuccess: (result) => {
      clear();
      closeSheet();
      openSuccess({ transactionNo: result.transactionNo, queued: result.queued });
    },
  });

  return {
    confirm: () => {
      if (shopId && lines.length > 0) mutation.mutate({ shopId, clientId, lines });
    },
    canConfirm: Boolean(shopId) && lines.length > 0,
    isPending: mutation.isPending,
    errorText: mutation.errorText,
  };
};

export const useTransactionDetail = () => {
  const { modal, openModal, closeModal } = useModal<ITransaction>(transactionDetailModalKey);
  const { voidTransaction } = usePermissions();
  const transaction = modal.data ?? null;

  return {
    open: modal.visible,
    transaction,
    openDetail: (row: ITransaction) => openModal(row),
    onOpenChange: (open: boolean) => (open ? openModal(transaction ?? undefined) : closeModal()),
    closeDetail: closeModal,
    canVoid: voidTransaction && transaction?.status === "confirmed",
  };
};

export const useVoidTransactionModal = () => {
  const { openModal } = useModal<ITransaction>(voidTransactionModalKey);

  return { openVoid: (transaction: ITransaction) => openModal(transaction) };
};

export const useVoidTransactionForm = () => {
  const { modal, openModal, closeModal } = useModal<ITransaction>(voidTransactionModalKey);
  const { closeDetail } = useTransactionDetail();
  const transaction = modal.data ?? null;

  const form = useForm<IVoidTransactionRequest>({
    resolver: zodResolver(voidTransactionSchema),
    defaultValues: { reason: "" },
  });

  const mutation = useAppMutation<IVoidTransaction>({
    mutationFn: (variables) => transactionServices.void(variables.transaction, variables.values),
    successMessage: ({ transaction: voided }) =>
      `Transaction ${formatTransactionNo(voided.transaction_no)} voided`,
    invalidates: affectedKeys,
    onSuccess: () => {
      closeModal();
      closeDetail();
    },
  });

  const { reset } = form;
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    if (!modal.visible) return;
    reset({ reason: "" });
    resetMutation();
  }, [modal.visible, reset, resetMutation]);

  return {
    form,
    onSubmit: (values: IVoidTransactionRequest) => {
      if (transaction) mutation.mutate({ transaction, values });
    },
    open: modal.visible,
    onOpenChange: (open: boolean) => (open ? openModal(transaction ?? undefined) : closeModal()),
    transaction,
    errorText: mutation.errorText,
    isPending: mutation.isPending,
  };
};
