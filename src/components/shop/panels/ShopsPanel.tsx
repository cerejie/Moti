import FilterToolbar from "../../common/filter/FilterToolbar";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import { shopStatusLabels, type ShopStatus } from "../../../enums/shop.enum";
import { useShopList } from "../../../hook/data/shop/shop.list.hook";
import { shopTableKey } from "../../../keys/table.keys";
import ShopTable from "../tables/ShopTable";

const statusOptions = (Object.keys(shopStatusLabels) as ShopStatus[]).map((status) => ({
  value: status,
  label: shopStatusLabels[status],
}));

const ShopsPanel = () => {
  const { data, isLoading, isError, error, refetch } = useShopList();

  return (
    <TablePanel
      toolbar={
        <FilterToolbar
          filterKey={shopTableKey}
          searchKey={shopTableKey}
          searchPlaceholder="Search shop name"
          controls={[
            { key: "status", label: "Status", placeholder: "All statuses", options: statusOptions },
          ]}
        />
      }
      footer={
        <TablePagination paginationKey={shopTableKey} totalCount={data?.totalCount ?? 0} />
      }
    >
      <ShopTable
        shops={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        emptyText="No shops match these filters."
      />
    </TablePanel>
  );
};

export default ShopsPanel;
