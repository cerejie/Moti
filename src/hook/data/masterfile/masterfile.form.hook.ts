import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  masterfileKindLabels,
  type MasterfileKind,
} from "../../../enums/masterfile.enum";
import {
  analyzerRankingKey,
  analyzerReorderKey,
  analyzerSummaryKey,
  dashboardAlertsKey,
  inventoryItemKey,
  inventoryListKey,
  masterfileOptionsKey,
  movementListKey,
  scopedKey,
} from "../../../keys/query.keys";
import { masterfileFormModalKey } from "../../../keys/modal.keys";
import {
  masterfileSchemas,
  type IMasterfileRequest,
} from "../../../models/data/masterfile/masterfile.request";
import type { IMasterfileEntry } from "../../../models/data/masterfile/masterfile.response";
import masterfileServices from "../../../services/data/masterfile.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type ISaveEntry = { id?: string; values: IMasterfileRequest };

// Item, movement, alert and analyzer rows all show the unit or location name.
const affectedKeys = [
  masterfileOptionsKey,
  inventoryListKey,
  inventoryItemKey,
  movementListKey,
  dashboardAlertsKey,
  analyzerRankingKey,
  analyzerSummaryKey,
  analyzerReorderKey,
];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const useMasterfileFormModal = (kind: MasterfileKind) => {
  const { openModal } = useModal<IMasterfileEntry>(scopedKey(masterfileFormModalKey, kind));

  return {
    openCreate: () => openModal(),
    openRename: (entry: IMasterfileEntry) => openModal(entry),
  };
};

// The modal's data is the entry being renamed; without it the form creates one.
export const useMasterfileForm = (kind: MasterfileKind) => {
  const { modal, openModal, closeModal } = useModal<IMasterfileEntry>(
    scopedKey(masterfileFormModalKey, kind),
  );
  const { shopId } = useActiveShop();
  const editing = modal.data;
  const label = capitalize(masterfileKindLabels[kind].one);

  const form = useForm<IMasterfileRequest>({
    resolver: zodResolver(masterfileSchemas[kind]),
    defaultValues: { name: "" },
  });

  const mutation = useAppMutation<ISaveEntry>({
    mutationFn: ({ id, values }) =>
      id
        ? masterfileServices.rename(kind, id, values)
        : masterfileServices.create(kind, shopId, values),
    successMessage: ({ id }) => (id ? `${label} renamed` : `${label} added`),
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

  const onSubmit = (values: IMasterfileRequest) =>
    mutation.mutate({ id: editing?.id, values });

  return {
    form,
    onSubmit,
    label,
    open: modal.visible,
    isEditing: Boolean(editing),
    onOpenChange: (open: boolean) => (open ? openModal(editing) : closeModal()),
    errorText: mutation.errorText,
    isPending: mutation.isPending,
  };
};

export const useDeleteMasterfileEntry = (kind: MasterfileKind) => {
  const confirm = useConfirm();
  const { one } = masterfileKindLabels[kind];

  const mutation = useAppMutation<string>({
    mutationFn: (id) => masterfileServices.remove(kind, id),
    successMessage: `${capitalize(one)} deleted`,
    invalidates: [masterfileOptionsKey],
    toastErrors: true,
  });

  // The confirm dialog awaits this; the mutation's own toast reports a failure.
  return (entry: IMasterfileEntry) =>
    confirm({
      kind: "delete",
      title: `Delete ${one}?`,
      itemName: entry.name,
      message: `Items must use another ${one} or be archived first.`,
      okText: "Delete",
      onConfirm: () => mutation.mutateAsync(entry.id).catch(() => undefined),
    });
};
