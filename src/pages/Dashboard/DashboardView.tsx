import BentoCell from "../../components/common/view/BentoCell";
import BentoGrid from "../../components/common/view/BentoGrid";
import ContentView from "../../components/common/view/ContentView";
import InventorySummaryCards from "../../components/dashboard/cards/InventorySummaryCards";
import AttentionPanel from "../../components/dashboard/panels/AttentionPanel";
import OrderNextPanel from "../../components/dashboard/panels/OrderNextPanel";
import RecentMovementsPanel from "../../components/dashboard/panels/RecentMovementsPanel";
import StockMovementModal from "../../components/inventory/modal/StockMovementModal";
import { dashboardPanels, dashboardStack } from "../../styles/dashboard/dashboard.styles";

const DashboardView = () => (
  <ContentView title="Dashboard" subtitle="Stock levels at a glance" layout="bento">
    <InventorySummaryCards />

    <BentoGrid className={dashboardPanels}>
      <BentoCell span="half">
        <AttentionPanel />
      </BentoCell>
      <BentoCell span="half" className={dashboardStack}>
        <OrderNextPanel />
        <RecentMovementsPanel />
      </BentoCell>
    </BentoGrid>

    <StockMovementModal />
  </ContentView>
);

export default DashboardView;
