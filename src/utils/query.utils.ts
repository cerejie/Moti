import { QueryClient } from "@tanstack/react-query";
import { isNetworkError } from "./error.utils";

const maxRetries = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // supabase-js already retries a failed read three times; retrying that again only
      // delays the offline message.
      retry: (failureCount, error) => !isNetworkError(error) && failureCount < maxRetries,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
