import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  signInSchema,
  type ISignInRequest,
} from "../../../models/data/auth/auth.request";
import authServices from "../../../services/data/auth.services";
import { describeError } from "../../../utils/error.utils";

// A successful sign-in needs no handler here: the session subscription marks the
// user signed in and PublicRoute sends them on.
export const useSignInForm = () => {
  const form = useForm<ISignInRequest>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({ mutationFn: authServices.signIn });

  const onSubmit = (values: ISignInRequest) => mutation.mutate(values);

  const errorText = mutation.error
    ? describeError(mutation.error, "Couldn't sign in. Please try again.").message
    : null;

  return { form, onSubmit, errorText, isPending: mutation.isPending };
};
