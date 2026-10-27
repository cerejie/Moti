import type { LucideIcon } from "lucide-react";
import type { RouteObject } from "react-router-dom";
import type { IPermissions } from "./permission.model";

export type IRoute = {
  key?: string;
  label?: string;
  // Phone tab bar caption. Falls back to `label` when a route omits it.
  shortLabel?: string;
  description?: string;
  icon?: LucideIcon;
  group?: string;
  isNotNav?: boolean;
  // Keeps the route in the sidebar but off the phone tab bar; that tab stays lit on it.
  tabParent?: string;
  // Hides the route from navigation unless the signed-in role has this permission.
  can?: keyof IPermissions;
  children?: IRoute[];
} & RouteObject;

// Route `handle`. A pushed screen (a record's detail) hides the phone app bar and tab bar
// and draws its own back button, like a native stack push.
export type IRouteHandle = {
  pushed?: boolean;
};

// A back action a screen puts in the app bar / header, e.g. a wizard's previous step.
export type IHeaderBack = {
  label: string;
  onPress: () => void;
};
