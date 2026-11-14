import { branchScopedTableKeys } from "../../../keys/table.keys";
import { ROUTES } from "../../../routes/route.paths";
import { usePaginationStore } from "../../../store/common/pagination.store";
import {
  selectBranchFilter,
  useBranchStore,
} from "../../../store/data/branch/branch.store";
import {
  selectCountBranch,
  selectCountLines,
  useCountStore,
} from "../../../store/data/count/count.store";
import {
  selectDeliveryBranch,
  selectDeliveryLines,
  useDeliveryStore,
} from "../../../store/data/delivery/delivery.store";
import {
  selectCartBranch,
  selectCartLines,
  useCartStore,
} from "../../../store/data/transaction/transaction.store";
import { useConfirm } from "../../common/confirmation.hook";
import { usePermissions } from "../account/account.permission.hook";
import { useTransitionNavigate } from "../../layout/navigation.hook";
import { useBranchList } from "./branch.list.hook";

// Something being built for one branch that a switch would move to another.
type IBranchDraft = {
  name: string;
  size: number;
  branchId: string | null;
  clear: () => void;
};

// "cart", "cart and delivery", "cart, delivery and stock count".
const joinNames = (names: readonly string[]) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

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
  const drafts: IBranchDraft[] = [
    {
      name: "sale",
      size: useCartStore(selectCartLines).length,
      branchId: useCartStore(selectCartBranch),
      clear: useCartStore((state) => state.clear),
    },
    {
      name: "added stock",
      size: useDeliveryStore(selectDeliveryLines).length,
      branchId: useDeliveryStore(selectDeliveryBranch),
      clear: useDeliveryStore((state) => state.clear),
    },
    {
      name: "stock count",
      size: useCountStore(selectCountLines).length,
      branchId: useCountStore(selectCountBranch),
      clear: useCountStore((state) => state.clear),
    },
  ];
  const { query, branch, activeBranches } = useActiveBranch();

  const apply = (branchId: string | null) => {
    setBranchFilter(branchId);
    branchScopedTableKeys.forEach(resetPagination);
  };

  // A cart, delivery or count belongs to one branch, so a switch that moves it empties it first.
  const setBranch = (branchId: string | null) => {
    const nextWrite =
      branchId ?? (activeBranches.length === 1 ? activeBranches[0].id : null);
    const moved = drafts.filter(
      (draft) => draft.size > 0 && draft.branchId !== null && draft.branchId !== nextWrite,
    );
    if (moved.length === 0) {
      apply(branchId);
      return;
    }

    const from = activeBranches.find((item) => item.id === moved[0].branchId)?.name ?? "this branch";
    const single = moved.length === 1 ? moved[0] : null;
    confirm({
      kind: "danger",
      title: "Switch branch and clear your draft?",
      message: single
        ? `The ${single.name} you started holds ${single.size} product${single.size === 1 ? "" : "s"} from ${from}. It is not moved to another branch: switching clears it.`
        : `The ${joinNames(moved.map((draft) => draft.name))} you started hold products from ${from}. They are not moved to another branch: switching clears them.`,
      okText: single ? `Clear ${single.name} and switch` : "Clear and switch",
      onConfirm: () => {
        moved.forEach((draft) => draft.clear());
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
