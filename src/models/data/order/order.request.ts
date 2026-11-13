// One item going onto the order list; the database skips items already on it.
export interface IOrderAddLine {
  item_id: string;
  quantity: number;
}
