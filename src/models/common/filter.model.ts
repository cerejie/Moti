import type { IFieldOption } from "./field.model";

export type IFilterValue = string | number | boolean | null;

export type IFilterValues = Record<string, IFilterValue | undefined>;

// A select filter. Anything richer belongs in the domain's own toolbar slot.
export type IFilterControl = {
  key: string;
  label: string;
  placeholder?: string;
  options: IFieldOption[];
};

const isSet = (value: IFilterValue | undefined) =>
  value !== undefined && value !== null && value !== "";

export const hasActiveFilter = (filters: IFilterValues) =>
  Object.values(filters).some(isSet);

export const countActiveControls = (filters: IFilterValues, controls: IFilterControl[]) =>
  controls.filter((control) => isSet(filters[control.key])).length;
