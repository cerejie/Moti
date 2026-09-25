import HomeWelcome from "../../components/home/cards/HomeWelcome";
import PasswordReminder from "../../components/home/cards/PasswordReminder";
import ContentView from "../../components/common/view/ContentView";

const HomeView = () => (
  <ContentView title="Home" subtitle="Inventory for your motorcycle shop">
    <PasswordReminder />
    <HomeWelcome />
  </ContentView>
);

export default HomeView;
