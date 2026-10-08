import type { MasterfileTab } from "../../../enums/masterfile.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { masterfileTabKey } from "../../../keys/table.keys";
import BrandTable from "../../brand/tables/BrandTable";
import CategoryTable from "../../category/tables/CategoryTable";

// Categories and brands the owner can rename or delete; new ones can also be
// typed straight into the item form.
const MasterfilePanel = () => {
  const { filters } = useFilters<{ tab?: MasterfileTab }>(masterfileTabKey);

  return filters.tab === "brands" ? <BrandTable /> : <CategoryTable />;
};

export default MasterfilePanel;
