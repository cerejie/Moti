import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import type { IBeforeInstallPromptEvent } from "../../models/common/pwa.model";
import { usePwaStore } from "../../store/common/pwa.store";
import { useSyncStore } from "../../store/common/sync.store";
import { isIosDevice } from "../../utils/pwa.utils";

const updateCheckInterval = 60 * 60 * 1000;

// Mounted once by App: Chromium fires the install event early, before any screen asks for it.
export const useInstallCapture = () => {
  const setInstallEvent = usePwaStore((state) => state.setInstallEvent);
  const markInstalled = usePwaStore((state) => state.markInstalled);

  useEffect(() => {
    const capture = (event: Event) => {
      // Holds back Chrome's own mini-infobar; Moti offers install in its own banner.
      event.preventDefault();
      setInstallEvent(event as IBeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", markInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, [setInstallEvent, markInstalled]);
};

export const useInstallApp = () => {
  const installEvent = usePwaStore((state) => state.installEvent);
  const installed = usePwaStore((state) => state.installed);
  const dismissed = usePwaStore((state) => state.installDismissed);
  const setInstallEvent = usePwaStore((state) => state.setInstallEvent);
  const dismiss = usePwaStore((state) => state.dismissInstall);

  const canInstall = !installed && installEvent !== null;
  // iOS has no install event; Share → Add to Home Screen is the only way in.
  const showIosHint = !installed && isIosDevice();

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    // A prompt works once; Chromium fires a fresh event if it can be offered again.
    setInstallEvent(null);
  };

  return {
    installed,
    canInstall,
    showIosHint,
    showBanner: !dismissed && (canInstall || showIosHint),
    install: () => void install(),
    dismiss,
  };
};

// Used only by UpdatePrompt, which App mounts once: the one service-worker registration.
export const useAppUpdate = () => {
  const flushing = useSyncStore((state) => state.flushing);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_url, registration) => {
      if (!registration) return;
      setInterval(() => {
        if (navigator.onLine) void registration.update();
      }, updateCheckInterval);
    },
  });

  return {
    needRefresh,
    // A reload mid-flush would cut off a write the server may already be applying.
    blocked: flushing,
    reload: () => void updateServiceWorker(true),
    later: () => setNeedRefresh(false),
  };
};
