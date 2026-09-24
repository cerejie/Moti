import HomeWelcome from "../../components/home/cards/HomeWelcome";
import ContentView from "../../components/common/view/ContentView";

const HomeView = () => (
  <ContentView title="Home" subtitle="Inventory for your motorcycle shop">
    <HomeWelcome />
  </ContentView>
);

export default HomeView;
