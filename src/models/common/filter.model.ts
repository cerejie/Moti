export type IFilterValue = string | number | boolean | null;

export type IFilterValues = Record<string, IFilterValue | undefined>;

export const hasActiveFilter = (filters: IFilterValues) =>
  Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== "",
  );
