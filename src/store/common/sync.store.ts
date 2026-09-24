import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorageKey } from "../../keys/storage.keys";
import type {
  IMutationResult,
  IQueuedWrite,
  IQueuedWriteInput,
} from "../../models/common/write.model";
import { isNetworkError } from "../../utils/error.utils";
import { executeWrite, newWriteId } from "../../utils/write.utils";
import { useAuthStore } from "../data/auth/auth.store";

type States = {
  queue: IQueuedWrite[];
  flushing: boolean;
  lastError: string | null;
  // The write the server refused; it blocks the ones behind it until retried or discarded.
  failedId: string | null;
};

type Actions = {
  enqueue: (write: IQueuedWriteInput) => string;
  flush: () => Promise<void>;
  discard: (id: string) => void;
};

const initialValues: States = {
  queue: [],
  flushing: false,
  lastError: null,
  failedId: null,
};

// Plain zustand create and persisted: queued writes must survive a reload and a
// sign-out reset. Each write is stamped with its user and only sent by that user's session.
export const useSyncStore = create<States & Actions>()(
  persist(
    (set, get) => ({
      ...initialValues,

      enqueue: (write) => {
        const id = newWriteId();
        const userId = useAuthStore.getState().userId;
        set((state) => ({
          queue: [
            ...state.queue,
            { ...write, id, userId, queuedAt: new Date().toISOString() } as IQueuedWrite,
          ],
        }));
        return id;
      },

      flush: async () => {
        if (get().flushing) return;
        const userId = useAuthStore.getState().userId;
        if (!userId) return;
        set({ flushing: true, lastError: null, failedId: null });

        // Another user's writes stay queued; they are never sent under this session.
        const nextOwn = () => get().queue.find((write) => write.userId === userId);

        try {
          for (let next = nextOwn(); next; next = nextOwn()) {
            const sent = next;

            try {
              await executeWrite(sent);
              set((state) => ({
                queue: state.queue.filter((write) => write.id !== sent.id),
              }));
            } catch (error) {
              // Losing the connection mid-flush is not the write's fault; it retries on reconnect.
              if (!isNetworkError(error)) {
                set({
                  lastError: error instanceof Error ? error.message : String(error),
                  failedId: sent.id,
                });
              }
              break;
            }
          }
        } finally {
          set({ flushing: false });
        }
      },

      discard: (id) =>
        set((state) => ({
          queue: state.queue.filter((write) => write.id !== id),
          ...(state.failedId === id ? { failedId: null, lastError: null } : {}),
        })),
    }),
    { name: syncStorageKey, partialize: (state) => ({ queue: state.queue }) },
  ),
);

export const runWrite = async (
  write: IQueuedWriteInput,
): Promise<IMutationResult> => {
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  if (!online) {
    useSyncStore.getState().enqueue(write);
    return { queued: true };
  }

  try {
    await executeWrite({
      ...write,
      id: newWriteId(),
      userId: useAuthStore.getState().userId,
    } as IQueuedWrite);
  } catch (error) {
    // A patchy connection: every RPC write carries its own client id, so queueing
    // one that may already have landed is safe — the replay is ignored.
    if (write.kind === "rpc" && isNetworkError(error)) {
      useSyncStore.getState().enqueue(write);
      return { queued: true };
    }
    throw error;
  }
  return { queued: false };
};
