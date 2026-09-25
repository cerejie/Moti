import ContentView from "../../components/common/view/ContentView";
import TemporaryPasswordModal from "../../components/user/modal/TemporaryPasswordModal";
import UserFormModal from "../../components/user/modal/UserFormModal";
import UserActions from "../../components/user/panels/UserActions";
import UsersPanel from "../../components/user/panels/UsersPanel";

const UsersView = () => (
  <ContentView
    title="Users"
    subtitle="Who can sign in, their role and access"
    actions={<UserActions />}
  >
    <UsersPanel />
    <UserFormModal />
    <TemporaryPasswordModal />
  </ContentView>
);

export default UsersView;
