import type { ReactNode } from "react";

export type IColumnAlign = "left" | "center" | "right";

// Where a column lands in the phone row that DataTableList draws instead of the grid.
export type IColumnMobileRole =
  | "title"
  | "subtitle"
  | "amount"
  | "status"
  | "meta"
  | "actions"
  | "hidden";

export type IColumnCollapse = "xl" | "2xl";

export interface IDataTableColumn<T> {
  key?: string;
  title?: ReactNode;
  dataIndex?: keyof T & string;
  align?: IColumnAlign;
  className?: string;
  mobile?: IColumnMobileRole;
  cardPrefix?: string;
  collapse?: IColumnCollapse;
  render?(value: unknown, row: T, index: number): ReactNode;
  listHidden?: boolean;
  listRender?(row: T): ReactNode;
}

export interface ICardField {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface ICardFields {
  titles: ICardField[];
  subtitles: ICardField[];
  amounts: ICardField[];
  statuses: ICardField[];
  metas: ICardField[];
  actions: ICardField[];
}

export const filteredEmptyHint = "Clear a filter to see more.";

export const searchEmptyHint = "Check the spelling or clear the search.";
