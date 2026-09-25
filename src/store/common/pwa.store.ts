import { create } from "zustand";
import { persist } from "zustand/middleware";
import { installDismissedStorageKey } from "../../keys/storage.keys";
import type { IBeforeInstallPromptEvent } from "../../models/common/pwa.model";
import { isStandalone } from "../../utils/pwa.utils";

type States = {
  // Chromium hands the install prompt over once; it is kept until used.
  installEvent: IBeforeInstallPromptEvent | null;
  installed: boolean;
  installDismissed: boolean;
};

type Actions = {
  setInstallEvent: (event: IBeforeInstallPromptEvent | null) => void;
  markInstalled: () => void;
  dismissInstall: () => void;
};

const initialValues: States = {
  installEvent: null,
  installed: isStandalone(),
  installDismissed: false,
};

// Plain zustand create and persisted: install state is a device fact and a
// dismissed banner stays dismissed across sign-outs.
export const usePwaStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      setInstallEvent: (installEvent) => set({ installEvent }),
      markInstalled: () => set({ installed: true, installEvent: null }),
      dismissInstall: () => set({ installDismissed: true }),
    }),
    {
      name: installDismissedStorageKey,
      partialize: (state) => ({ installDismissed: state.installDismissed }),
    },
  ),
);
