import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { shopListKey, userListKey } from "../../../keys/query.keys";
import { temporaryPasswordModalKey, userFormModalKey } from "../../../keys/modal.keys";
import type { IMutationResult } from "../../../models/common/write.model";
import { userSchema, type IUserRequest } from "../../../models/data/user/user.request";
import type {
  IStaffUser,
  ITemporaryPassword,
} from "../../../models/data/user/user.response";
import userServices from "../../../services/data/user.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { usePermissions } from "../auth/auth.session.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type ISaveUser = { user?: IStaffUser; values: IUserRequest };

// A new account answers with its one-time password; an edit is a queued-capable write.
type ISaveResult = IMutationResult & { created?: ITemporaryPassword };

type IResetResult = IMutationResult & { password: ITemporaryPassword };

// The Shops list counts each shop's staff.
const userKeys = [userListKey, shopListKey];

const toRequest = (user: IStaffUser): IUserRequest => ({
  full_name: user.full_name,
  email: user.email ?? "",
  role: user.role === "owner" ? "owner" : "employee",
  shop_id: user.shop_id ?? "",
});

export const useUserFormModal = () => {
  const { openModal } = useModal<IStaffUser>(userFormModalKey);

  return {
    openCreate: () => openModal(),
    openEdit: (user: IStaffUser) => openModal(user),
  };
};

// The modal's data is the user being edited; without it the form creates an account.
export const useUserForm = () => {
  const { modal, openModal, closeModal } = useModal<IStaffUser>(userFormModalKey);
  const { openModal: showPassword } = useModal<ITemporaryPassword>(temporaryPasswordModalKey);
  const { isSuperadmin } = usePermissions();
  const { shopId } = useActiveShop();
  const editing = modal.data;

  const form = useForm<IUserRequest>({
    resolver: zodResolver(userSchema),
    defaultValues: { full_name: "", email: "", role: "employee", shop_id: "" },
  });

  const mutation = useAppMutation<ISaveUser, ISaveResult>({
    mutationFn: async ({ user, values }) =>
      user
        ? userServices.update(user.id, values.full_name, user.is_active)
        : { queued: false, created: await userServices.create(values) },
    successMessage: ({ user }) => (user ? "User updated" : "Account created"),
    invalidates: userKeys,
    onSuccess: ({ created }) => {
      closeModal();
      if (created) showPassword(created);
    },
  });

  const { reset } = form;
  const { reset: resetMutation } = mutation;

  // An owner's new staff join the owner's shop; the superadmin starts from the picked one.
  useEffect(() => {
    if (!modal.visible) return;
    reset(
      editing
        ? toRequest(editing)
        : { full_name: "", email: "", role: "employee", shop_id: shopId ?? "" },
    );
    resetMutation();
  }, [modal.visible, editing, shopId, reset, resetMutation]);

  const onSubmit = (values: IUserRequest) => mutation.mutate({ user: editing, values });

  return {
    form,
    onSubmit,
    open: modal.visible,
    isEditing: Boolean(editing),
    isSuperadmin,
    onOpenChange: (open: boolean) => (open ? openModal(editing) : closeModal()),
    errorText: mutation.errorText,
    isPending: mutation.isPending,
  };
};

// A deactivated user fails every tenant policy on their next request.
export const useUserActivation = () => {
  const confirm = useConfirm();

  const mutation = useAppMutation<{ user: IStaffUser; isActive: boolean }>({
    mutationFn: ({ user, isActive }) =>
      userServices.update(user.id, user.full_name, isActive),
    successMessage: ({ isActive }) => (isActive ? "User reactivated" : "User deactivated"),
    invalidates: userKeys,
    toastErrors: true,
  });

  // The confirm dialog awaits this; the mutation's own toast reports a failure.
  const run = (user: IStaffUser, isActive: boolean) =>
    mutation.mutateAsync({ user, isActive }).catch(() => undefined);

  return {
    deactivate: (user: IStaffUser) =>
      confirm({
        kind: "confirm",
        title: "Deactivate user?",
        itemName: user.full_name,
        message: "They lose access right away. Their past sales stay in the history.",
        okText: "Deactivate",
        onConfirm: () => run(user, false),
      }),
    reactivate: (user: IStaffUser) => run(user, true),
  };
};

export const useResetPassword = () => {
  const confirm = useConfirm();
  const { openModal: showPassword } = useModal<ITemporaryPassword>(temporaryPasswordModalKey);

  const mutation = useAppMutation<IStaffUser, IResetResult>({
    mutationFn: async (user) => ({
      queued: false,
      password: await userServices.resetPassword(user.id),
    }),
    successMessage: "Password reset",
    invalidates: [],
    toastErrors: true,
    onSuccess: ({ password }) => showPassword(password),
  });

  return (user: IStaffUser) =>
    confirm({
      kind: "confirm",
      title: "Reset password?",
      itemName: user.full_name,
      message: "Their current password stops working. You'll get a temporary one to pass on.",
      okText: "Reset password",
      onConfirm: () => mutation.mutateAsync(user).then(() => undefined, () => undefined),
    });
};

// The password lives only in the modal's data, and is dropped when it closes.
export const useTemporaryPassword = () => {
  const { modal, removeModal } = useModal<ITemporaryPassword>(temporaryPasswordModalKey);

  const copy = (password: string) =>
    navigator.clipboard.writeText(password).then(
      () => toast.success("Password copied"),
      () => toast.error("Couldn't copy. Select the password and copy it instead."),
    );

  return { data: modal.data, copy, clear: removeModal };
};
