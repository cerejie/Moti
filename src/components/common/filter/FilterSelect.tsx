import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IFilterControl, IFilterValue } from "../../../models/common/filter.model";

// An explicit "All" item, so the user can clear a filter from the list
// itself instead of only through the Clear button.
const ALL_VALUE = "__all__";

type IProps = {
  control: IFilterControl;
  value: IFilterValue | undefined;
  onChange: (value: string | undefined) => void;
  className?: string;
};

const FilterSelect = ({ control, value, onChange, className }: IProps) => (
  <Select
    value={value === undefined || value === null || value === "" ? ALL_VALUE : String(value)}
    onChange={(key) => onChange(key === null || key === ALL_VALUE ? undefined : String(key))}
    placeholder={control.placeholder ?? control.label}
    aria-label={control.label}
    className={className}
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

export default FilterSelect;
