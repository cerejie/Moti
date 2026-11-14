import { Settings2 } from "lucide-react";
import { useBranchScope } from "../../../hook/data/branch/branch.scope.hook";
import ScopeMenu from "../../common/layout/ScopeMenu";

// Hidden for an employee with one branch, and while the list loads.
const BranchSwitcher = () => {
  const { enabled, loading, canManage, branch, branches, setBranch, goToManageBranches } =
    useBranchScope();

  if (!enabled || loading) return null;

  return (
    <ScopeMenu
      title="Branch"
      allLabel="All branches"
      options={branches.map((item) => ({ id: item.id, label: item.name }))}
      selectedId={branch?.id ?? null}
      onSelect={setBranch}
      extraAction={
        canManage
          ? {
              key: "manage-branches",
              label: "Manage branches",
              icon: <Settings2 />,
              onSelect: goToManageBranches,
            }
          : undefined
      }
    />
  );
};

export default BranchSwitcher;
