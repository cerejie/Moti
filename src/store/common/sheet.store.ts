import { create } from "./reset.store";

export type ISheetEntry = {
  id: string;
  close: () => void;
};

type States = {
  // Open sheets and dialogs, oldest first; the last one is on top.
  sheets: ISheetEntry[];
};

type Actions = {
  register: (id: string, close: () => void) => void;
  unregister: (id: string) => void;
};

const initialValues: States = {
  sheets: [],
};

export const useSheetStore = create<States & Actions>()((set) => ({
  ...initialValues,
  register: (id, close) =>
    set((state) => ({
      sheets: [...state.sheets.filter((sheet) => sheet.id !== id), { id, close }],
    })),
  unregister: (id) =>
    set((state) =>
      state.sheets.some((sheet) => sheet.id === id)
        ? { sheets: state.sheets.filter((sheet) => sheet.id !== id) }
        : state,
    ),
}));
