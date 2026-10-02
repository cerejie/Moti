import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  changePasswordSchema,
  type IChangePasswordInput,
} from "../../../models/data/account/account.request";
import accountServices from "../../../services/data/account.services";
import { useAccountStore } from "../../../store/data/account/account.store";
import { useAppMutation } from "../../common/mutation.hook";

const emptyValues: IChangePasswordInput = {
  current_password: "",
  password: "",
  confirm_password: "",
};

// Table users change it through their RPC; the developer through Supabase Auth.
export const useChangePasswordForm = () => {
  const kind = useAccountStore((state) => state.kind);
  const developerEmail = useAccountStore((state) => state.developerEmail);

  const form = useForm<IChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: emptyValues,
  });

  const mutation = useAppMutation(
    (values: IChangePasswordInput) =>
      kind === "developer"
        ? accountServices.changeDeveloperPassword(developerEmail ?? "", values)
        : accountServices.changeOwnPassword(values),
    {
      silentError: true,
      successMessage: "Password changed",
      onSuccess: () => form.reset(emptyValues),
    },
  );

  return { form, mutation, onSubmit: (values: IChangePasswordInput) => mutation.mutate(values) };
};
