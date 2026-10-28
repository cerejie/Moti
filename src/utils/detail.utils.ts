import type { ReactNode } from "react";

import type { IDetailItem } from "../models/common/detail.model";

const emptyValuePlaceholder = "—";

export const isEmptyDetailValue = (value: ReactNode): boolean =>
  value === null ||
  value === undefined ||
  value === false ||
  (typeof value === "string" &&
    (value.trim() === "" || value.trim() === emptyValuePlaceholder));

export const visibleDetailItems = <TRecord>(
  items: readonly IDetailItem<TRecord>[],
  record: TRecord
): IDetailItem<TRecord>[] =>
  items.filter(
    (item) => !item.hidden?.(record) && !isEmptyDetailValue(item.render(record))
  );
