import { UserPlus } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { userCreateModalKey } from "../../../keys/modal.keys";
import AppButton from "../../common/button/AppButton";

const UserCreateButton = () => {
  const { openModal } = useModal(userCreateModalKey);

  return (
    <AppButton onPress={() => openModal()}>
      <UserPlus />
      Add account
    </AppButton>
  );
};

export default UserCreateButton;
