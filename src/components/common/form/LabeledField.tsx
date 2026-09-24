import type { ReactNode } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { requiredMark } from "../../../styles/common/typography.styles";
import { fieldErrorReserved } from "../../../styles/form/field.styles";

type IProps = {
  label: ReactNode;
  // Id of the control the label names.
  htmlFor?: string;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  // Keeps the error's line in the layout while there is none, so a message
  // appearing does not push whatever sits below the field.
  reserveError?: boolean;
  // Horizontal puts the control before its label: the checkbox / radio layout.
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
};

// Label, control, hint and error for a control that is not built from an
// IFieldConfig. The FormField equivalent for register()-driven forms.
const LabeledField = ({
  label,
  htmlFor,
  required = false,
  description,
  error,
  reserveError = false,
  orientation = "vertical",
  className,
  children,
}: IProps) => {
  const labelNode = (
    <FieldLabel htmlFor={htmlFor}>
      {label}
      {required && <span className={requiredMark}>*</span>}
    </FieldLabel>
  );

  const details = (
    <>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        reserveError && (
          <FieldError className={fieldErrorReserved}>{" "}</FieldError>
        )
      )}
    </>
  );

  return (
    <Field
      orientation={orientation}
      data-invalid={error ? true : undefined}
      className={className}
    >
      {orientation === "horizontal" ? (
        <>
          {children}
          <FieldContent>
            {labelNode}
            {details}
          </FieldContent>
        </>
      ) : (
        <>
          {labelNode}
          {children}
          {details}
        </>
      )}
    </Field>
  );
};

export default LabeledField;
