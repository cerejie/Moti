import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

export interface IAppMutationOptions<TResult> {
  successMessage?: string;
  queuedMessage?: string;
  // Query-key prefixes refreshed after the write lands (or is queued).
  invalidate?: readonly QueryKey[];
  // Forms show the error inline instead of a toast.
  silentError?: boolean;
  onSuccess?: (result: TResult) => void | Promise<void>;
}

const defaultQueuedMessage = "Saved offline — will sync when you're back online.";

const isQueued = (result: unknown): boolean =>
  typeof result === "object" &&
  result !== null &&
  "queued" in result &&
  result.queued === true;

// The one place a write turns into feedback: success, queued-offline or error.
export const useAppMutation = <TArgs = void, TResult = unknown>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  options: IAppMutationOptions<TResult> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TArgs>({
    mutationFn,
    onSuccess: async (result) => {
      await Promise.all(
        (options.invalidate ?? []).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );

      if (isQueued(result)) {
        toast.info(options.queuedMessage ?? defaultQueuedMessage);
      } else if (options.successMessage) {
        toast.success(options.successMessage);
      }

      await options.onSuccess?.(result);
    },
    onError: (error) => {
      if (!options.silentError) toast.error(error.message);
    },
  });
};
