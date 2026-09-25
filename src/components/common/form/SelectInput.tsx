import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/cn.utils";
import type { IFieldOption, ISelectAction } from "../../../models/common/field.model";
import { fieldSelect } from "../../../styles/form/field.styles";

type IProps = {
  // Lets a LabeledField's label point at the trigger.
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: IFieldOption[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  className?: string;
  // Type to filter the options — for lists too long to scroll through.
  searchable?: boolean;
  // Adds the placeholder as a first option, so a picked value can be cleared again.
  allowClear?: boolean;
  // A last entry that runs an action and leaves the value as it was.
  action?: ISelectAction;
};

// aria keys can't be empty strings, so the clear option carries its own key.
const clearKey = "__clear__";
const actionKey = "__action__";

const SelectInput = ({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  invalid,
  label,
  className,
  searchable = false,
  allowClear = false,
  action,
}: IProps) => {
  if (searchable) {
    return (
      <Combobox
        value={value === "" ? null : value}
        onChange={(key) => onValueChange(key === null ? "" : String(key))}
        isDisabled={disabled}
        isInvalid={invalid}
        aria-label={label}
        menuTrigger="focus"
        allowsEmptyCollection
        className={cn(fieldSelect, className)}
      >
        <ComboboxInput id={id} placeholder={placeholder} disabled={disabled} />
        <ComboboxContent>
          <ComboboxList
            renderEmptyState={() => (
              <ComboboxEmpty>No match found.</ComboboxEmpty>
            )}
          >
            {options.map((option) => (
              <ComboboxItem
                key={option.value}
                id={option.value}
                isDisabled={option.disabled}
              >
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  }

  return (
    <Select
      // An empty string means "nothing picked", which aria models as null.
      value={value === "" ? null : value}
      onChange={(key) => {
        if (key === actionKey) return action?.onSelect();
        onValueChange(key === null || key === clearKey ? "" : String(key));
      }}
      placeholder={placeholder}
      isDisabled={disabled}
      isInvalid={invalid}
      aria-label={label}
      className={cn(fieldSelect, className)}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {allowClear && <SelectItem id={clearKey}>{placeholder}</SelectItem>}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              id={option.value}
              isDisabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
          {action && <SelectItem id={actionKey}>{action.label}</SelectItem>}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectInput;
