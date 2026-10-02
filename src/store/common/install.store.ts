import { create } from "zustand";
import type { IBeforeInstallPromptEvent } from "../../models/common/install.model";

type States = {
  // The browser fires this once per page load when the app can be installed.
  deferredPrompt: IBeforeInstallPromptEvent | null;
  installed: boolean;
};

type Actions = {
  setDeferredPrompt: (event: IBeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
};

const initialValues: States = {
  deferredPrompt: null,
  installed: false,
};

// Plain zustand create: installability is a device fact, not session state.
export const useInstallStore = create<States & Actions>((set) => ({
  ...initialValues,
  setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
  setInstalled: (installed) => set({ installed, deferredPrompt: null }),
}));
