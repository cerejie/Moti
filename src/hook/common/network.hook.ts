import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { selectOnline, useNetworkStore } from "../../store/common/network.store";
import { useSyncStore } from "../../store/common/sync.store";

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

export const useSyncStatus = () => {
  const online = useNetworkStore(selectOnline);
  const pending = useSyncStore((state) => state.queue.length);
  const flushing = useSyncStore((state) => state.flushing);

  return { online, pending, flushing };
};
