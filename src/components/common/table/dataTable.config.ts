import type { ColumnDef, RowData } from "@tanstack/react-table";
import {
  createColumnHelper,
  createCoreRowModel,
  tableFeatures,
} from "@tanstack/react-table";

// Sorting, filtering and paging are all server-side and come from the stores,
// so the table only needs the core row model.
export const dataTableFeatures = tableFeatures({
  coreRowModel: createCoreRowModel(),
});

export type IDataTableColumn<TData extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  TData
>;

// Domains build their columns with this rather than importing TanStack directly.
export const dataTableColumns = <TData extends RowData>() =>
  createColumnHelper<typeof dataTableFeatures, TData>();
