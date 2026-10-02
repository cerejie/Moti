import { SlidersHorizontal } from "lucide-react";
import { useFilters } from "../../../hook/common/filter.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { filterSheetModalKey } from "../../../keys/modal.keys";
import {
  countActiveControls,
  type IFilterControl,
} from "../../../models/common/filter.model";
import {
  filterSheetBadge,
  filterSheetBody,
  filterSheetSelect,
  filterSheetTrigger,
} from "../../../styles/filter/filterToolbar.styles";
import AppButton from "../button/AppButton";
import AppModal from "../modal/AppModal";
import FilterSelect from "./FilterSelect";

type IProps = {
  filterKey: string;
  controls: IFilterControl[];
};

// The phone toolbar keeps only search in view; the selects wait in a bottom sheet
// behind one button whose badge says how many are on.
const FilterSheet = ({ filterKey, controls }: IProps) => {
  const { filters, setFilters } = useFilters(filterKey);
  const { modal, openModal, closeModal } = useModal(`${filterSheetModalKey}:${filterKey}`);
  const activeCount = countActiveControls(filters, controls);

  const handleClear = () =>
    setFilters(Object.fromEntries(controls.map((control) => [control.key, undefined])));

  return (
    <>
      <AppButton
        variant="outline"
        className={filterSheetTrigger}
        aria-label={activeCount > 0 ? `Filters, ${activeCount} on` : "Filters"}
        onPress={() => openModal()}
      >
        <SlidersHorizontal />
        Filters
        {activeCount > 0 && (
          <span className={filterSheetBadge} aria-hidden="true">
            {activeCount}
          </span>
        )}
      </AppButton>

      <AppModal
        open={modal.visible}
        onOpenChange={(open) => !open && closeModal()}
        title="Filters"
        size="sm"
        footer={
          <>
            <AppButton variant="outline" disabled={activeCount === 0} onPress={handleClear}>
              Clear
            </AppButton>
            <AppButton onPress={closeModal}>Done</AppButton>
          </>
        }
      >
        <div className={filterSheetBody}>
          {controls.map((control) => (
            <FilterSelect
              key={control.key}
              control={control}
              value={filters[control.key]}
              onChange={(value) => setFilters({ [control.key]: value })}
              className={filterSheetSelect}
            />
          ))}
        </div>
      </AppModal>
    </>
  );
};

export default FilterSheet;
