import type { IHeaderBack } from "../../models/common/route.model";
import { create } from "./reset.store";

type States = {
  headerBack: IHeaderBack | null;
};

type Actions = {
  setHeaderBack: (headerBack: IHeaderBack | null) => void;
};

const initialValues: States = {
  headerBack: null,
};

export const useLayoutStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setHeaderBack: (headerBack) => set({ headerBack }),
}));

export const selectHeaderBack = (state: States) => state.headerBack;
