import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/cn.utils";
import { useFilters } from "../../../hook/common/filter.hook";
import { useSearch } from "../../../hook/common/search.hook";
import type { IFieldOption } from "../../../models/common/field.model";
import { hasActiveFilter } from "../../../models/common/filter.model";
import {
  filterControls,
  filterReset,
  filterSearch,
  filterSelect,
  filterToolbarRoot,
} from "../../../styles/filter/filterToolbar.styles";
import SearchInput from "../form/SearchInput";

// A select filter. Anything richer belongs in the domain's own toolbar slot.
export type IFilterControl = {
  key: string;
  label: string;
  placeholder?: string;
  options: IFieldOption[];
};

// An explicit "All" item, so the user can clear a filter from the list
// itself instead of only through the Clear button.
const ALL_VALUE = "__all__";

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
  const { filters, setFilters, resetFilters } = useFilters(filterKey);
  const { search, setSearch, resetSearch } = useSearch(searchKey ?? filterKey);

  const dirty = hasActiveFilter(filters) || search !== "";

  const handleReset = () => {
    resetFilters();
    resetSearch();
  };

  return (
    <div className={cn(filterToolbarRoot, className)}>
      {searchKey && (
        <SearchInput
          value={search}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className={filterSearch}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}

      <div className={filterControls}>
        {controls.map((control) => {
          const current = filters[control.key];

          return (
            <Select
              key={control.key}
              value={current === undefined || current === "" ? ALL_VALUE : String(current)}
              onChange={(key) =>
                setFilters({
                  [control.key]: key === null || key === ALL_VALUE ? undefined : String(key),
                })
              }
              placeholder={control.placeholder ?? control.label}
              aria-label={control.label}
              className={filterSelect}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem id={ALL_VALUE}>
                    {control.placeholder ?? `All ${control.label.toLowerCase()}`}
                  </SelectItem>
                  {control.options.map((option) => (
                    <SelectItem key={option.value} id={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          );
        })}

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
