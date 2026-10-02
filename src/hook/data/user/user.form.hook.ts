import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { manageableRolesOf, type ApprovalStatus } from "../../../enums/role.enum";
import { userListKey } from "../../../keys/query.keys";
import { userCreateModalKey, userPasswordModalKey } from "../../../keys/modal.keys";
import {
  createUserSchema,
  setPasswordSchema,
  type ICreateUserInput,
  type ISetPasswordInput,
} from "../../../models/data/user/user.request";
import type { IUser } from "../../../models/data/user/user.response";
import userServices from "../../../services/data/user.services";
import { selectRole, useAccountStore } from "../../../store/data/account/account.store";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useAppMutation } from "../../common/mutation.hook";

const userInvalidations = [[userListKey]] as const;

export const useCreatableRoles = () => manageableRolesOf(useAccountStore(selectRole));

export const useUserCreateForm = () => {
  const { modal, closeModal } = useModal(userCreateModalKey);
  const roles = useCreatableRoles();
  // An owner can only add employees, so that is the default for everyone.
  const defaultRole = roles.includes("employee") ? "employee" : roles[0] ?? "employee";

  const form = useForm<ICreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { full_name: "", email: "", role: defaultRole, password: "", confirm_password: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) {
      reset({ full_name: "", email: "", role: defaultRole, password: "", confirm_password: "" });
    }
  }, [modal.visible, defaultRole, reset]);

  const mutation = useAppMutation(userServices.create, {
    silentError: true,
    invalidate: userInvalidations,
    successMessage: "Account created — share the password with them",
    onSuccess: closeModal,
  });

  return {
    open: modal.visible,
    roles,
    form,
    mutation,
    onSubmit: (values: ICreateUserInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

export const useUserPasswordForm = () => {
  const { modal, closeModal } = useModal<IUser>(userPasswordModalKey);
  const user = modal.data;

  const form = useForm<ISetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (modal.visible) reset({ password: "", confirm_password: "" });
  }, [modal.visible, reset]);

  const mutation = useAppMutation(
    (values: ISetPasswordInput) =>
      user ? userServices.setPassword(user, values) : Promise.reject(new Error("No user selected")),
    {
      silentError: true,
      invalidate: userInvalidations,
      successMessage: "Password changed",
      onSuccess: closeModal,
    },
  );

  return {
    open: modal.visible,
    user,
    form,
    mutation,
    onSubmit: (values: ISetPasswordInput) => mutation.mutate(values),
    onOpenChange: (open: boolean) => {
      if (!open) {
        mutation.reset();
        closeModal();
      }
    },
  };
};

const statusMessages: Record<ApprovalStatus, string> = {
  pending: "Account set to pending",
  approved: "Account is active",
  rejected: "Account disabled",
};

export const useUserActions = () => {
  const confirm = useConfirm();

  const statusMutation = useAppMutation(
    ({ user, status }: { user: IUser; status: ApprovalStatus }) =>
      userServices.setStatus(user, status),
    { invalidate: userInvalidations },
  );
  const resetMutation = useAppMutation(
    ({ user, approve }: { user: IUser; approve: boolean }) => userServices.decideReset(user, approve),
    { invalidate: userInvalidations },
  );
  const removeMutation = useAppMutation(userServices.remove, {
    invalidate: userInvalidations,
    successMessage: "Account deleted",
  });

  const setStatus = (user: IUser, status: ApprovalStatus) =>
    statusMutation.mutate(
      { user, status },
      { onSuccess: () => toast.success(statusMessages[status]) },
    );

  return {
    approve: (user: IUser) => setStatus(user, "approved"),
    enable: (user: IUser) => setStatus(user, "approved"),
    disable: (user: IUser) =>
      confirm({
        title: `Disable ${user.full_name}?`,
        message: "They are signed out on their next action and cannot sign in until you turn the account back on.",
        okText: "Disable",
        onConfirm: () => statusMutation.mutateAsync({ user, status: "rejected" }),
      }),
    reject: (user: IUser) => setStatus(user, "rejected"),
    decideReset: (user: IUser, approve: boolean) =>
      resetMutation.mutate(
        { user, approve },
        {
          onSuccess: () =>
            toast.success(approve ? "New password approved" : "Password reset declined"),
        },
      ),
    remove: (user: IUser) =>
      confirm({
        kind: "delete",
        title: `Delete ${user.full_name}?`,
        message: "The account is removed for good. Stock history keeps their name.",
        itemName: user.email,
        okText: "Delete",
        onConfirm: () => removeMutation.mutateAsync(user),
      }),
  };
};
