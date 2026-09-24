import { Checkbox } from "@/components/ui/checkbox";

type IProps = {
  // Lands on the hidden input, so a label's htmlFor reaches it.
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  className?: string;
};

// Standalone checkbox for the rows that are not built from an IFieldConfig.
const CheckboxInput = ({
  id,
  checked,
  onCheckedChange,
  disabled,
  "aria-invalid": invalid,
  "aria-label": ariaLabel,
  className,
}: IProps) => {
  return (
    <Checkbox
      id={id}
      isSelected={checked}
      onChange={onCheckedChange}
      isDisabled={disabled}
      isInvalid={invalid}
      aria-label={ariaLabel}
      className={className}
    />
  );
};

export default CheckboxInput;
