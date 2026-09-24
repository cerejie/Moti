import type { ReactNode } from "react";
import type { FieldValues, Path } from "react-hook-form";

export type IFieldType =
  | "text"
  | "textarea"
  | "email"
  | "password"
  | "number"
  | "amount"
  | "phone"
  | "mobile"
  | "select"
  | "multiselect"
  | "checkbox"
  | "readonly";

export type IFieldSpan = "half" | "full";

export interface IFieldOption {
  value: string;
  label: string;
  // Shown but not pickable, e.g. a document type another slot already uses.
  disabled?: boolean;
}

export interface IFieldConfig<TValues extends FieldValues = FieldValues> {
  name: Path<TValues>;
  label: string;
  type: IFieldType;
  span?: IFieldSpan;
  required?: boolean;
  options?: IFieldOption[];
  placeholder?: string;
  description?: ReactNode;
  prefix?: string;
  icon?: ReactNode;
  autoComplete?: string;
  allowClear?: boolean;
  disabled?: boolean;
  // Reshapes a text field's value on every keystroke, e.g. inserting dashes.
  mask?: (value: string) => string;
  hidden?: (values: TValues) => boolean;
}

export interface IFieldSection<TValues extends FieldValues = FieldValues> {
  key: string;
  title: string;
  description?: string;
  fields: IFieldConfig<TValues>[];
}
