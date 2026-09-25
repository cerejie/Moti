import type { ReactNode } from "react";
import { Ellipsis } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn.utils";
import { useModal } from "../../../hook/common/modal.hook";
import { useTabBarMenu } from "../../../hook/layout/navigation.hook";
import { tabBarMoreModalKey } from "../../../keys/modal.keys";
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

// Icon, caption and count shared by the page tabs and the More tab.
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

const TabBar = () => {
  const { tabs, more } = useTabBarMenu();
  const { openModal } = useModal(tabBarMoreModalKey);

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

        {more && (
          <button
            type="button"
            onClick={() => openModal()}
            className={cn(tabbarItem, more.active && tabbarItemActive)}
            aria-haspopup="dialog"
          >
            <TabContent
              icon={<Ellipsis size={20} aria-hidden="true" />}
              label="More"
              badge={more.badge}
            />
          </button>
        )}
      </div>
    </nav>
  );
};

export default TabBar;
