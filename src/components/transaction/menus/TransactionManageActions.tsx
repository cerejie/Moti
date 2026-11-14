import { Ban } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { transactionVoidModalKey } from "../../../keys/modal.keys";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import {
  detailManageActions,
  detailManageButton,
  detailManageHint,
} from "../../../styles/view/detailPage.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  transaction: ITransaction;
};

const TransactionManageActions = ({ transaction }: IProps) => {
  const voidModal = useModal<ITransaction>(transactionVoidModalKey);

  return (
    <div className={detailManageActions}>
      <AppButton
        size="lg"
        variant="outline"
        tone="dangerSoft"
        onPress={() => voidModal.openModal(transaction)}
        className={detailManageButton}
      >
        <Ban data-icon="inline-start" aria-hidden />
        Cancel sale
      </AppButton>

      <p className={detailManageHint}>
        Cancelling restores the stock. The sale stays in history, marked cancelled.
      </p>
    </div>
  );
};

export default TransactionManageActions;
