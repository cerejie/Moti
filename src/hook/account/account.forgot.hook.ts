import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  forgotPasswordSchema,
  type IForgotPasswordInput,
} from "../../models/data/account/account.request";
import { ROUTES } from "../../routes/route.paths";
import accountServices from "../../services/data/account.services";
import {
  selectResetRequested,
  useAuthFlowStore,
} from "../../store/data/account/auth.flow.store";
import { useAppMutation } from "../common/mutation.hook";

export const useAccountForgotHook = () => {
  const requested = useAuthFlowStore(selectResetRequested);
  const setResetRequested = useAuthFlowStore((state) => state.setResetRequested);
  const resetFlow = useAuthFlowStore((state) => state.reset);
  const navigate = useNavigate();

  const form = useForm<IForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "", password: "", confirm_password: "" },
  });

  const resetMutation = useAppMutation(accountServices.requestPasswordReset, {
    silentError: true,
    onSuccess: () => {
      form.reset();
      setResetRequested();
    },
  });

  return {
    form,
    requested,
    resetMutation,
    onSubmit: (values: IForgotPasswordInput) => resetMutation.mutate(values),
    backToSignIn: () => {
      resetFlow();
      navigate(ROUTES.login);
    },
  };
};
