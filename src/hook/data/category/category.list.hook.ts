import { useQuery } from "@tanstack/react-query";
import { categoryListKey } from "../../../keys/query.keys";
import type { IFieldOption } from "../../../models/common/field.model";
import categoryServices from "../../../services/data/category.services";

export const useCategoryList = () =>
  useQuery({
    queryKey: [categoryListKey, "all"],
    queryFn: ({ signal }) => categoryServices.getAll(signal),
  });

// Category choices for the item form and the inventory filter.
export const useCategoryOptions = () => {
  const query = useQuery({
    queryKey: [categoryListKey, "options"],
    queryFn: ({ signal }) => categoryServices.getOptions(signal),
    staleTime: 5 * 60_000,
  });

  const options: IFieldOption[] = (query.data ?? []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return { options, categories: query.data ?? [], isLoading: query.isLoading };
};
