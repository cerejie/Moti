import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn.utils";
import { useNavigationMenu } from "../../../hook/layout/navigation.hook";
import type { Tone } from "../../../styles/common/tone.styles";
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

type IBadge = { count: number; tone: Tone } | null;

type IProps = {
  icon: ReactNode;
  label: string;
  badge: IBadge;
};

// Icon, caption and count of one tab.
const TabContent = ({ icon, label, badge }: IProps) => (
  <>
    <span className={tabbarIcon}>
      {icon}
      {badge && (
        <span className={cn(tabbarBadge, toneSolid({ tone: badge.tone }))} aria-hidden>
          {formatBadgeCount(badge.count)}
        </span>
      )}
    </span>
    <span className={tabbarLabel}>{label}</span>
    {badge && <span className={tabbarBadgeLabel}>, {badge.count} need attention</span>}
  </>
);

// Every role has at most five tabs, so they all fit the phone bar.
const TabBar = () => {
  const tabs = useNavigationMenu();

  return (
    <nav className={tabbarRoot} aria-label="Primary">
      <div className={tabbarRow}>
        {tabs.map(({ route, active, badge }) => (
          <Link
            key={route.key}
            to={route.path}
            className={cn(tabbarItem, active && tabbarItemActive)}
            aria-current={active ? "page" : undefined}
          >
            <TabContent
              icon={<route.icon size={20} aria-hidden="true" />}
              label={route.shortLabel ?? route.label}
              badge={badge}
            />
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TabBar;
