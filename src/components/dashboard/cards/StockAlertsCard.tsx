import TablePanel from "../../common/table/TablePanel";
import { useStockAlerts } from "../../../hook/data/dashboard/dashboard.list.hook";
import { alertsMore } from "../../../styles/dashboard/dashboard.styles";
import StockAlertTable from "../tables/StockAlertTable";

// The most urgent items; the status tiles above open the full lists.
const StockAlertsCard = () => {
  const { data, isLoading, isError, error, refetch, count, openItem } = useStockAlerts();
  const shown = data?.data.length ?? 0;

  return (
    <TablePanel
      title="Needs attention"
      description="Out of stock, reorder and low items, most urgent first."
      footer={
        count > shown ? (
          <span className={alertsMore}>
            Showing {shown} of {count}. Tap a status above to see them all.
          </span>
        ) : undefined
      }
    >
      <StockAlertTable
        alerts={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        onOpen={openItem}
      />
    </TablePanel>
  );
};

export default StockAlertsCard;
