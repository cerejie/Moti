import { ROUTES } from "../../../routes/route.paths";
import {
  selectBranchFilter,
  useBranchStore,
} from "../../../store/data/branch/branch.store";
import { usePermissions } from "../account/account.permission.hook";
import { useTransitionNavigate } from "../../layout/navigation.hook";
import { useBranchList } from "./branch.list.hook";

// The header switcher. Nothing is filtered by it until Phases 2–4.
export const useBranchScope = () => {
  const navigate = useTransitionNavigate();
  const { manageBranches } = usePermissions();
  const stored = useBranchStore(selectBranchFilter);
  const setBranch = useBranchStore((state) => state.setBranchFilter);
  const { query, activeBranches } = useBranchList();

  // A remembered branch that is archived or out of reach reads as "All branches".
  const branch = activeBranches.find((item) => item.id === stored) ?? null;

  return {
    // Owners always see it, so Manage branches stays reachable with one branch.
    enabled: manageBranches || activeBranches.length > 1,
    loading: query.isLoading,
    canManage: manageBranches,
    branch,
    branches: activeBranches,
    setBranch,
    goToManageBranches: () => navigate(ROUTES.branches),
  };
};
