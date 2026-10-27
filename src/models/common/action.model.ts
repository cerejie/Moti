import type { ReactNode } from "react";

// "menu" keeps an action in the sheet's ⋮ menu, even a danger one.
export type IActionPriority = "primary" | "secondary" | "menu";

export interface IRowAction {
  key: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  priority?: IActionPriority;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}
