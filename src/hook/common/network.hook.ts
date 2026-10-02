import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { IQueueEntry } from "../../models/common/write.model";
import { selectOnline, useNetworkStore } from "../../store/common/network.store";
import { useSyncStore } from "../../store/common/sync.store";
import { useConfirm } from "./confirmation.hook";

// Mounted once by the shell: tracks connectivity, flushes queued writes and
// refreshes stale reads when the device comes back online or to the foreground.
export const useNetwork = () => {
  const setOnline = useNetworkStore((state) => state.setOnline);
  const flush = useSyncStore((state) => state.flush);
  const queryClient = useQueryClient();

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      void flush();
      void queryClient.invalidateQueries();
    };
    const goOffline = () => setOnline(false);
    // Writes queued on Wi-Fi without internet get no "online" event to wake them.
    const goForeground = () => {
      if (document.visibilityState === "visible" && navigator.onLine) void flush();
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    document.addEventListener("visibilitychange", goForeground);

    if (navigator.onLine) void flush();

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      document.removeEventListener("visibilitychange", goForeground);
    };
  }, [setOnline, flush, queryClient]);
};

const isFailed = (entry: IQueueEntry) => Boolean(entry.failure);

export const useSyncStatus = () => {
  const online = useNetworkStore(selectOnline);
  const failed = useSyncStore((state) => state.queue.filter(isFailed).length);
  const waiting = useSyncStore((state) => state.queue.length) - failed;
  const flushing = useSyncStore((state) => state.flushing);

  return { online, waiting, failed, flushing };
};

export const useSyncQueue = () => {
  const online = useNetworkStore(selectOnline);
  const queue = useSyncStore((state) => state.queue);
  const flushing = useSyncStore((state) => state.flushing);
  const retryFailed = useSyncStore((state) => state.retryFailed);
  const discardWrite = useSyncStore((state) => state.discard);
  const confirm = useConfirm();

  return {
    queue,
    flushing,
    canRetry: online && !flushing && queue.length > 0,
    retry: () => void retryFailed(),
    discard: (entry: IQueueEntry) =>
      confirm({
        kind: "delete",
        title: "Discard this change?",
        message: "It was never saved to the server and will be lost.",
        itemName: entry.label,
        okText: "Discard",
        onConfirm: () => discardWrite(entry.id),
      }),
  };
};
