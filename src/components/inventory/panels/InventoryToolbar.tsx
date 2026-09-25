import FilterToolbar from "../../common/filter/FilterToolbar";
import SelectInput from "../../common/form/SelectInput";
import SegmentTabs from "../../common/view/SegmentTabs";
import {
  inventorySortLabels,
  inventoryTabLabels,
  type InventorySort,
  type InventoryTab,
} from "../../../enums/inventory.enum";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import {
  useInventorySort,
  useInventoryTab,
} from "../../../hook/data/inventory/inventory.list.hook";
import { inventoryTableKey } from "../../../keys/table.keys";
import { filterSelect } from "../../../styles/filter/filterToolbar.styles";
import {
  inventoryTabsScroll,
  inventoryToolbar,
} from "../../../styles/inventory/inventory.styles";

type IProps = {
  // Archived items are a manager's concern; staff never see the tab.
  showArchived: boolean;
};

const statusTabs: InventoryTab[] = ["all", "in_stock", "low", "reorder", "out_of_stock"];

const sortOptions = (Object.keys(inventorySortLabels) as InventorySort[]).map((sort) => ({
  value: sort,
  label: inventorySortLabels[sort],
}));

const InventoryToolbar = ({ showArchived }: IProps) => {
  const { tab, setTab } = useInventoryTab();
  const { sort, setSort } = useInventorySort();
  const { data: categories = [] } = useCategoryOptions();

  const tabs = [...statusTabs, ...(showArchived ? (["archived"] as const) : [])].map(
    (key) => ({ key, label: inventoryTabLabels[key] }),
  );

  return (
    <div className={inventoryToolbar}>
      <div className={inventoryTabsScroll}>
        <SegmentTabs
          label="Stock status"
          value={tab}
          onValueChange={(value) => setTab(value as InventoryTab)}
          tabs={tabs}
        />
      </div>

      <FilterToolbar
        filterKey={inventoryTableKey}
        searchKey={inventoryTableKey}
        searchPlaceholder="Search name, item code, brand or fitment"
        controls={[
          {
            key: "category_id",
            label: "Category",
            placeholder: "All categories",
            options: categories.map((category) => ({
              value: category.id,
              label: category.name,
            })),
          },
        ]}
      >
        <SelectInput
          label="Sort"
          value={sort}
          onValueChange={(value) => setSort(value as InventorySort)}
          options={sortOptions}
          className={filterSelect}
        />
      </FilterToolbar>
    </div>
  );
};

export default InventoryToolbar;
