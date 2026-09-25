import type { LucideIcon } from "lucide-react";
import type { RouteObject } from "react-router-dom";
import type { IPermissionKey } from "./permission.model";

export type PageSkeletonVariant = "list" | "dashboard" | "detail" | "form";

export type IRoute = {
  key?: string;
  label?: string;
  // Phone tab bar caption. Falls back to `label` when a route omits it.
  shortLabel?: string;
  description?: string;
  icon?: LucideIcon;
  group?: string;
  isNotNav?: boolean;
  // Hides the route from navigation and blocks its URL without this permission.
  can?: IPermissionKey;
  // A live count shown on the nav entry, e.g. items that need attention.
  badge?: "stockAlerts";
  // Loads the page's code ahead of the first visit; set by lazyPage.
  preload?: () => Promise<unknown>;
  // The frame shown while a lazy page's code arrives.
  skeleton?: PageSkeletonVariant;
  children?: IRoute[];
} & RouteObject;

// A back action a screen puts in the topbar, e.g. a wizard's previous step.
export type IHeaderBack = {
  label: string;
  onPress: () => void;
};
