import { Plus } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { branchFormModalKey } from "../../../keys/modal.keys";
import type { IBranch } from "../../../models/data/branch/branch.response";
import AppButton from "../../common/button/AppButton";

const BranchCreateButton = () => {
  const { openModal } = useModal<IBranch>(branchFormModalKey);

  return (
    <AppButton onPress={() => openModal()}>
      <Plus />
      Add branch
    </AppButton>
  );
};

export default BranchCreateButton;
