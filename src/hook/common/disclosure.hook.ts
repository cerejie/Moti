import { useMemo } from "react";
import {
  selectDisclosure,
  useViewStore,
} from "../../store/common/view.store";
import {
  selectCollapsedSections,
  useDisclosureStore,
} from "../../store/common/disclosure.store";

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

// Which sections of one form are collapsed; a section with an error is opened by the caller.
export const useSectionDisclosure = (scope: string) => {
  const collapsedSections = useDisclosureStore(selectCollapsedSections(scope));
  const setSectionCollapsedAt = useDisclosureStore((state) => state.setSectionCollapsed);
  const resetSectionsAt = useDisclosureStore((state) => state.resetSections);

  return useMemo(
    () => ({
      isCollapsed: (section: string) => collapsedSections.includes(section),
      setExpanded: (section: string, expanded: boolean) =>
        setSectionCollapsedAt(scope, section, !expanded),
      resetSections: () => resetSectionsAt(scope),
    }),
    [collapsedSections, scope, setSectionCollapsedAt, resetSectionsAt],
  );
};
