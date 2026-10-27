import { X } from "lucide-react";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useFilters } from "../../../hook/common/filter.hook";
import { useSearch } from "../../../hook/common/search.hook";
import {
  hasActiveFilter,
  type IFilterControl,
} from "../../../models/common/filter.model";
import {
  filterInlineRow,
  filterReset,
  filterSelect,
} from "../../../styles/filter/filter.styles";
import AppButton from "../button/AppButton";
import FilterSelect from "./FilterSelect";
import FilterSheet from "./FilterSheet";
import SearchInput from "./SearchInput";

type IProps = {
  // Stable keys for the filter and search stores; see keys/table.keys.ts.
  filterKey: string;
  searchKey?: string;
  searchPlaceholder?: string;
  controls?: IFilterControl[];
  // Compact shows the selects under the search instead of behind a Filters sheet.
  inlineOnCompact?: boolean;
};

// The keyed search and selects that go inside a FilterToolbar. Compact keeps the
// search in view and moves the selects into a Filters sheet.
const FilterBar = ({
  filterKey,
  searchKey,
  searchPlaceholder = "Search",
  controls = [],
  inlineOnCompact = false,
}: IProps) => {
  const isCompact = useIsCompact();
  const { filters, setFilters, resetFilters } = useFilters(filterKey);
  const { search, setSearch, resetSearch } = useSearch(searchKey ?? filterKey);

  const dirty = hasActiveFilter(filters) || search !== "";

  const handleReset = () => {
    resetFilters();
    resetSearch();
  };

  const searchInput = searchKey ? (
    <SearchInput
      toolbar
      value={search}
      placeholder={searchPlaceholder}
      onChange={(term) => setSearch(term ?? "")}
    />
  ) : null;

  const selects = controls.map((control) => (
    <FilterSelect
      key={control.key}
      control={control}
      value={filters[control.key]}
      onChange={(value) => setFilters({ [control.key]: value })}
      className={filterSelect}
    />
  ));

  if (isCompact) {
    return (
      <>
        {searchInput}
        {controls.length === 0 ? null : inlineOnCompact ? (
          <div className={filterInlineRow}>{selects}</div>
        ) : (
          <FilterSheet filterKey={filterKey} controls={controls} />
        )}
      </>
    );
  }

  return (
    <>
      {searchInput}

      {selects}

      {dirty ? (
        <AppButton variant="ghost" className={filterReset} onPress={handleReset}>
          <X />
          Clear
        </AppButton>
      ) : null}
    </>
  );
};

export default FilterBar;
