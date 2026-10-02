import { create } from "../../common/reset.store";

type States = {
  registered: boolean;
  resetRequested: boolean;
};

type Actions = {
  setRegistered: () => void;
  setResetRequested: () => void;
  reset: () => void;
};

const initialValues: States = {
  registered: false,
  resetRequested: false,
};

// The sign-up and password-reset screens swap to a "sent" panel once done.
export const useAuthFlowStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setRegistered: () => set({ registered: true }),
  setResetRequested: () => set({ resetRequested: true }),
  reset: () => set({ ...initialValues }),
}));

export const selectRegistered = (state: States): boolean => state.registered;

export const selectResetRequested = (state: States): boolean => state.resetRequested;
