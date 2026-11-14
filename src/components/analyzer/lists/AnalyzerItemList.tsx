import type { ReactNode } from "react";
import type { AnalysisListKind } from "../../../enums/analyzer.enum";
import type { StockStatus } from "../../../enums/stock.enum";
import type { IStockAnalysisRow } from "../../../models/data/analyzer/analyzer.response";
import {
  analysisFacts,
  analysisRank,
  analysisValue,
} from "../../../styles/analyzer/analyzer.styles";
import {
  dashboardList,
  dashboardRow,
  dashboardRowText,
} from "../../../styles/dashboard/dashboard.styles";
import { itemName, stockStatusText } from "../../../styles/inventory/inventory.styles";
import { formatCount, formatDaysLeft, formatShortDate, formatQuantity } from "../../../utils/format.utils";
import { itemPath } from "../../../utils/route.utils";
import EmptyState from "../../common/status/EmptyState";
import RowLink from "../../common/view/RowLink";

type IProps = {
  rows: IStockAnalysisRow[];
  kind: AnalysisListKind;
  // "30 days": what the sold figure counts over.
  periodLabel: string;
  emptyTitle: string;
  // Buy soon rows carry "Add to buying list"; the rest stay plain links.
  renderAction?: (row: IStockAnalysisRow) => ReactNode;
};

type IFlag = { text: string; status: StockStatus };

const available = (row: IStockAnalysisRow) => `${formatQuantity(row.on_hand, row.unit)} available`;

// Status in words, never colour alone.
const flagFor = (row: IStockAnalysisRow): IFlag | null => {
  const short = row.short_branches ?? 0;
  if (row.stock_status === "out") return { text: "Out of stock", status: "out" };
  if (row.stock_status === "low") return { text: "Low stock", status: "low" };
  if (short > 0) return { text: `Low in ${formatCount(short, "branch", "branches")}`, status: "low" };
  return null;
};

// An estimate only when there is a pace behind it.
const estimateFor = (row: IStockAnalysisRow) => {
  if (row.pace === null) return "Not enough sales to estimate";
  if (row.days_left === null) return null;
  return formatDaysLeft(row.days_left);
};

const factsFor = (row: IStockAnalysisRow, kind: AnalysisListKind, periodLabel: string) => {
  if (kind === "fast") return [available(row), formatCount(row.sale_count, "sale")];
  if (kind === "slow") {
    return [
      available(row),
      row.last_sold_at ? `Last sold ${formatShortDate(row.last_sold_at)}` : "Never sold",
    ];
  }
  // Actual units sold always show, even when there is too little history to estimate.
  return [
    `${formatQuantity(row.sold_units, row.unit)} sold in ${periodLabel}`,
    available(row),
    estimateFor(row),
  ].filter((fact): fact is string => fact !== null);
};

// The figure the row answers with, in words: what was sold, or what to buy.
const figureFor = (row: IStockAnalysisRow, kind: AnalysisListKind) => {
  if (kind === "fast") return `${formatQuantity(row.sold_units, row.unit)} sold`;
  if (kind === "order" && row.suggested_quantity !== null && row.suggested_quantity > 0) {
    return `Suggested: buy ${formatQuantity(row.suggested_quantity, row.unit)}`;
  }
  return null;
};

// One ranked list: a row opens the product; the figure and facts sit under the name and wrap,
// so the name keeps the width on a phone.
const AnalyzerItemList = ({ rows, kind, periodLabel, emptyTitle, renderAction }: IProps) => {
  if (rows.length === 0) return <EmptyState compact description={emptyTitle} />;

  return (
    <ol className={dashboardList}>
      {rows.map((row, index) => {
        const figure = figureFor(row, kind);
        const flag = kind === "order" ? flagFor(row) : null;

        return (
          <li key={row.item_id} className={dashboardRow}>
            {kind === "fast" && <span className={analysisRank}>{index + 1}</span>}
            <RowLink href={itemPath(row.item_id)} className={dashboardRowText}>
              <span className={itemName} title={row.name}>
                {row.name}
              </span>
              {flag && <span className={stockStatusText({ status: flag.status })}>{flag.text}</span>}
              {figure && <span className={analysisValue}>{figure}</span>}
              <span className={analysisFacts}>{factsFor(row, kind, periodLabel).join(" · ")}</span>
            </RowLink>
            {renderAction?.(row)}
          </li>
        );
      })}
    </ol>
  );
};

export default AnalyzerItemList;
