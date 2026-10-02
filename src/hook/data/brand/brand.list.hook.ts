import { useQuery } from "@tanstack/react-query";
import { brandListKey } from "../../../keys/query.keys";
import type { IFieldOption } from "../../../models/common/field.model";
import brandServices from "../../../services/data/brand.services";

export const useBrandList = () =>
  useQuery({
    queryKey: [brandListKey, "all"],
    queryFn: ({ signal }) => brandServices.getAll(signal),
  });

// Brand choices for the item form and the inventory and transaction filters.
export const useBrandOptions = () => {
  const query = useQuery({
    queryKey: [brandListKey, "options"],
    queryFn: ({ signal }) => brandServices.getOptions(signal),
    staleTime: 5 * 60_000,
  });

  const options: IFieldOption[] = (query.data ?? []).map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));

  return { options, brands: query.data ?? [], isLoading: query.isLoading };
};
