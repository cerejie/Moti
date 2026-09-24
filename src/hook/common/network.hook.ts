import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { IQueuedWrite } from "../../models/common/write.model";
import { selectUserId, useAuthStore } from "../../store/data/auth/auth.store";
import { selectOnline, useNetworkStore } from "../../store/common/network.store";
import { useSyncStore } from "../../store/common/sync.store";
import { queryClient } from "../../utils/query.utils";
import { useConfirm } from "./confirmation.hook";

// Mounted once by the shell: tracks connectivity, flushes queued writes and
// refreshes stale reads when the device comes back online.
export const useNetwork = () => {
  const setOnline = useNetworkStore((state) => state.setOnline);
  const flush = useSyncStore((state) => state.flush);
  const queryClient = useQueryClient();

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      void flush().then(() => queryClient.invalidateQueries());
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if (navigator.onLine) void flush();

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnline, flush, queryClient]);
};

// Only the signed-in user's writes: another user's stay queued and are never sent here.
const useOwnQueue = () => {
  const queue = useSyncStore((state) => state.queue);
  const userId = useAuthStore(selectUserId);

  return useMemo(() => queue.filter((write) => write.userId === userId), [queue, userId]);
};

export const useSyncStatus = () => {
  const online = useNetworkStore(selectOnline);
  const pending = useOwnQueue().length;
  const flushing = useSyncStore((state) => state.flushing);
  const failed = useSyncStore((state) => state.failedId !== null);

  return { online, pending, flushing, failed };
};

// The Sync issues sheet: what is waiting, which write the server refused and why.
export const useSyncIssues = () => {
  const writes = useOwnQueue();
  const online = useNetworkStore(selectOnline);
  const flushing = useSyncStore((state) => state.flushing);
  const failedId = useSyncStore((state) => state.failedId);
  const lastError = useSyncStore((state) => state.lastError);
  const flush = useSyncStore((state) => state.flush);
  const discardWrite = useSyncStore((state) => state.discard);
  const confirm = useConfirm();

  return {
    writes,
    online,
    flushing,
    failedId,
    lastError,
    retry: () => void flush().then(() => queryClient.invalidateQueries()),
    discard: (write: IQueuedWrite) =>
      confirm({
        kind: "delete",
        title: "Discard this change?",
        itemName: write.label,
        message: "It is removed from this device and never reaches the server.",
        okText: "Discard",
        onConfirm: () => discardWrite(write.id),
      }),
  };
};
