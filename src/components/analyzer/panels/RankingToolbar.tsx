import FilterToolbar from "../../common/filter/FilterToolbar";
import SelectInput from "../../common/form/SelectInput";
import { sortDirectionLabels, type SortDirection } from "../../../enums/analyzer.enum";
import { stockStatusLabels, type StockStatus } from "../../../enums/inventory.enum";
import { useAnalyzerView } from "../../../hook/data/analyzer/analyzer.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import { analyzerTableKey } from "../../../keys/table.keys";
import { filterSelect } from "../../../styles/filter/filterToolbar.styles";

const statusOptions = (Object.keys(stockStatusLabels) as StockStatus[]).map((status) => ({
  value: status,
  label: stockStatusLabels[status],
}));

const directionOptions = (Object.keys(sortDirectionLabels) as SortDirection[]).map(
  (direction) => ({ value: direction, label: sortDirectionLabels[direction] }),
);

const RankingToolbar = () => {
  const { direction, setDirection } = useAnalyzerView();
  const { data: categories = [] } = useCategoryOptions();

  return (
    <FilterToolbar
      filterKey={analyzerTableKey}
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
        {
          key: "stock_status",
          label: "Status",
          placeholder: "All statuses",
          options: statusOptions,
        },
      ]}
    >
      <SelectInput
        label="Order"
        value={direction}
        onValueChange={(value) => setDirection(value as SortDirection)}
        options={directionOptions}
        className={filterSelect}
      />
    </FilterToolbar>
  );
};

export default RankingToolbar;
