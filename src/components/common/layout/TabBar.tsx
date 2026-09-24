import { Link } from "react-router-dom";
import { cn } from "@/utils/cn.utils";
import { useNavigationMenu } from "../../../hook/layout/navigation.hook";
import { toneSolid } from "../../../styles/common/tone.styles";
import {
  tabbarBadge,
  tabbarBadgeLabel,
  tabbarIcon,
  tabbarItem,
  tabbarItemActive,
  tabbarLabel,
  tabbarRoot,
  tabbarRow,
} from "../../../styles/layout/tabbar.styles";
import { formatBadgeCount } from "../../../utils/format.utils";

const TabBar = () => {
  const menu = useNavigationMenu();

  return (
    <nav className={tabbarRoot} aria-label="Primary">
      <div className={tabbarRow}>
        {menu.map(({ route, active, badge }) => (
          <Link
            key={route.key}
            to={route.path}
            className={cn(tabbarItem, active && tabbarItemActive)}
            aria-current={active ? "page" : undefined}
          >
            <span className={tabbarIcon}>
              <route.icon size={20} aria-hidden="true" />
              {badge && (
                <span className={cn(tabbarBadge, toneSolid({ tone: badge.tone }))} aria-hidden>
                  {formatBadgeCount(badge.count)}
                </span>
              )}
            </span>
            <span className={tabbarLabel}>{route.shortLabel ?? route.label}</span>
            {badge && (
              <span className={tabbarBadgeLabel}>, {badge.count} need attention</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TabBar;
