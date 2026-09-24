import type { LucideIcon } from "lucide-react";
import type { RouteObject } from "react-router-dom";

export type IRoute = {
  key?: string;
  label?: string;
  // Phone tab bar caption. Falls back to `label` when a route omits it.
  shortLabel?: string;
  description?: string;
  icon?: LucideIcon;
  group?: string;
  isNotNav?: boolean;
  children?: IRoute[];
} & RouteObject;

// A back action a screen puts in the topbar, e.g. a wizard's previous step.
export type IHeaderBack = {
  label: string;
  onPress: () => void;
};
