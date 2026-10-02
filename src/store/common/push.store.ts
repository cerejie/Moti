import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pushPromptStorageKey } from "../../keys/storage.keys";

type States = {
  permission: NotificationPermission | null;
  subscribed: boolean;
  promptDismissed: boolean;
};

type Actions = {
  setPermission: (permission: NotificationPermission | null) => void;
  setSubscribed: (subscribed: boolean) => void;
  dismissPrompt: () => void;
};

const initialValues: States = {
  permission: null,
  subscribed: false,
  promptDismissed: false,
};

// Plain zustand create: permission and subscription are facts about this
// device, re-read on every visit; only the dismissed prompt is remembered.
export const usePushStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      setPermission: (permission) => set({ permission }),
      setSubscribed: (subscribed) => set({ subscribed }),
      dismissPrompt: () => set({ promptDismissed: true }),
    }),
    {
      name: pushPromptStorageKey,
      partialize: (state) => ({ promptDismissed: state.promptDismissed }),
    },
  ),
);

export const selectPushPermission = (state: States) => state.permission;

export const selectPushSubscribed = (state: States) => state.subscribed;

export const selectPushPromptDismissed = (state: States) => state.promptDismissed;
