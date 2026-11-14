import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { branchFormModalKey } from "../../../keys/modal.keys";
import { branchListKey } from "../../../keys/query.keys";
import {
  branchFormSchema,
  type IBranchFormInput,
} from "../../../models/data/branch/branch.request";
import type { IBranch } from "../../../models/data/branch/branch.response";
import branchServices from "../../../services/data/branch.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useBranchList } from "./branch.list.hook";

const branchInvalidations = [[branchListKey]] as const;

export const useBranchForm = () => {
  const { modal, closeModal } = useModal<IBranch>(branchFormModalKey);
  const { branches } = useBranchList();
  const branch = modal.data;
  const nextSort = Math.max(0, ...branches.map((item) => item.sort)) + 1;

  const form = useForm<IBranchFormInput>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: { name: branch?.name ?? "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ name: branch?.name ?? "" });
  }, [modal.visible, branch, reset]);

  const mutation = useAppMutation(
    (values: IBranchFormInput) =>
      branch ? branchServices.rename(branch.id, values) : branchServices.create(values, nextSort),
    {
      silentError: true,
      invalidate: branchInvalidations,
      successMessage: branch ? "Branch renamed" : "Branch added",
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    isEdit: Boolean(branch),
    form,
    mutation,
    onSubmit: (values: IBranchFormInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

export const useBranchArchive = () => {
  const confirm = useConfirm();
  const archive = useAppMutation(branchServices.archive, {
    invalidate: branchInvalidations,
    successMessage: "Branch archived",
  });
  const restore = useAppMutation(branchServices.restore, {
    invalidate: branchInvalidations,
    successMessage: "Branch restored",
  });

  return {
    archive: (branch: IBranch) =>
      confirm({
        kind: "delete",
        title: `Archive ${branch.name}?`,
        message: "It leaves the branch switcher. Its sales and stock history are kept.",
        itemName: branch.name,
        okText: "Archive",
        onConfirm: () => archive.mutateAsync(branch),
      }),
    restore: (branch: IBranch) =>
      confirm({
        title: `Restore ${branch.name}?`,
        message: "It comes back to the branch switcher.",
        okText: "Restore",
        onConfirm: () => restore.mutateAsync(branch),
      }),
  };
};
