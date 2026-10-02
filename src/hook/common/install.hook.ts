import { useEffect } from "react";
import type { IBeforeInstallPromptEvent } from "../../models/common/install.model";
import { useInstallStore } from "../../store/common/install.store";
import { isAppleTouchDevice, isStandalone } from "../../utils/push.utils";

// Mounted once in App: keeps the browser's install prompt for the Install button.
export const useInstallListener = () => {
  const setDeferredPrompt = useInstallStore((state) => state.setDeferredPrompt);
  const setInstalled = useInstallStore((state) => state.setInstalled);

  useEffect(() => {
    const listeners = new AbortController();
    setInstalled(isStandalone());

    window.addEventListener(
      "beforeinstallprompt",
      (event) => {
        event.preventDefault();
        setDeferredPrompt(event as IBeforeInstallPromptEvent);
      },
      { signal: listeners.signal },
    );
    window.addEventListener("appinstalled", () => setInstalled(true), {
      signal: listeners.signal,
    });

    return () => listeners.abort();
  }, [setDeferredPrompt, setInstalled]);
};

export const useInstallApp = () => {
  const deferredPrompt = useInstallStore((state) => state.deferredPrompt);
  const installed = useInstallStore((state) => state.installed);
  const setDeferredPrompt = useInstallStore((state) => state.setDeferredPrompt);

  return {
    installed,
    canPrompt: deferredPrompt !== null,
    // iOS has no install event; it needs the Share → Add to Home Screen hint.
    showIosHint: !installed && deferredPrompt === null && isAppleTouchDevice(),
    install: async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    },
  };
};
