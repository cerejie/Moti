import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useSyncStore } from "../../store/common/sync.store";

const updateCheckIntervalMs = 60 * 60 * 1000;
const updateToastId = "app-update";

// Mounted once in App: an installed app stays open for days, so it checks for a new
// version hourly and asks before reloading.
export const useAppUpdate = () => {
  const flushing = useSyncStore((state) => state.flushing);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_url, registration) => {
      if (!registration) return;
      setInterval(() => {
        // Offline checks fail; the next interval tries again.
        registration.update().catch(() => undefined);
      }, updateCheckIntervalMs);
    },
  });

  useEffect(() => {
    // Held back while queued writes are sending, so a reload never cuts one off.
    if (!needRefresh || flushing) return;

    toast("New version ready", {
      id: updateToastId,
      duration: Infinity,
      action: { label: "Reload", onClick: () => void updateServiceWorker(true) },
    });

    return () => {
      toast.dismiss(updateToastId);
    };
  }, [needRefresh, flushing, updateServiceWorker]);
};
