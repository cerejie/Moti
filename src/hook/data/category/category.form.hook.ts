import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  analyzerRankingKey,
  analyzerReorderKey,
  brandOptionsKey,
  categoryOptionsKey,
  dashboardAlertsKey,
  inventoryItemKey,
  inventoryListKey,
} from "../../../keys/query.keys";
import { categoryFormModalKey } from "../../../keys/modal.keys";
import {
  categorySchema,
  type ICategoryRequest,
} from "../../../models/data/category/category.request";
import type { ICategory } from "../../../models/data/category/category.response";
import categoryServices from "../../../services/data/category.services";
import { newWriteId } from "../../../utils/write.utils";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { useActiveShop } from "../shop/shop.list.hook";

// Editing carries the category; creating may carry a callback that receives the
// new id, e.g. the item form selecting the category it just added.
type ICategoryModal = {
  category?: ICategory;
  onCreated?: (id: string) => void;
};

type ISaveCategory = { id?: string; newId?: string; values: ICategoryRequest };

// Item rows, analyzer rows and alerts show the category's name; brands list the
// categories that carry them.
const affectedKeys = [
  categoryOptionsKey,
  brandOptionsKey,
  inventoryListKey,
  inventoryItemKey,
  analyzerRankingKey,
  analyzerReorderKey,
  dashboardAlertsKey,
];

const emptyCategory: ICategoryRequest = { name: "", code: "", brand_ids: [] };

export const useCategoryFormModal = () => {
  const { openModal } = useModal<ICategoryModal>(categoryFormModalKey);

  return {
    openCreate: (onCreated?: (id: string) => void) => openModal({ onCreated }),
    openEdit: (category: ICategory) => openModal({ category }),
  };
};

export const useCategoryForm = () => {
  const { modal, openModal, closeModal } = useModal<ICategoryModal>(categoryFormModalKey);
  const { shopId } = useActiveShop();
  const editing = modal.data?.category;
  const onCreated = modal.data?.onCreated;

  const form = useForm<ICategoryRequest>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyCategory,
  });

  const mutation = useAppMutation<ISaveCategory>({
    mutationFn: ({ id, newId, values }) =>
      id
        ? categoryServices.update(id, values)
        : categoryServices.create(newId ?? newWriteId(), shopId, values),
    successMessage: ({ id }) => (id ? "Category saved" : "Category added"),
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
        ? { name: editing.name, code: editing.code, brand_ids: editing.brand_ids }
        : emptyCategory,
    );
    resetMutation();
  }, [modal.visible, editing, reset, resetMutation]);

  const onSubmit = (values: ICategoryRequest) =>
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

export const useDeleteCategory = () => {
  const confirm = useConfirm();

  const mutation = useAppMutation<string>({
    mutationFn: categoryServices.remove,
    successMessage: "Category deleted",
    invalidates: [categoryOptionsKey, brandOptionsKey],
    toastErrors: true,
  });

  // The confirm dialog awaits this; the mutation's own toast reports a failure.
  return (category: ICategory) =>
    confirm({
      kind: "delete",
      title: "Delete category?",
      itemName: category.name,
      message: "Items must be moved to another category or archived first.",
      okText: "Delete",
      onConfirm: () => mutation.mutateAsync(category.id).catch(() => undefined),
    });
};
