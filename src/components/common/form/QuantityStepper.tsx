import { Minus, Plus } from "lucide-react";
import AppButton from "../button/AppButton";
import {
  stepperButton,
  stepperRoot,
  stepperValue,
} from "../../../styles/form/stepper.styles";

type IProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  // Names what is counted, e.g. the item, for screen readers.
  label: string;
};

const QuantityStepper = ({ value, min = 1, max, onChange, label }: IProps) => (
  <div className={stepperRoot} role="group" aria-label={label}>
    <AppButton
      variant="outline"
      size="icon"
      className={stepperButton}
      disabled={value <= min}
      onPress={() => onChange(value - 1)}
      aria-label={`One less ${label}`}
    >
      <Minus />
    </AppButton>
    <span className={stepperValue} aria-live="polite">
      {value}
    </span>
    <AppButton
      variant="outline"
      size="icon"
      className={stepperButton}
      disabled={value >= max}
      onPress={() => onChange(value + 1)}
      aria-label={`One more ${label}`}
    >
      <Plus />
    </AppButton>
  </div>
);

export default QuantityStepper;
