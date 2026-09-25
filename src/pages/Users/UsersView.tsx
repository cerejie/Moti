import ContentView from "../../components/common/view/ContentView";
import TemporaryPasswordModal from "../../components/user/modal/TemporaryPasswordModal";
import UserFormModal from "../../components/user/modal/UserFormModal";
import UserActions from "../../components/user/panels/UserActions";
import UsersPanel from "../../components/user/panels/UsersPanel";
import { ROUTES } from "../../routes/route.paths";

const UsersView = () => (
  <ContentView back={{ label: "Settings", path: ROUTES.settings }} actions={<UserActions />}>
    <UsersPanel />
    <UserFormModal />
    <TemporaryPasswordModal />
  </ContentView>
);

export default UsersView;
