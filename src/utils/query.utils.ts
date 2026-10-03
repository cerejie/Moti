import { QueryClient, type Query } from "@tanstack/react-query";
import type {
  PersistedClient,
  Persister,
  PersistQueryClientOptions,
} from "@tanstack/react-query-persist-client";
import {
  brandListKey,
  categoryListKey,
  inventoryListKey,
} from "../keys/query.keys";
import { queryCacheStorageKey } from "../keys/storage.keys";
import { isNetworkError } from "./error.utils";

const maxRetries = 1;
const offlineCacheMs = 24 * 60 * 60 * 1000;
const persistThrottleMs = 1000;
// What the Sell screen needs to work after a cold start offline.
const persistedKeys: readonly unknown[] = [inventoryListKey, categoryListKey, brandListKey];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A restored list must outlive the default five minutes, or it is gone before Sell opens.
      gcTime: offlineCacheMs,
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

interface IStoredCache {
  ownerId: string;
  client: PersistedClient;
}

const readStoredCache = (): IStoredCache | null => {
  try {
    const raw = localStorage.getItem(queryCacheStorageKey);
    return raw ? (JSON.parse(raw) as IStoredCache) : null;
  } catch {
    return null;
  }
};

const writeStoredCache = (cache: IStoredCache): void => {
  try {
    localStorage.setItem(queryCacheStorageKey, JSON.stringify(cache));
  } catch (error) {
    // A full or blocked storage only costs the offline copy; the app keeps working online.
    console.warn("Could not save the offline item list", error);
  }
};

export const clearPersistedQueries = (): void => {
  try {
    localStorage.removeItem(queryCacheStorageKey);
  } catch {
    // Storage blocked: nothing was saved, so there is nothing to clear.
  }
};

// The copy is tagged with the account that saved it and only restored for that account.
const createQueryPersister = (getOwnerId: () => string | null): Persister => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    persistClient: (client) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        const ownerId = getOwnerId();
        if (ownerId) writeStoredCache({ ownerId, client });
      }, persistThrottleMs);
    },
    restoreClient: () => {
      const stored = readStoredCache();
      return stored && stored.ownerId === getOwnerId() ? stored.client : undefined;
    },
    removeClient: clearPersistedQueries,
  };
};

const shouldPersistQuery = (query: Query): boolean =>
  query.state.status === "success" && persistedKeys.includes(query.queryKey[0]);

export const createPersistOptions = (
  getOwnerId: () => string | null,
): Omit<PersistQueryClientOptions, "queryClient"> => ({
  persister: createQueryPersister(getOwnerId),
  maxAge: offlineCacheMs,
  dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
});

// Offline, a new search, filter or page keeps the previous rows and cannot fetch its own.
export const isShowingPausedRows = (query: {
  isPlaceholderData: boolean;
  isPaused: boolean;
}): boolean => query.isPlaceholderData && query.isPaused;
