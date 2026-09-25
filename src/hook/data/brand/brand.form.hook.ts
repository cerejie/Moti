import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  brandOptionsKey,
  categoryOptionsKey,
  inventoryItemKey,
  inventoryListKey,
} from "../../../keys/query.keys";
import { brandFormModalKey } from "../../../keys/modal.keys";
import { brandSchema, type IBrandRequest } from "../../../models/data/brand/brand.request";
import type { IBrand } from "../../../models/data/brand/brand.response";
import brandServices from "../../../services/data/brand.services";
import { newWriteId } from "../../../utils/write.utils";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { useActiveShop } from "../shop/shop.list.hook";

// Editing carries the brand; creating may preset its categories and carry a
// callback that receives the new id, e.g. the item form selecting it.
type IBrandModal = {
  brand?: IBrand;
  categoryIds?: string[];
  onCreated?: (id: string) => void;
};

type ISaveBrand = { id?: string; newId?: string; values: IBrandRequest };

// Item rows show the brand's name; categories list the brands they carry.
const affectedKeys = [brandOptionsKey, categoryOptionsKey, inventoryListKey, inventoryItemKey];

export const useBrandFormModal = () => {
  const { openModal } = useModal<IBrandModal>(brandFormModalKey);

  return {
    openCreate: (categoryIds?: string[], onCreated?: (id: string) => void) =>
      openModal({ categoryIds, onCreated }),
    openEdit: (brand: IBrand) => openModal({ brand }),
  };
};

export const useBrandForm = () => {
  const { modal, openModal, closeModal } = useModal<IBrandModal>(brandFormModalKey);
  const { shopId } = useActiveShop();
  const editing = modal.data?.brand;
  const presetCategoryIds = modal.data?.categoryIds;
  const onCreated = modal.data?.onCreated;

  const form = useForm<IBrandRequest>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", code: "", category_ids: [] },
  });

  const mutation = useAppMutation<ISaveBrand>({
    mutationFn: ({ id, newId, values }) =>
      id
        ? brandServices.update(id, values)
        : brandServices.create(newId ?? newWriteId(), shopId, values),
    successMessage: ({ id }) => (id ? "Brand saved" : "Brand added"),
    invalidates: affectedKeys,
    onSuccess: (_result, { newId }) => {
      if (newId) onCreated?.(newId);
      closeModal();
    },
  });

  const { reset } = form;
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    if (!modal.visible) return;
    reset(
      editing
        ? { name: editing.name, code: editing.code, category_ids: editing.category_ids }
        : { name: "", code: "", category_ids: presetCategoryIds ?? [] },
    );
    resetMutation();
  }, [modal.visible, editing, presetCategoryIds, reset, resetMutation]);

  const onSubmit = (values: IBrandRequest) =>
    mutation.mutate(editing ? { id: editing.id, values } : { newId: newWriteId(), values });

  return {
    form,
    onSubmit,
    open: modal.visible,
    isEditing: Boolean(editing),
    onOpenChange: (open: boolean) => (open ? openModal(modal.data) : closeModal()),
    errorText: mutation.errorText,
    isPending: mutation.isPending,
  };
};

export const useDeleteBrand = () => {
  const confirm = useConfirm();

  const mutation = useAppMutation<string>({
    mutationFn: brandServices.remove,
    successMessage: "Brand deleted",
    invalidates: [brandOptionsKey, categoryOptionsKey],
    toastErrors: true,
  });

  // The confirm dialog awaits this; the mutation's own toast reports a failure.
  return (brand: IBrand) =>
    confirm({
      kind: "delete",
      title: "Delete brand?",
      itemName: brand.name,
      message: "Items must be moved to another brand or archived first.",
      okText: "Delete",
      onConfirm: () => mutation.mutateAsync(brand.id).catch(() => undefined),
    });
};
