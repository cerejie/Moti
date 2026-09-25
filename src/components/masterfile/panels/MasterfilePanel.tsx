import { Store } from "lucide-react";
import StateBox from "../../common/status/StateBox";
import ViewTabs from "../../common/view/ViewTabs";
import { masterfileTabLabels, type MasterfileTab } from "../../../enums/masterfile.enum";
import { useMasterfileTab } from "../../../hook/data/masterfile/masterfile.list.hook";
import { useActiveShop } from "../../../hook/data/shop/shop.list.hook";
import BrandListPanel from "./BrandListPanel";
import CategoryListPanel from "./CategoryListPanel";
import MasterfileEntryPanel from "./MasterfileEntryPanel";

const MasterfilePanel = () => {
  const { shopId } = useActiveShop();
  const { tab, setTab } = useMasterfileTab();

  if (!shopId) {
    return (
      <StateBox icon={<Store />} title="Choose a shop">
        Pick a shop from the switcher at the top to manage its masterfile.
      </StateBox>
    );
  }

  return (
    <ViewTabs
      label="Masterfile lists"
      value={tab}
      onValueChange={(value) => setTab(value as MasterfileTab)}
      tabs={[
        { key: "categories", label: masterfileTabLabels.categories, content: <CategoryListPanel /> },
        { key: "brands", label: masterfileTabLabels.brands, content: <BrandListPanel /> },
        { key: "units", label: masterfileTabLabels.units, content: <MasterfileEntryPanel kind="unit" /> },
        {
          key: "locations",
          label: masterfileTabLabels.locations,
          content: <MasterfileEntryPanel kind="location" />,
        },
      ]}
    />
  );
};

export default MasterfilePanel;
