import AppAlert from "../../common/status/AppAlert";
import { formatPeso } from "../../../utils/format.utils";
import {
  cartTotal,
  cartTotalLabel,
  cartTotalRow,
  cartTotalValue,
} from "../../../styles/transaction/transaction.styles";

type IProps = {
  total: number;
  errorText: string | null;
};

// The total amount, and why the last confirm was refused.
const CartTotal = ({ total, errorText }: IProps) => (
  <div className={cartTotal}>
    {errorText && <AppAlert tone="danger">{errorText}</AppAlert>}
    <div className={cartTotalRow}>
      <span className={cartTotalLabel}>Total amount</span>
      <span className={cartTotalValue}>{formatPeso(total)}</span>
    </div>
  </div>
);

export default CartTotal;
