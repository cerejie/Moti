import type { Selection } from "react-aria-components";
import { ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFilters } from "../../../hook/common/filter.hook";
import type { IFilterControl } from "../../../models/common/filter.model";
import {
  columnFilterItem,
  columnFilterMenu,
  columnFilterTrigger,
} from "../../../styles/table/table.styles";

// Same sentinel as FilterSelect, so "All" clears the filter from the menu itself.
const ALL_VALUE = "__all__";

type IProps = {
  // The table's filter key; the toolbar selects read and write the same store.
  filterKey: string;
  control: IFilterControl;
};

// A column title that filters its column: press it, pick a value.
const ColumnFilterMenu = ({ filterKey, control }: IProps) => {
  const { filters, setFilters } = useFilters(filterKey);
  const value = filters[control.key];
  const active = value !== undefined && value !== null && value !== "";

  const handleChange = (keys: Selection) => {
    if (keys === "all") return;
    const [key] = keys;
    setFilters({ [control.key]: key === undefined || key === ALL_VALUE ? undefined : String(key) });
  };

  return (
    <DropdownMenuTrigger>
      <Button
        variant="ghost"
        size="sm"
        className={columnFilterTrigger({ active })}
        aria-label={`Filter by ${control.label.toLowerCase()}`}
      >
        {control.label}
        {active ? <ListFilter /> : <ChevronDown />}
      </Button>
      <DropdownMenu
        aria-label={`Filter by ${control.label.toLowerCase()}`}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[active ? String(value) : ALL_VALUE]}
        onSelectionChange={handleChange}
        className={columnFilterMenu}
      >
        <DropdownMenuItem id={ALL_VALUE} className={columnFilterItem}>
          {control.placeholder ?? `All ${control.label.toLowerCase()}`}
        </DropdownMenuItem>
        {control.options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            id={option.value}
            textValue={option.label}
            isDisabled={option.disabled}
            className={columnFilterItem}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
};

export default ColumnFilterMenu;
