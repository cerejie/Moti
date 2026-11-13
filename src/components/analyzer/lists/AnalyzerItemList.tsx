import type { AnalysisListKind } from "../../../enums/analyzer.enum";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import {
  analysisCaption,
  analysisFigure,
  analysisValue,
} from "../../../styles/analyzer/analyzer.styles";
import {
  dashboardList,
  dashboardRow,
  dashboardRowText,
} from "../../../styles/dashboard/dashboard.styles";
import { itemMeta, itemName, onHandUnit } from "../../../styles/inventory/inventory.styles";
import {
  formatCount,
  formatDaysLeft,
  formatNumber,
  formatPace,
  formatShortDate,
} from "../../../utils/format.utils";
import { itemPath } from "../../../utils/route.utils";
import EmptyState from "../../common/status/EmptyState";
import RowLink from "../../common/view/RowLink";

type IProps = {
  rows: IStockAnalysisRow[];
  kind: AnalysisListKind;
  emptyTitle: string;
};

type IFigure = { value: number; caption: string };

const orderMeta = (row: IStockAnalysisRow) => {
  if (row.on_hand === 0) return ["Out of stock", row.pace === null ? "Not enough sales yet" : formatPace(row.pace)];
  if (row.pace === null || row.days_left === null) return ["Not enough sales yet"];
  return [formatDaysLeft(row.days_left), formatPace(row.pace)];
};

const metaFor = (row: IStockAnalysisRow, kind: AnalysisListKind) => {
  if (kind === "fast") return [formatCount(row.sale_count, "sale"), row.item_code];
  if (kind === "slow") {
    return [row.last_sold_at ? `Last sold ${formatShortDate(row.last_sold_at)}` : "No sales yet"];
  }
  return orderMeta(row);
};

// An order row leads with what to buy when there is a pace to work it out from.
const figureFor = (row: IStockAnalysisRow, kind: AnalysisListKind): IFigure => {
  if (kind === "fast") return { value: row.sold_units, caption: "sold" };
  if (kind === "order" && row.suggested_quantity !== null && row.suggested_quantity > 0) {
    return { value: row.suggested_quantity, caption: "to order" };
  }
  return { value: row.on_hand, caption: "on hand" };
};

const AnalyzerItemList = ({ rows, kind, emptyTitle }: IProps) => {
  if (rows.length === 0) return <EmptyState compact description={emptyTitle} />;

  return (
    <ul className={dashboardList}>
      {rows.map((row) => {
        const figure = figureFor(row, kind);

        return (
          <li key={row.item_id} className={dashboardRow}>
            <RowLink href={itemPath(row.item_id)} className={dashboardRowText}>
              <span className={itemName}>{row.name}</span>
              <span className={itemMeta}>{metaFor(row, kind).join(" · ")}</span>
            </RowLink>
            <span className={analysisFigure}>
              <span>
                <span className={analysisValue}>{formatNumber(figure.value)}</span>
                <span className={onHandUnit}>{row.unit}</span>
              </span>
              <span className={analysisCaption}>{figure.caption}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default AnalyzerItemList;
