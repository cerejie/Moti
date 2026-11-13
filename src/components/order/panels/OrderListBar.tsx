import { ClipboardList } from "lucide-react";
import { useOrderList } from "../../../hook/data/order/order.list.hook";
import { ROUTES } from "../../../routes/route.paths";
import { itemMeta } from "../../../styles/inventory/inventory.styles";
import { cartBar, cartBarText, cartBarTotal } from "../../../styles/transaction/transaction.styles";
import { formatCount } from "../../../utils/format.utils";
import AppButton from "../../common/button/AppButton";

// Shows once something is on the order list; the list itself is adjusted and shared on its page.
const OrderListBar = () => {
  const { itemCount, lines } = useOrderList();

  if (itemCount === 0) return null;

  return (
    <div className={cartBar}>
      <span className={cartBarText}>
        <span className={cartBarTotal}>Order list · {formatCount(itemCount, "item")}</span>
        <span className={itemMeta}>
          {formatCount(
            lines.reduce((sum, line) => sum + line.quantity, 0),
            "pc",
          )}{" "}
          to order
        </span>
      </span>
      <AppButton size="lg" href={ROUTES.orderList}>
        <ClipboardList />
        Open list
      </AppButton>
    </div>
  );
};

export default OrderListBar;
