import { Store } from "lucide-react";
import StateBox from "../../common/status/StateBox";
import ViewTabs from "../../common/view/ViewTabs";
import {
  transactionSectionLabels,
  type TransactionSection,
} from "../../../enums/transaction.enum";
import { useActiveShop } from "../../../hook/data/shop/shop.list.hook";
import { useTransactionSection } from "../../../hook/data/transaction/transaction.list.hook";
import NewTransactionPanel from "./NewTransactionPanel";
import TransactionHistoryPanel from "./TransactionHistoryPanel";

const TransactionPanel = () => {
  const { shopId } = useActiveShop();
  const { section, setSection } = useTransactionSection();

  if (!shopId) {
    return (
      <StateBox icon={<Store />} title="Choose a shop">
        Pick a shop from the switcher at the top to sell from its inventory.
      </StateBox>
    );
  }

  return (
    <ViewTabs
      label="Transaction views"
      value={section}
      onValueChange={(value) => setSection(value as TransactionSection)}
      tabs={[
        { key: "new", label: transactionSectionLabels.new, content: <NewTransactionPanel /> },
        {
          key: "history",
          label: transactionSectionLabels.history,
          content: <TransactionHistoryPanel />,
        },
      ]}
    />
  );
};

export default TransactionPanel;
