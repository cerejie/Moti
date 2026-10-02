import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorageKey } from "../../keys/storage.keys";
import type {
  IMutationResult,
  IQueuedWrite,
  IQueuedWriteInput,
} from "../../models/common/write.model";
import { executeWrite, newWriteId } from "../../utils/write.utils";
import { selectSessionOwner, useAccountStore } from "../data/account/account.store";

type States = {
  queue: IQueuedWrite[];
  // The account that queued the writes; they never flush under anyone else.
  ownerId: string | null;
  flushing: boolean;
  lastError: string | null;
};

type Actions = {
  enqueue: (write: IQueuedWriteInput) => string;
  flush: () => Promise<void>;
  discard: (id: string) => void;
  // Called on sign-in: another account's leftovers are dropped, never replayed.
  adoptOwner: (ownerId: string) => void;
};

const initialValues: States = {
  queue: [],
  ownerId: null,
  flushing: false,
  lastError: null,
};

const currentOwner = () => selectSessionOwner(useAccountStore.getState());

// Plain zustand create and persisted: queued writes must survive a reload and a
// sign-out reset, and replay only for the account that made them.
export const useSyncStore = create<States & Actions>()(
  persist(
    (set, get) => ({
      ...initialValues,

      enqueue: (write) => {
        const id = newWriteId();
        set((state) => ({
          queue: [...state.queue, { ...write, id } as IQueuedWrite],
          ownerId: currentOwner(),
        }));
        return id;
      },

      flush: async () => {
        const owner = currentOwner();
        if (get().flushing || !owner || get().ownerId !== owner) return;
        set({ flushing: true, lastError: null });

        try {
          while (get().queue.length > 0) {
            const [next, ...rest] = get().queue;

            try {
              await executeWrite(next);
              set({ queue: rest });
            } catch (error) {
              set({
                lastError: error instanceof Error ? error.message : String(error),
              });
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
        })),

      adoptOwner: (ownerId) => {
        if (get().ownerId !== ownerId) set({ queue: [], ownerId, lastError: null });
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

  if (!online) {
    useSyncStore.getState().enqueue(write);
    return { queued: true };
  }

  await executeWrite({ ...write, id: newWriteId() } as IQueuedWrite);
  return { queued: false };
};
