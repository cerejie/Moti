import ContentView from "../../components/common/view/ContentView";
import DashboardPanel from "../../components/dashboard/panels/DashboardPanel";

const DashboardView = () => (
  <ContentView title="Dashboard" subtitle="Stock levels, items that need attention and the latest movements">
    <DashboardPanel />
  </ContentView>
);

export default DashboardView;
