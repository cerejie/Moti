import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import type { IHeaderBack, IRoute } from "../../models/common/route.model";
import { useLayoutStore } from "../../store/common/layout.store";
import {
  menuGroup,
  protectedViewRoutes,
} from "../../routes/protected.view.routes";
import { isRouteActive } from "../../utils/route.utils";

export type INavRoute = IRoute & {
  path: string;
  label: string;
  icon: LucideIcon;
};

const navigationRoutes = protectedViewRoutes.filter(
  (route): route is INavRoute =>
    !route.isNotNav && Boolean(route.path && route.label && route.icon),
);

export const useNavigationMenu = () => {
  const { pathname } = useLocation();

  return navigationRoutes.map((route) => ({
    route,
    active: isRouteActive(route.path, pathname),
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

// Puts "Back to <label>" in the topbar while the caller is mounted. `onPress` must
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
