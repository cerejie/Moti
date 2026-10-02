import type { CellData, ColumnDef, RowData, TableFeatures } from "@tanstack/react-table";
import {
  createColumnHelper,
  createCoreRowModel,
  tableFeatures,
} from "@tanstack/react-table";

declare module "@tanstack/table-core" {
  // Merging needs TanStack's exact type parameters, even unused.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData> {
    // Hides a low-value column below this breakpoint, so a tablet table fits its panel.
    hideBelow?: "lg" | "xl";
  }
}

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
