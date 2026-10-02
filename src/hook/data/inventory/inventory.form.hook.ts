import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { brandListKey, categoryListKey, stockQueryKeys } from "../../../keys/query.keys";
import { itemFormModalKey } from "../../../keys/modal.keys";
import {
  itemFormSchema,
  type IItemFormInput,
} from "../../../models/data/inventory/inventory.request";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import brandServices from "../../../services/data/brand.services";
import categoryServices from "../../../services/data/category.services";
import inventoryServices from "../../../services/data/inventory.services";
import { resolveByName } from "../../../utils/lookup.utils";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useBrandOptions } from "../brand/brand.list.hook";
import { useCategoryOptions } from "../category/category.list.hook";

const toFormValues = (item?: IInventoryItem): IItemFormInput => ({
  sku: item?.sku ?? "",
  name: item?.name ?? "",
  category: item?.category?.name ?? "",
  brand: item?.brand?.name ?? "",
  part_number: item?.part_number ?? "",
  unit: item?.unit ?? "pc",
  reorder_level: String(item?.reorder_level ?? 5),
  selling_price: item?.selling_price == null ? "" : String(item.selling_price),
  location: item?.location ?? "",
  opening_stock: "0",
});

const isNew = (records: readonly { id: string }[], id: string | null) =>
  id !== null && !records.some((record) => record.id === id);

const itemInvalidations =[...stockQueryKeys, [categoryListKey], [brandListKey]] as const;

// modal.data present = edit that item; absent = add a new one.
export const useItemForm = () => {
  const { modal, closeModal } = useModal<IInventoryItem>(itemFormModalKey);
  const item = modal.data;
  const { options: categoryOptions, categories } = useCategoryOptions();
  const { options: brandOptions, brands } = useBrandOptions();
  const queryClient = useQueryClient();
  const refresh = (key: string) => queryClient.invalidateQueries({ queryKey: [key] });

  const form = useForm<IItemFormInput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: toFormValues(item),
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset(toFormValues(item));
  }, [modal.visible, item, reset]);

  // A typed category or brand that does not exist yet is created first, so the
  // owner never has to visit the Masterfile to add one.
  const save = async ({ category, brand, ...values }: IItemFormInput) => {
    const category_id = await resolveByName(categories, category, (name, id) =>
      categoryServices.create({ name }, id),
    );
    const brand_id = await resolveByName(brands, brand, (name, id) =>
      brandServices.create({ name }, id),
    );
    // Refresh now, so a retry after a failed item save reuses the new record.
    if (isNew(categories, category_id)) await refresh(categoryListKey);
    if (isNew(brands, brand_id)) await refresh(brandListKey);

    const resolved = { ...values, category_id, brand_id };
    return item ? inventoryServices.update(item.id, resolved) : inventoryServices.create(resolved);
  };

  const mutation = useAppMutation(save, {
    silentError: true,
    invalidate: itemInvalidations,
    successMessage: item ? "Item updated" : "Item added",
    onSuccess: closeModal,
  });

  return {
    open: modal.visible,
    isEdit: Boolean(item),
    form,
    mutation,
    categoryOptions,
    brandOptions,
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
