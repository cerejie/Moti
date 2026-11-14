import { useQuery } from "@tanstack/react-query";
import { branchListKey } from "../../../keys/query.keys";
import branchServices from "../../../services/data/branch.services";

export const useBranchList = () => {
  const query = useQuery({
    queryKey: [branchListKey],
    queryFn: ({ signal }) => branchServices.getAll(signal),
    staleTime: 5 * 60_000,
  });

  const branches = query.data ?? [];

  return {
    query,
    branches,
    activeBranches: branches.filter((branch) => branch.archived_at === null),
  };
};
