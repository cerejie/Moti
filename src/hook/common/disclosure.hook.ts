import { useMemo } from "react";
import {
  selectDisclosure,
  useViewStore,
} from "../../store/common/view.store";

export const useDisclosure = (key: string) => {
  const open = useViewStore(selectDisclosure(key));
  const setDisclosureAt = useViewStore((state) => state.setDisclosure);
  const toggleDisclosureAt = useViewStore((state) => state.toggleDisclosure);

  return useMemo(
    () => ({
      open,
      setOpen: (value: boolean) => setDisclosureAt(key, value),
      toggle: () => toggleDisclosureAt(key),
    }),
    [open, key, setDisclosureAt, toggleDisclosureAt],
  );
};
