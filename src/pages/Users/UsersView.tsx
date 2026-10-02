import ContentView from "../../components/common/view/ContentView";
import UserCreateButton from "../../components/user/menus/UserCreateButton";
import UserCreateModal from "../../components/user/modal/UserCreateModal";
import UserPasswordModal from "../../components/user/modal/UserPasswordModal";
import UserTable from "../../components/user/tables/UserTable";

const UsersView = () => (
  <ContentView
    title="Team"
    subtitle="Approve sign-ups, add staff and handle password resets"
    actions={<UserCreateButton />}
  >
    <UserTable />
    <UserCreateModal />
    <UserPasswordModal />
  </ContentView>
);

export default UsersView;
