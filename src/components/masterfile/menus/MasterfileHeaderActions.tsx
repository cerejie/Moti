import type { MasterfileTab } from "../../../enums/masterfile.enum";
import { useFilters } from "../../../hook/common/filter.hook";
import { masterfileTabKey } from "../../../keys/table.keys";
import BrandCreateButton from "../../brand/menus/BrandCreateButton";
import CategoryCreateButton from "../../category/menus/CategoryCreateButton";

// The add button follows the open tab.
const MasterfileHeaderActions = () => {
  const { filters } = useFilters<{ tab?: MasterfileTab }>(masterfileTabKey);

  return filters.tab === "brands" ? <BrandCreateButton /> : <CategoryCreateButton />;
};

export default MasterfileHeaderActions;
