import ContentView from "../../components/common/view/ContentView";
import UserPasswordModal from "../../components/user/modal/UserPasswordModal";
import UserDetailPanel from "../../components/user/panels/UserDetailPanel";
import { ROUTES } from "../../routes/route.paths";

const UserDetailView = () => (
  <ContentView back={{ label: "Team", path: ROUTES.users }}>
    <UserDetailPanel />
    <UserPasswordModal />
  </ContentView>
);

export default UserDetailView;
