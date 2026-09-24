import { Link } from "react-router-dom";
import { cn } from "@/utils/cn.utils";
import { useNavigationMenu } from "../../../hook/layout/navigation.hook";
import {
  tabbarItem,
  tabbarItemActive,
  tabbarLabel,
  tabbarRoot,
  tabbarRow,
} from "../../../styles/layout/tabbar.styles";

const TabBar = () => {
  const menu = useNavigationMenu();

  return (
    <nav className={tabbarRoot} aria-label="Primary">
      <div className={tabbarRow}>
        {menu.map(({ route, active }) => (
          <Link
            key={route.key}
            to={route.path}
            className={cn(tabbarItem, active && tabbarItemActive)}
            aria-current={active ? "page" : undefined}
          >
            <route.icon size={20} aria-hidden="true" />
            <span className={tabbarLabel}>{route.shortLabel ?? route.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TabBar;
