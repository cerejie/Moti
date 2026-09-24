import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDisclosure } from "../../../hook/common/disclosure.hook";
import AppTooltip from "../view/AppTooltip";

type IProps = Omit<ComponentProps<typeof InputGroupInput>, "type"> & {
  // Disclosure slot holding the reveal state, scoped by screen.
  revealKey: string;
};

// Password control with a show / hide toggle inside the field.
const PasswordInput = ({ revealKey, className, ...props }: IProps) => {
  const reveal = useDisclosure(revealKey);
  const toggleLabel = reveal.open ? "Hide password" : "Show password";

  return (
    <InputGroup className={className}>
      <InputGroupInput {...props} type={reveal.open ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <AppTooltip label={toggleLabel}>
          <InputGroupButton
            size="icon-xs"
            aria-label={toggleLabel}
            aria-pressed={reveal.open}
            onClick={reveal.toggle}
          >
            {reveal.open ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </AppTooltip>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default PasswordInput;
