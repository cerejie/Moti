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
    mutations: {
      // The default "online" mode pauses writes while the device is offline, so runWrite
      // never gets the chance to queue them.
      networkMode: "always",
    },
  },
});

// Offline, a new search, filter or page keeps the previous rows and cannot fetch its own.
export const isShowingPausedRows = (query: {
  isPlaceholderData: boolean;
  isPaused: boolean;
}): boolean => query.isPlaceholderData && query.isPaused;
