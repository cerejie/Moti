import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { brandListKey, inventoryListKey } from "../../../keys/query.keys";
import { brandFormModalKey } from "../../../keys/modal.keys";
import {
  brandFormSchema,
  type IBrandFormInput,
} from "../../../models/data/brand/brand.request";
import type { IBrand } from "../../../models/data/brand/brand.response";
import brandServices from "../../../services/data/brand.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";

const brandInvalidations = [[brandListKey], [inventoryListKey]] as const;

export const useBrandForm = () => {
  const { modal, closeModal } = useModal<IBrand>(brandFormModalKey);
  const brand = modal.data;

  const form = useForm<IBrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: brand?.name ?? "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ name: brand?.name ?? "" });
  }, [modal.visible, brand, reset]);

  const mutation = useAppMutation(
    (values: IBrandFormInput) =>
      brand ? brandServices.update(brand.id, values) : brandServices.create(values),
    {
      silentError: true,
      invalidate: brandInvalidations,
      successMessage: brand ? "Brand renamed" : "Brand added",
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    isEdit: Boolean(brand),
    form,
    mutation,
    onSubmit: (values: IBrandFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

export const useBrandDelete = () => {
  const confirm = useConfirm();
  const mutation = useAppMutation(brandServices.remove, {
    invalidate: brandInvalidations,
    successMessage: "Brand deleted",
  });

  return (brand: IBrand) =>
    confirm({
      kind: "delete",
      title: `Delete ${brand.name}?`,
      message: "Items of this brand stay in stock and lose their brand.",
      itemName: brand.name,
      okText: "Delete",
      onConfirm: () => mutation.mutateAsync(brand),
    });
};
