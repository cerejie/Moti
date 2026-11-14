import type { ReactNode } from "react";
import {
  stockMath,
  stockMathCell,
  stockMathLabel,
  stockMathValue,
} from "../../../styles/inventory/inventory.styles";

type IStockMathCell = {
  label: string;
  // A figure, or the input that changes it.
  content: ReactNode;
};

type IProps = {
  cells: readonly [IStockMathCell, IStockMathCell, IStockMathCell];
};

// "Available 8 · Received 12 · After saving 20": the sum is on screen, so nobody does it in their head.
const StockMathRow = ({ cells }: IProps) => (
  <dl className={stockMath}>
    {cells.map((cell) => (
      <div key={cell.label} className={stockMathCell}>
        <dt className={stockMathLabel}>{cell.label}</dt>
        <dd className={stockMathValue}>{cell.content}</dd>
      </div>
    ))}
  </dl>
);

export default StockMathRow;
