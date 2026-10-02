import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  type ILoginInput,
} from "../../../models/data/account/account.request";
import type { ILoginResult } from "../../../models/data/account/account.response";
import { ROUTES } from "../../../routes/route.paths";
import accountServices from "../../../services/data/account.services";
import { useSyncStore } from "../../../store/common/sync.store";
import {
  selectSessionOwner,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { resetLocation } from "../../../utils/route.utils";
import { useAppMutation } from "../../common/mutation.hook";

export const useAccountLoginHook = () => {
  const setCustomSession = useAccountStore((state) => state.setCustomSession);
  const setDeveloperSession = useAccountStore((state) => state.setDeveloperSession);

  const form = useForm<ILoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useAppMutation(accountServices.login, {
    silentError: true,
    onSuccess: (result: ILoginResult) => {
      // The signed-in router mounts on home, never on /login.
      resetLocation(ROUTES.home);
      if (result.kind === "custom") setCustomSession(result.session);
      else setDeveloperSession(result.email);

      const owner = selectSessionOwner(useAccountStore.getState());
      if (owner) useSyncStore.getState().adoptOwner(owner);
    },
  });

  return {
    form,
    loginMutation,
    onSubmit: (values: ILoginInput) => loginMutation.mutate(values),
  };
};
