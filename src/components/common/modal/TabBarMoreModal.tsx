import { Link } from "react-router-dom";
import { cn } from "@/utils/cn.utils";
import { useModal } from "../../../hook/common/modal.hook";
import { useTabBarMenu } from "../../../hook/layout/navigation.hook";
import { tabBarMoreModalKey } from "../../../keys/modal.keys";
import { toneSolid } from "../../../styles/common/tone.styles";
import {
  tabbarBadgeLabel,
  tabbarMoreBadge,
  tabbarMoreItem,
  tabbarMoreItemActive,
  tabbarMoreLabel,
  tabbarMoreList,
} from "../../../styles/layout/tabbar.styles";
import { formatBadgeCount } from "../../../utils/format.utils";
import AppModal from "./AppModal";

// The pages the phone tab bar had no room for.
const TabBarMoreModal = () => {
  const { modal, openModal, closeModal } = useModal(tabBarMoreModalKey);
  const { more } = useTabBarMenu();

  if (!more) return null;

  return (
    <AppModal
      open={modal.visible}
      onOpenChange={(open) => (open ? openModal() : closeModal())}
      title="More"
      size="sm"
    >
      <nav aria-label="More pages">
        <ul className={tabbarMoreList}>
          {more.items.map(({ route, active, badge }) => (
            <li key={route.key}>
              <Link
                to={route.path}
                onClick={closeModal}
                className={cn(tabbarMoreItem, active && tabbarMoreItemActive)}
                aria-current={active ? "page" : undefined}
              >
                <route.icon aria-hidden="true" />
                <span className={tabbarMoreLabel}>{route.label}</span>
                {badge && (
                  <span className={cn(tabbarMoreBadge, toneSolid({ tone: badge.tone }))}>
                    {formatBadgeCount(badge.count)}
                    <span className={tabbarBadgeLabel}> need attention</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </AppModal>
  );
};

export default TabBarMoreModal;
