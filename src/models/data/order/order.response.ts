import type { IStockLineItem } from "../delivery/delivery.request";

// quantity is what is still to come: a delivery takes what arrived off it.
export interface IOrderListLine {
  id: string;
  item_id: string;
  quantity: number;
  item: Omit<IStockLineItem, "id">;
}

export interface IOrderList {
  id: string;
  created_at: string;
  lines: IOrderListLine[];
}
