import type { IConfirmRequest } from "../../models/common/modal.model";
import { create } from "./reset.store";

type States = {
  confirm: IConfirmRequest;
  running: boolean;
  // What the user has typed into the confirm-phrase gate, when the request
  // carries a confirmPhrase. Lives here rather than in the modal so the
  // modal stays stateless and the value clears with the request.
  phrase: string;
};

type Actions = {
  openConfirm: (value: Omit<IConfirmRequest, "visible">) => void;
  setPhrase: (value: string) => void;
  closeConfirm: () => void;
  runConfirm: () => Promise<void>;
};

const closedConfirm: IConfirmRequest = { visible: false };

const initialValues: States = {
  confirm: closedConfirm,
  running: false,
  phrase: "",
};

export const useConfirmStore = create<States & Actions>()((set, get) => ({
  ...initialValues,
  openConfirm: (value) =>
    set({ confirm: { ...value, visible: true }, phrase: "", running: false }),
  setPhrase: (value) => set({ phrase: value }),
  closeConfirm: () =>
    set({ confirm: closedConfirm, running: false, phrase: "" }),
  runConfirm: async () => {
    const action = get().confirm.onConfirm;

    if (action) {
      set({ running: true });
      await action();
    }

    set({ confirm: closedConfirm, running: false, phrase: "" });
  },
}));

export const selectConfirm = (state: States) => state.confirm;

export const selectConfirmRunning = (state: States) => state.running;

export const selectConfirmPhrase = (state: States) => state.phrase;
