import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorageKey } from "../../keys/storage.keys";
import type {
  IMutationResult,
  IQueuedWrite,
  IQueuedWriteInput,
} from "../../models/common/write.model";
import { executeWrite, newWriteId } from "../../utils/write.utils";
import { useAuthStore } from "../data/auth/auth.store";

type States = {
  queue: IQueuedWrite[];
  flushing: boolean;
  lastError: string | null;
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
          queue: [...state.queue, { ...write, id, userId } as IQueuedWrite],
        }));
        return id;
      },

      flush: async () => {
        if (get().flushing) return;
        const userId = useAuthStore.getState().userId;
        if (!userId) return;
        set({ flushing: true, lastError: null });

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

  await executeWrite({
    ...write,
    id: newWriteId(),
    userId: useAuthStore.getState().userId,
  } as IQueuedWrite);
  return { queued: false };
};
