import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  categoryOptionsKey,
  inventoryItemKey,
  inventoryListKey,
} from "../../../keys/query.keys";
import { itemFormModalKey } from "../../../keys/modal.keys";
import {
  emptyItemRequest,
  itemSchema,
  type IItemRequest,
} from "../../../models/data/inventory/inventory.request";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import inventoryServices from "../../../services/data/inventory.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type ISaveItem = { id?: string; values: IItemRequest };

// Category counts include every item, so item writes refresh them too.
const affectedKeys = [inventoryListKey, inventoryItemKey, categoryOptionsKey];

const toRequest = (item: IInventoryItem): IItemRequest => ({
  sku: item.sku,
  name: item.name,
  category_id: item.category_id ?? "",
  brand: item.brand ?? "",
  part_number: item.part_number ?? "",
  fitment: item.fitment ?? "",
  unit: item.unit,
  reorder_level: String(item.reorder_level),
  selling_price: item.selling_price === null ? "" : String(item.selling_price),
  location: item.location ?? "",
  opening_quantity: "",
});

export const useItemFormModal = () => {
  const { openModal } = useModal<IInventoryItem>(itemFormModalKey);

  return {
    openCreate: () => openModal(),
    openEdit: (item: IInventoryItem) => openModal(item),
  };
};

// The modal's data is the item being edited; without it the form creates one.
export const useItemForm = () => {
  const { modal, openModal, closeModal } = useModal<IInventoryItem>(itemFormModalKey);
  const { shopId } = useActiveShop();
  const editing = modal.data;

  const form = useForm<IItemRequest>({
    resolver: zodResolver(itemSchema),
    defaultValues: emptyItemRequest,
  });

  const mutation = useAppMutation<ISaveItem>({
    mutationFn: ({ id, values }) =>
      id ? inventoryServices.update(id, values) : inventoryServices.create(shopId, values),
    successMessage: ({ id }) => (id ? "Item updated" : "Item added"),
    invalidates: affectedKeys,
    onSuccess: () => closeModal(),
  });

  const { reset } = form;
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    if (!modal.visible) return;
    reset(editing ? toRequest(editing) : emptyItemRequest);
    resetMutation();
  }, [modal.visible, editing, reset, resetMutation]);

  const onSubmit = (values: IItemRequest) =>
    mutation.mutate({ id: editing?.id, values });

  return {
    form,
    onSubmit,
    open: modal.visible,
    isEditing: Boolean(editing),
    onOpenChange: (open: boolean) => (open ? openModal(editing) : closeModal()),
    errorText: mutation.errorText,
    isPending: mutation.isPending,
  };
};

// Archived items leave the catalog and can't take stock until restored.
export const useItemArchive = () => {
  const confirm = useConfirm();

  const mutation = useAppMutation<{ id: string; archived: boolean }>({
    mutationFn: ({ id, archived }) => inventoryServices.setArchived(id, archived),
    successMessage: ({ archived }) => (archived ? "Item archived" : "Item restored"),
    invalidates: affectedKeys,
    toastErrors: true,
  });

  // The confirm dialog awaits this; the mutation's own toast reports a failure.
  const run = (id: string, archived: boolean) =>
    mutation.mutateAsync({ id, archived }).catch(() => undefined);

  return {
    archive: (item: IInventoryItem) =>
      confirm({
        kind: "confirm",
        title: "Archive item?",
        itemName: item.name,
        message: "It leaves the inventory list and can't be sold or restocked until you restore it.",
        okText: "Archive",
        onConfirm: () => run(item.id, true),
      }),
    restore: (item: IInventoryItem) => run(item.id, false),
    isPending: mutation.isPending,
  };
};
