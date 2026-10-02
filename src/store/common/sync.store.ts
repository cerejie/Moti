import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorageKey } from "../../keys/storage.keys";
import type {
  IMutationResult,
  IQueuedWrite,
  IQueuedWriteInput,
  IQueueEntry,
} from "../../models/common/write.model";
import { isNetworkError } from "../../utils/error.utils";
import { queryClient } from "../../utils/query.utils";
import { executeWrite, newWriteId } from "../../utils/write.utils";
import { selectSessionOwner, useAccountStore } from "../data/account/account.store";

type States = {
  queue: IQueueEntry[];
  // The account that queued the writes; they never flush under anyone else.
  ownerId: string | null;
  flushing: boolean;
};

type Actions = {
  enqueue: (write: IQueuedWriteInput) => string;
  flush: () => Promise<void>;
  retryFailed: () => Promise<void>;
  discard: (id: string) => void;
  // Called on sign-in: another account's leftovers are dropped, never replayed.
  adoptOwner: (ownerId: string) => void;
};

const initialValues: States = {
  queue: [],
  ownerId: null,
  flushing: false,
};

const currentOwner = () => selectSessionOwner(useAccountStore.getState());

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// Plain zustand create and persisted: queued writes must survive a reload and a
// sign-out reset, and replay only for the account that made them.
export const useSyncStore = create<States & Actions>()(
  persist(
    (set, get) => ({
      ...initialValues,

      enqueue: (write) => {
        const id = newWriteId();
        const entry = { ...write, id, queuedAt: new Date().toISOString() } as IQueueEntry;
        set((state) => ({ queue: [...state.queue, entry], ownerId: currentOwner() }));
        return id;
      },

      flush: async () => {
        const owner = currentOwner();
        if (get().flushing || !owner || get().ownerId !== owner) return;
        set({ flushing: true });
        let sent = 0;

        try {
          // A refused write is set aside so the ones behind it still go out;
          // a network error stops the run and keeps everything for next time.
          let next = get().queue.find((entry) => !entry.failure);
          while (next) {
            const { id } = next;

            try {
              await executeWrite(next);
              sent += 1;
              set((state) => ({ queue: state.queue.filter((entry) => entry.id !== id) }));
            } catch (error) {
              if (isNetworkError(error)) break;
              set((state) => ({
                queue: state.queue.map((entry) =>
                  entry.id === id ? { ...entry, failure: errorText(error) } : entry,
                ),
              }));
            }

            next = get().queue.find((entry) => !entry.failure);
          }
        } finally {
          set({ flushing: false });
        }

        if (sent > 0) void queryClient.invalidateQueries();
      },

      retryFailed: async () => {
        set((state) => ({
          queue: state.queue.map((entry) => ({ ...entry, failure: undefined })),
        }));
        await get().flush();
      },

      discard: (id) =>
        set((state) => ({
          queue: state.queue.filter((write) => write.id !== id),
        })),

      adoptOwner: (ownerId) => {
        if (get().ownerId !== ownerId) set({ queue: [], ownerId });
      },
    }),
    {
      name: syncStorageKey,
      partialize: (state) => ({ queue: state.queue, ownerId: state.ownerId }),
    },
  ),
);

export const runWrite = async (
  write: IQueuedWriteInput,
): Promise<IMutationResult> => {
  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  const queue = () => {
    useSyncStore.getState().enqueue(write);
    return { queued: true };
  };

  if (!online) return queue();

  try {
    await executeWrite({ ...write, id: newWriteId() } as IQueuedWrite);
  } catch (error) {
    // Connected Wi-Fi without internet reports online; the write waits instead of failing.
    if (isNetworkError(error)) return queue();
    throw error;
  }

  // The connection works, so anything left waiting can go out now.
  void useSyncStore.getState().flush();
  return { queued: false };
};
