import { useFilters } from "../../../hook/common/filter.hook";
import { masterfileTabKey } from "../../../keys/table.keys";
import BrandCreateButton from "../../brand/menus/BrandCreateButton";
import BrandTable from "../../brand/tables/BrandTable";
import CategoryCreateButton from "../../category/menus/CategoryCreateButton";
import CategoryTable from "../../category/tables/CategoryTable";
import ViewTabs from "../../common/view/ViewTabs";

type IMasterfileTab = "categories" | "brands";

// Categories and brands the owner can rename or delete; new ones can also be
// typed straight into the item form.
const MasterfilePanel = () => {
  const { filters, setFilters } = useFilters<{ tab?: IMasterfileTab }>(masterfileTabKey);
  const tab = filters.tab ?? "categories";

  return (
    <ViewTabs
      label="Masterfile"
      value={tab}
      onValueChange={(next) => setFilters({ tab: next as IMasterfileTab })}
      actions={tab === "categories" ? <CategoryCreateButton /> : <BrandCreateButton />}
      tabs={[
        { key: "categories", label: "Categories", content: <CategoryTable /> },
        { key: "brands", label: "Brands", content: <BrandTable /> },
      ]}
    />
  );
};

export default MasterfilePanel;
