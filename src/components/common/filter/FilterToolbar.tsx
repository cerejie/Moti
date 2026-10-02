import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hook/use-mobile";
import { cn } from "@/utils/cn.utils";
import { useFilters } from "../../../hook/common/filter.hook";
import { useSearch } from "../../../hook/common/search.hook";
import {
  hasActiveFilter,
  type IFilterControl,
} from "../../../models/common/filter.model";
import {
  filterControls,
  filterReset,
  filterSearch,
  filterSearchRow,
  filterSelect,
  filterToolbarRoot,
} from "../../../styles/filter/filterToolbar.styles";
import SearchInput from "../form/SearchInput";
import FilterSelect from "./FilterSelect";
import FilterSheet from "./FilterSheet";

type IProps = {
  // Stable keys for the filter and search stores; see keys/table.keys.ts.
  filterKey: string;
  searchKey?: string;
  searchPlaceholder?: string;
  controls?: IFilterControl[];
  // Extra controls rendered after the selects.
  children?: React.ReactNode;
  className?: string;
};

const FilterToolbar = ({
  filterKey,
  searchKey,
  searchPlaceholder = "Search",
  controls = [],
  children,
  className,
}: IProps) => {
  const isMobile = useIsMobile();
  const { filters, setFilters, resetFilters } = useFilters(filterKey);
  const { search, setSearch, resetSearch } = useSearch(searchKey ?? filterKey);

  const dirty = hasActiveFilter(filters) || search !== "";

  const handleReset = () => {
    resetFilters();
    resetSearch();
  };

  const searchInput = searchKey && (
    <SearchInput
      value={search}
      placeholder={searchPlaceholder}
      aria-label={searchPlaceholder}
      className={filterSearch}
      onChange={(event) => setSearch(event.target.value)}
    />
  );

  // Phones: search and a Filters sheet share one row; the selects and their
  // Clear live in the sheet, so only the domain's own controls stay in view.
  if (isMobile) {
    return (
      <div className={cn(filterToolbarRoot, className)}>
        {(searchInput || controls.length > 0) && (
          <div className={filterSearchRow}>
            {searchInput}
            {controls.length > 0 && <FilterSheet filterKey={filterKey} controls={controls} />}
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={cn(filterToolbarRoot, className)}>
      {searchInput}

      <div className={filterControls}>
        {controls.map((control) => (
          <FilterSelect
            key={control.key}
            control={control}
            value={filters[control.key]}
            onChange={(value) => setFilters({ [control.key]: value })}
            className={filterSelect}
          />
        ))}

        {children}

        {dirty && (
          <Button variant="ghost" className={filterReset} onPress={handleReset}>
            <X />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterToolbar;
