import { UserPlus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import { useUserFormModal } from "../../../hook/data/user/user.form.hook";

const UserActions = () => {
  const { isSuperadmin } = usePermissions();
  const { openCreate } = useUserFormModal();

  return (
    <AppButton onPress={openCreate}>
      <UserPlus />
      {isSuperadmin ? "Add user" : "Add employee"}
    </AppButton>
  );
};

export default UserActions;
