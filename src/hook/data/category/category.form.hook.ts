import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  categoryOptionsKey,
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
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type ISaveCategory = { id?: string; values: ICategoryRequest };

// Item rows show their category's name, so a rename refreshes them too.
const affectedKeys = [categoryOptionsKey, inventoryListKey, inventoryItemKey];

export const useCategoryFormModal = () => {
  const { openModal } = useModal<ICategory>(categoryFormModalKey);

  return {
    openCreate: () => openModal(),
    openRename: (category: ICategory) => openModal(category),
  };
};

// The modal's data is the category being renamed; without it the form creates one.
export const useCategoryForm = () => {
  const { modal, openModal, closeModal } = useModal<ICategory>(categoryFormModalKey);
  const { shopId } = useActiveShop();
  const editing = modal.data;

  const form = useForm<ICategoryRequest>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  const mutation = useAppMutation<ISaveCategory>({
    mutationFn: ({ id, values }) =>
      id ? categoryServices.rename(id, values) : categoryServices.create(shopId, values),
    successMessage: ({ id }) => (id ? "Category renamed" : "Category added"),
    invalidates: affectedKeys,
    onSuccess: () => closeModal(),
  });

  const { reset } = form;
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    if (!modal.visible) return;
    reset({ name: editing?.name ?? "" });
    resetMutation();
  }, [modal.visible, editing, reset, resetMutation]);

  const onSubmit = (values: ICategoryRequest) =>
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

export const useDeleteCategory = () => {
  const confirm = useConfirm();

  const mutation = useAppMutation<string>({
    mutationFn: categoryServices.remove,
    successMessage: "Category deleted",
    invalidates: [categoryOptionsKey],
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
