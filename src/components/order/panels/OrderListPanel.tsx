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

// A planning list only: it never adds stock or places an order. Add stock records what arrived.
const OrderListPanel = () => {
  const { query, list, lines, itemCount } = useOrderList();
  const share = useShareOrderList();
  const receive = useReceiveOrderList();

  if (query.isLoading) return <EmptyState loading description="Opening the buying list…" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!list || itemCount === 0) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="The buying list is empty"
        description="Add products from What to buy. Each one comes with its suggested quantity."
        action={
          <AppButton variant="outline" href={ROUTES.whatToBuy}>
            Go to What to buy
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
            Buying list
          </span>
          <span className={itemMeta}>{formatCount(itemCount, "product")} to buy</span>
        </span>
        <span className={orderBarActions}>
          <AppButton size="icon-lg" variant="outline" aria-label="Share the buying list" onPress={() => share(lines)}>
            <Share2 />
          </AppButton>
          <AppButton size="lg" onPress={() => receive(list)}>
            <PackageCheck />
            Add stock
          </AppButton>
        </span>
      </div>
    </div>
  );
};

export default OrderListPanel;
