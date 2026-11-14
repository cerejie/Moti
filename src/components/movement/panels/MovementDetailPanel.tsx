import { useParams } from "react-router-dom";
import { useActiveBranch } from "../../../hook/data/branch/branch.scope.hook";
import { useMovement } from "../../../hook/data/movement/movement.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import { detailPageSurface } from "../../../styles/view/detailPage.styles";
import { formatDateTime } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";
import DetailPageLayout from "../../common/view/DetailPageLayout";
import DetailPageSection from "../../common/view/DetailPageSection";
import MovementQuantityCard from "../cards/MovementQuantityCard";
import MovementLinkList from "../lists/MovementLinkList";

// The item code already sits under the title, so it is not repeated here.
const detailItems: IDetailItem<IStockMovement>[] = [
  { key: "by", label: "By", render: (movement) => movement.created_by_name },
  { key: "date", label: "When", render: (movement) => formatDateTime(movement.created_at) },
  {
    key: "note",
    label: "Note",
    hidden: (movement) => !movement.note,
    render: (movement) => movement.note,
  },
];

// A ledger entry: read-only, so there is no Manage section.
const MovementDetailPanel = () => {
  const { movementId } = useParams<{ movementId: string }>();
  const query = useMovement(movementId);
  const { multiple } = useActiveBranch();
  const movement = query.data;

  if (query.isLoading) return <EmptyState loading description="Loading stock change…" />;
  if (!movement) {
    return (
      <ErrorState
        error={query.error}
        title="Stock change not found"
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <DetailPageLayout
      title={movement.item?.name ?? "Deleted item"}
      meta={[movement.item?.item_code, multiple ? movement.branch?.name : null]
        .filter(Boolean)
        .join(" · ")}
      aside={
        <DetailPageSection title="Related">
          <MovementLinkList movement={movement} />
        </DetailPageSection>
      }
    >
      <MovementQuantityCard movement={movement} />

      <DetailPageSection title="Details">
        <div className={detailPageSurface}>
          <DetailRows record={movement} items={detailItems} />
        </div>
      </DetailPageSection>
    </DetailPageLayout>
  );
};

export default MovementDetailPanel;
