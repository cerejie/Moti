import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import InfoHint from "../../common/view/InfoHint";
import { reorderOrderFormula, sold30dFormula } from "../../../enums/analyzer.enum";
import { useReorderItems } from "../../../hook/data/analyzer/analyzer.list.hook";
import { reorderTableKey } from "../../../keys/table.keys";
import ReorderTable from "../tables/ReorderTable";

const ReorderPanel = () => {
  const { data, isLoading, isError, error, refetch, openItem } = useReorderItems();

  return (
    <TablePanel
      title="Needs reorder"
      description="Items at or below their threshold, most urgent first"
      actions={
        <InfoHint
          label="How the reorder list is ordered"
          items={[
            { label: "Order", text: reorderOrderFormula },
            { label: "Sold (30 days)", text: sold30dFormula },
          ]}
        />
      }
      footer={
        <TablePagination paginationKey={reorderTableKey} totalCount={data?.totalCount ?? 0} />
      }
    >
      <ReorderTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        onOpen={openItem}
      />
    </TablePanel>
  );
};

export default ReorderPanel;
