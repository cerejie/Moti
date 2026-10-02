import PushPromptNotice from "../../components/account/cards/PushPromptNotice";
import BentoCell from "../../components/common/view/BentoCell";
import BentoGrid from "../../components/common/view/BentoGrid";
import ContentView from "../../components/common/view/ContentView";
import InventorySummaryCards from "../../components/dashboard/cards/InventorySummaryCards";
import AttentionPanel from "../../components/dashboard/panels/AttentionPanel";
import RecentMovementsPanel from "../../components/dashboard/panels/RecentMovementsPanel";
import StockMovementModal from "../../components/inventory/modal/StockMovementModal";

const DashboardView = () => (
  <ContentView title="Dashboard" subtitle="Stock levels at a glance" layout="bento">
    <PushPromptNotice />
    <InventorySummaryCards />

    <BentoGrid>
      <BentoCell span="half">
        <AttentionPanel />
      </BentoCell>
      <BentoCell span="half">
        <RecentMovementsPanel />
      </BentoCell>
    </BentoGrid>

    <StockMovementModal />
  </ContentView>
);

export default DashboardView;
