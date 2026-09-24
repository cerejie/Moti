import { create } from "zustand";

type States = {
  online: boolean;
};

type Actions = {
  setOnline: (online: boolean) => void;
};

const initialValues: States = {
  online: typeof navigator === "undefined" ? true : navigator.onLine,
};

// Plain zustand create: connectivity is a device fact, not session state.
export const useNetworkStore = create<States & Actions>((set) => ({
  ...initialValues,
  setOnline: (online) => set({ online }),
}));

export const selectOnline = (state: States) => state.online;
