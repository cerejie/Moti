import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IMutationResult } from "../../models/common/write.model";
import { describeError } from "../../utils/error.utils";
import { queryClient } from "../../utils/query.utils";

// TResult widens the write result for an online-only call that answers with data.
type IOptions<TVariables, TResult extends IMutationResult> = {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  // Toast text once the write reached the server.
  successMessage: string | ((variables: TVariables) => string);
  // Query-key prefixes whose cached rows the write changes.
  invalidates: string[];
  // A write started outside a form (a confirm, a row action) has nowhere to
  // show its error, so it raises a toast instead.
  toastErrors?: boolean;
  onSuccess?: (result: TResult, variables: TVariables) => void;
};

export const queuedMessage = "Saved offline — will sync when you're back online.";

const errorFallback = "Couldn't save. Please try again.";

// Every runWrite-backed mutation goes through here, so a queued write always
// says so instead of claiming success.
export const useAppMutation = <
  TVariables,
  TResult extends IMutationResult = IMutationResult,
>({
  mutationFn,
  successMessage,
  invalidates,
  toastErrors = false,
  onSuccess,
}: IOptions<TVariables, TResult>) => {
  const mutation = useMutation({
    mutationFn,
    onSuccess: (result, variables) => {
      if (result.queued) {
        toast.info(queuedMessage);
      } else {
        toast.success(
          typeof successMessage === "function" ? successMessage(variables) : successMessage,
        );
      }

      invalidates.forEach((key) =>
        queryClient.invalidateQueries({
          predicate: (query) => String(query.queryKey[0]).startsWith(key),
        }),
      );
      onSuccess?.(result, variables);
    },
    onError: (error) => {
      if (toastErrors) toast.error(describeError(error, errorFallback).message);
    },
  });

  const errorText = mutation.error
    ? describeError(mutation.error, errorFallback).message
    : null;

  return { ...mutation, errorText };
};
