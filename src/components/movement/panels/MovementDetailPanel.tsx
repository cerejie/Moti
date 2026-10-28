import { useParams } from "react-router-dom";
import { movementReasonLabels } from "../../../enums/stock.enum";
import { useMovement } from "../../../hook/data/movement/movement.list.hook";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { IStockMovement } from "../../../models/data/movement/movement.response";
import {
  detailPage,
  detailPageHeading,
  detailPageMeta,
  detailPageSurface,
  detailPageTitle,
} from "../../../styles/view/detailPage.styles";
import { formatDateTime } from "../../../utils/format.utils";
import EmptyState from "../../common/status/EmptyState";
import ErrorState from "../../common/status/ErrorState";
import DetailRows from "../../common/table/DetailRows";
import DetailPageSection from "../../common/view/DetailPageSection";
import MovementQuantityCard from "../cards/MovementQuantityCard";
import MovementLinkList from "../lists/MovementLinkList";

const detailItems: IDetailItem<IStockMovement>[] = [
  { key: "code", label: "Item code", render: (movement) => movement.item?.item_code ?? "—" },
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
  const movement = query.data;

  if (query.isLoading) return <EmptyState loading description="Loading movement…" />;
  if (!movement) {
    return (
      <ErrorState error={query.error} title="Movement not found" onRetry={() => void query.refetch()} />
    );
  }

  return (
    <div className={detailPage}>
      <div className={detailPageHeading}>
        <h1 className={detailPageTitle}>{movementReasonLabels[movement.reason]}</h1>
        <p className={detailPageMeta}>{movement.item?.name ?? "Deleted item"}</p>
      </div>

      <MovementQuantityCard movement={movement} />

      <DetailPageSection title="Details">
        <div className={detailPageSurface}>
          <DetailRows record={movement} items={detailItems} />
        </div>
      </DetailPageSection>

      <DetailPageSection title="Related">
        <MovementLinkList movement={movement} />
      </DetailPageSection>
    </div>
  );
};

export default MovementDetailPanel;
