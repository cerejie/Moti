import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { categoryListKey, stockQueryKeys } from "../../../keys/query.keys";
import { itemFormModalKey } from "../../../keys/modal.keys";
import {
  itemFormSchema,
  type IItemFormInput,
} from "../../../models/data/inventory/inventory.request";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import inventoryServices from "../../../services/data/inventory.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";

const toFormValues = (item?: IInventoryItem): IItemFormInput => ({
  sku: item?.sku ?? "",
  name: item?.name ?? "",
  category_id: item?.category_id ?? "",
  brand: item?.brand ?? "",
  part_number: item?.part_number ?? "",
  unit: item?.unit ?? "pc",
  reorder_level: String(item?.reorder_level ?? 5),
  selling_price: item?.selling_price == null ? "" : String(item.selling_price),
  location: item?.location ?? "",
  opening_stock: "0",
});

const itemInvalidations = [...stockQueryKeys, [categoryListKey]] as const;

// modal.data present = edit that item; absent = add a new one.
export const useItemForm = () => {
  const { modal, closeModal } = useModal<IInventoryItem>(itemFormModalKey);
  const item = modal.data;

  const form = useForm<IItemFormInput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: toFormValues(item),
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset(toFormValues(item));
  }, [modal.visible, item, reset]);

  const mutation = useAppMutation(
    (values: IItemFormInput) =>
      item ? inventoryServices.update(item.id, values) : inventoryServices.create(values),
    {
      silentError: true,
      invalidate: itemInvalidations,
      successMessage: item ? "Item updated" : "Item added",
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    isEdit: Boolean(item),
    form,
    mutation,
    onSubmit: (values: IItemFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

export const useItemArchive = () => {
  const confirm = useConfirm();
  const mutation = useAppMutation(
    ({ item, archived }: { item: IInventoryItem; archived: boolean }) =>
      inventoryServices.setArchived(item, archived),
    { invalidate: itemInvalidations },
  );

  return {
    archive: (item: IInventoryItem) =>
      confirm({
        title: `Archive ${item.name}?`,
        message:
          "It disappears from the stock list and alerts. Its history is kept and you can restore it from the Archived tab.",
        okText: "Archive",
        onConfirm: () => mutation.mutateAsync({ item, archived: true }),
      }),
    restore: (item: IInventoryItem) => mutation.mutate({ item, archived: false }),
  };
};
