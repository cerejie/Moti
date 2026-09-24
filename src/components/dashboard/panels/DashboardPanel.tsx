import { Store } from "lucide-react";
import StateBox from "../../common/status/StateBox";
import { useActiveShop } from "../../../hook/data/shop/shop.list.hook";
import { dashboardStack } from "../../../styles/dashboard/dashboard.styles";
import RecentMovementsCard from "../cards/RecentMovementsCard";
import StockAlertsCard from "../cards/StockAlertsCard";
import StockSummaryCards from "../cards/StockSummaryCards";

const DashboardPanel = () => {
  const { shopId } = useActiveShop();

  if (!shopId) {
    return (
      <StateBox icon={<Store />} title="Choose a shop">
        Pick a shop from the switcher at the top to see its dashboard.
      </StateBox>
    );
  }

  return (
    <div className={dashboardStack}>
      <StockSummaryCards />
      <StockAlertsCard />
      <RecentMovementsCard />
    </div>
  );
};

export default DashboardPanel;
