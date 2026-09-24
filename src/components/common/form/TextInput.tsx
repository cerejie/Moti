import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

// InputGroupInput takes plain input props, which Input accepts as well.
type IProps = ComponentProps<typeof InputGroupInput> & {
  // Rendered inside the field at its trailing edge, e.g. an invalid marker.
  // Pass it on every render (null when empty) so the control is not remounted
  // - and does not lose focus - when the marker comes and goes.
  endAdornment?: ReactNode;
};

// Plain text control for the rows that are not built from an IFieldConfig.
const TextInput = ({ endAdornment, ...props }: IProps) => {
  if (endAdornment === undefined) {
    return <Input {...props} />;
  }

  return (
    <InputGroup>
      <InputGroupInput {...props} />
      <InputGroupAddon align="inline-end">{endAdornment}</InputGroupAddon>
    </InputGroup>
  );
};

export default TextInput;
