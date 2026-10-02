import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { categoryListKey, inventoryListKey } from "../../../keys/query.keys";
import { categoryFormModalKey } from "../../../keys/modal.keys";
import {
  categoryFormSchema,
  type ICategoryFormInput,
} from "../../../models/data/category/category.request";
import type { ICategory } from "../../../models/data/category/category.response";
import categoryServices from "../../../services/data/category.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";

const categoryInvalidations = [[categoryListKey], [inventoryListKey]] as const;

export const useCategoryForm = () => {
  const { modal, closeModal } = useModal<ICategory>(categoryFormModalKey);
  const category = modal.data;

  const form = useForm<ICategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: category?.name ?? "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ name: category?.name ?? "" });
  }, [modal.visible, category, reset]);

  const mutation = useAppMutation(
    (values: ICategoryFormInput) =>
      category ? categoryServices.update(category.id, values) : categoryServices.create(values),
    {
      silentError: true,
      invalidate: categoryInvalidations,
      successMessage: category ? "Category renamed" : "Category added",
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    isEdit: Boolean(category),
    form,
    mutation,
    onSubmit: (values: ICategoryFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

export const useCategoryDelete = () => {
  const confirm = useConfirm();
  const mutation = useAppMutation(categoryServices.remove, {
    invalidate: categoryInvalidations,
    successMessage: "Category deleted",
  });

  return (category: ICategory) =>
    confirm({
      kind: "delete",
      title: `Delete ${category.name}?`,
      message: "Items in this category stay in stock and become uncategorised.",
      itemName: category.name,
      okText: "Delete",
      onConfirm: () => mutation.mutateAsync(category),
    });
};
