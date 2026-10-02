import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  registerSchema,
  type IRegisterInput,
} from "../../../models/data/account/account.request";
import { ROUTES } from "../../../routes/route.paths";
import accountServices from "../../../services/data/account.services";
import {
  selectRegistered,
  useAuthFlowStore,
} from "../../../store/data/account/auth.flow.store";
import { useAppMutation } from "../../common/mutation.hook";

export const useAccountRegisterHook = () => {
  const registered = useAuthFlowStore(selectRegistered);
  const setRegistered = useAuthFlowStore((state) => state.setRegistered);
  const resetFlow = useAuthFlowStore((state) => state.reset);
  const navigate = useNavigate();

  const form = useForm<IRegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" },
  });

  const registerMutation = useAppMutation(accountServices.register, {
    silentError: true,
    onSuccess: () => {
      form.reset();
      setRegistered();
    },
  });

  return {
    form,
    registered,
    registerMutation,
    onSubmit: (values: IRegisterInput) => registerMutation.mutate(values),
    backToSignIn: () => {
      resetFlow();
      navigate(ROUTES.login);
    },
  };
};
