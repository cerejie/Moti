import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { useLocation, useMatches, useNavigate } from "react-router-dom";
import type { IHeaderBack, IRoute, IRouteHandle } from "../../models/common/route.model";
import { useLayoutStore } from "../../store/common/layout.store";
import {
  menuGroup,
  protectedViewRoutes,
} from "../../routes/protected.view.routes";
import { ROUTES } from "../../routes/route.paths";
import { isRouteActive } from "../../utils/route.utils";
import { usePermissions } from "../data/account/account.permission.hook";

export type INavRoute = IRoute & {
  path: string;
  label: string;
  icon: LucideIcon;
};

const navigationRoutes = protectedViewRoutes.filter(
  (route): route is INavRoute =>
    !route.isNotNav && Boolean(route.path && route.label && route.icon),
);

// Only the routes the signed-in role may open appear in the sidebar and tab bar.
export const useNavigationMenu = () => {
  const { pathname } = useLocation();
  const permissions = usePermissions();

  return navigationRoutes
    .filter((route) => !route.can || permissions[route.can])
    .map((route) => ({
      route,
      active: isRouteActive(route.path, pathname),
    }));
};

// The phone tab bar: routes with a tabParent drop out and light their parent tab instead.
export const useTabMenu = () => {
  const menu = useNavigationMenu();
  const hosted = menu.find(({ route, active }) => active && route.tabParent);

  return menu
    .filter(({ route }) => !route.tabParent)
    .map(({ route, active }) => ({
      route,
      active: active || route.key === hosted?.route.tabParent,
    }));
};

export const useActiveNavRoute = () => {
  const { pathname } = useLocation();

  return (
    navigationRoutes.find((route) => isRouteActive(route.path, pathname)) ?? null
  );
};

// Topbar title: the nav section the page belongs to, then the page itself when it
// is a sub-page hidden from the menu.
export const useBreadcrumbTrail = () => {
  const section = useActiveNavRoute();
  const { pathname } = useLocation();
  const page = protectedViewRoutes.find((route) => route.path === pathname);
  const current = page?.label ?? section?.label ?? "Moti";

  return {
    parent: section && section.label !== current ? section : null,
    current,
  };
};

// A sub-page hidden from the menu sends the user back to its nav section.
export const useBackRoute = () => {
  const { pathname } = useLocation();
  const section = useActiveNavRoute();
  const page = protectedViewRoutes.find((route) => route.path === pathname);

  if (!page?.isNotNav || !section || section.path === pathname) return null;

  return section;
};

const isRouteHandle = (handle: unknown): handle is IRouteHandle =>
  typeof handle === "object" && handle !== null;

// A pushed screen pops back the way it came; a deep link has no in-app history to pop,
// so it falls back to its nav section.
export const usePushedRoute = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { key } = useLocation();
  const section = useActiveNavRoute();
  const pushed = matches.some(({ handle }) => isRouteHandle(handle) && handle.pushed === true);

  const goBack = () => {
    if (key === "default") void navigate(section?.path ?? ROUTES.home);
    else void navigate(-1);
  };

  return { pushed, goBack };
};

// Puts "Back to <label>" in the app bar / header while the caller is mounted. `onPress` must
// be stable, or the store is rewritten on every render.
export const useHeaderBack = (back: IHeaderBack | null) => {
  const setHeaderBack = useLayoutStore((state) => state.setHeaderBack);
  const label = back?.label;
  const onPress = back?.onPress;

  useEffect(() => {
    setHeaderBack(label && onPress ? { label, onPress } : null);
  }, [label, onPress, setHeaderBack]);

  useEffect(() => () => setHeaderBack(null), [setHeaderBack]);
};

// The sidebar renders one section per group, in the order the routes declare them.
export const useNavigationGroups = () => {
  const menu = useNavigationMenu();
  const labels = [...new Set(menu.map(({ route }) => route.group ?? menuGroup))];

  return labels.map((label) => ({
    label,
    items: menu.filter(({ route }) => (route.group ?? menuGroup) === label),
  }));
};

// Each page starts at the top of the shell's one scroll container.
export const useScrollReset = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.getElementById("main-content")?.scrollTo({ top: 0 });
  }, [pathname]);
};
