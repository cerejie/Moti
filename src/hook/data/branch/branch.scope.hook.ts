import { branchScopedTableKeys } from "../../../keys/table.keys";
import { ROUTES } from "../../../routes/route.paths";
import { usePaginationStore } from "../../../store/common/pagination.store";
import {
  selectBranchFilter,
  useBranchStore,
} from "../../../store/data/branch/branch.store";
import {
  selectCartBranch,
  selectCartLines,
  useCartStore,
} from "../../../store/data/transaction/transaction.store";
import { useConfirm } from "../../common/confirmation.hook";
import { usePermissions } from "../account/account.permission.hook";
import { useTransitionNavigate } from "../../layout/navigation.hook";
import { useBranchList } from "./branch.list.hook";

// The switcher's choice, and the one branch a write lands in.
export const useActiveBranch = () => {
  const stored = useBranchStore(selectBranchFilter);
  const { query, branches, activeBranches } = useBranchList();

  // A remembered branch that is archived or out of reach reads as "All branches".
  const branch = activeBranches.find((item) => item.id === stored) ?? null;
  // "All branches" with only one branch in reach still has a branch to write to.
  const writeBranch = branch ?? (activeBranches.length === 1 ? activeBranches[0] : null);

  return {
    query,
    branch,
    writeBranch,
    branches,
    activeBranches,
    // Archived branches count: their old sales still need naming.
    multiple: branches.length > 1,
  };
};

export const useBranchScope = () => {
  const navigate = useTransitionNavigate();
  const confirm = useConfirm();
  const { manageBranches } = usePermissions();
  const setBranchFilter = useBranchStore((state) => state.setBranchFilter);
  const resetPagination = usePaginationStore((state) => state.resetPagination);
  const cartBranchId = useCartStore(selectCartBranch);
  const cartLines = useCartStore(selectCartLines);
  const clearCart = useCartStore((state) => state.clear);
  const { query, branch, activeBranches } = useActiveBranch();

  const apply = (branchId: string | null) => {
    setBranchFilter(branchId);
    branchScopedTableKeys.forEach(resetPagination);
  };

  // A cart belongs to one branch, so a switch that changes where it sells empties it first.
  const setBranch = (branchId: string | null) => {
    const nextWrite =
      branchId ?? (activeBranches.length === 1 ? activeBranches[0].id : null);
    if (cartLines.length === 0 || nextWrite === cartBranchId) {
      apply(branchId);
      return;
    }

    const from = activeBranches.find((item) => item.id === cartBranchId)?.name ?? "this branch";
    const count = cartLines.length;
    confirm({
      kind: "danger",
      title: "Switch branch?",
      message: `The cart holds ${count} item${count === 1 ? "" : "s"} from ${from}. Switching clears it.`,
      okText: "Clear cart and switch",
      onConfirm: () => {
        clearCart();
        apply(branchId);
      },
    });
  };

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
