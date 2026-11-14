import { Store } from "lucide-react";
import { useBranchScope } from "../../../hook/data/branch/branch.scope.hook";
import { branchPickActions } from "../../../styles/branch/branch.styles";
import AppButton from "../../common/button/AppButton";
import EmptyState from "../../common/status/EmptyState";

type IProps = {
  title: string;
  description: string;
};

// "All branches" is view-only: a write asks for its branch here, and the pick sets the switcher.
const BranchPickPanel = ({ title, description }: IProps) => {
  const { branches, setBranch } = useBranchScope();

  if (branches.length === 0) {
    return (
      <EmptyState
        icon={<Store />}
        title="No branch yet"
        description="You are not assigned to a branch yet. Ask the owner to add you to one."
      />
    );
  }

  return (
    <EmptyState
      icon={<Store />}
      title={title}
      description={description}
      action={
        <div className={branchPickActions}>
          {branches.map((branch) => (
            <AppButton
              key={branch.id}
              size="lg"
              variant="outline"
              onPress={() => setBranch(branch.id)}
            >
              {branch.name}
            </AppButton>
          ))}
        </div>
      }
    />
  );
};

export default BranchPickPanel;
