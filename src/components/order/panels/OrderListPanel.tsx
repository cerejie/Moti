import { ClipboardList, PackageCheck, Share2 } from "lucide-react";
import {
  useReceiveOrderList,
  useShareOrderList,
} from "../../../hook/data/order/order.form.hook";
import { useOrderList } from "../../../hook/data/order/order.list.hook";
import { ROUTES } from "../../../routes/route.paths";
import { itemMeta } from "../../../styles/inventory/inventory.styles";
import { orderBarActions, orderListStack } from "../../../styles/order/order.styles";
import { cartBar, cartBarText, cartBarTotal } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import OrderLineList from "../lists/OrderLineList";

// What to buy: adjusted here, shared with the supplier, then received in one save.
const OrderListPanel = () => {
  const { query, list, lines, itemCount } = useOrderList();
  const share = useShareOrderList();
  const receive = useReceiveOrderList();

  if (query.isLoading) return <EmptyState loading description="Opening the order list…" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!list || itemCount === 0) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="The order list is empty"
        description="Add items from Stock · Reorder. Each one comes with its suggested quantity."
        action={
          <AppButton variant="outline" href={ROUTES.movements}>
            Go to Reorder
          </AppButton>
        }
      />
    );
  }

  return (
    <div className={orderListStack}>
      <OrderLineList lines={lines} />

      <div className={cartBar}>
        <span className={cartBarText}>
          <span className={cartBarTotal}>
            {formatCount(
              lines.reduce((sum, line) => sum + line.quantity, 0),
              "pc",
            )}
          </span>
          <span className={itemMeta}>{formatCount(itemCount, "item")}</span>
        </span>
        <span className={orderBarActions}>
          <AppButton size="icon-lg" variant="outline" aria-label="Share the order list" onPress={() => share(lines)}>
            <Share2 />
          </AppButton>
          <AppButton size="lg" onPress={() => receive(list)}>
            <PackageCheck />
            Receive
          </AppButton>
        </span>
      </div>
    </div>
  );
};

export default OrderListPanel;
