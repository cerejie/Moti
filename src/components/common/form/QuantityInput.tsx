import { useEffect, useRef } from "react";
import { quantityInput } from "../../../styles/form/field.styles";
import TextInput from "./TextInput";

type IProps = {
  label: string;
  value: number | null;
  min: number;
  max?: number;
  // Blank is a real answer (not counted yet) instead of falling back to the minimum.
  allowEmpty?: boolean;
  placeholder?: string;
  onChange: (value: number | null) => void;
};

const clamp = (value: number, min: number, max: number | undefined) =>
  Math.max(min, Math.min(Math.floor(value), max ?? Number.MAX_SAFE_INTEGER));

// A typed whole number: a counter sells, receives and counts small parts by the dozen.
const QuantityInput = ({ label, value, min, max, allowEmpty, placeholder, onChange }: IProps) => {
  const input = useRef<HTMLInputElement>(null);

  // Buttons beside it change the value too; typing is never overwritten.
  useEffect(() => {
    const field = input.current;
    if (field && document.activeElement !== field) field.value = value === null ? "" : String(value);
  }, [value]);

  return (
    <TextInput
      ref={input}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      enterKeyHint="done"
      autoComplete="off"
      aria-label={label}
      placeholder={placeholder}
      className={quantityInput}
      defaultValue={value ?? ""}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const text = event.currentTarget.value.trim();
        if (text === "" && allowEmpty) return onChange(null);
        const typed = Number.parseInt(text, 10);
        if (typed >= min) onChange(clamp(typed, min, max));
      }}
      onBlur={(event) => {
        const typed = Number.parseInt(event.currentTarget.value, 10);
        if (Number.isNaN(typed) && allowEmpty) {
          onChange(null);
          event.currentTarget.value = "";
          return;
        }
        const next = clamp(Number.isNaN(typed) ? min : typed, min, max);
        onChange(next);
        event.currentTarget.value = String(next);
      }}
      onKeyDown={(event) => {
        // Enter here means "done typing", not "submit the form".
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
};

export default QuantityInput;
