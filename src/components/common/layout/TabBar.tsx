import { Link } from "react-router-dom";
import { useTabMenu } from "../../../hook/layout/navigation.hook";
import {
  tabbarIcon,
  tabbarIndicator,
  tabbarItem,
  tabbarLabel,
  tabbarList,
  tabbarRoot,
} from "../../../styles/layout/tabbar.styles";

// TARTAR's floating AppTabBar, fed by the role-filtered tab menu.
const TabBar = () => {
  const menu = useTabMenu();

  return (
    <nav className={tabbarRoot} aria-label="Primary">
      <ul className={tabbarList}>
        {menu.map(({ route, active }) => (
          <li key={route.key}>
            <Link
              to={route.path}
              className={tabbarItem({ active })}
              aria-current={active ? "page" : undefined}
            >
              <span className={tabbarIcon} aria-hidden="true">
                <route.icon />
              </span>
              <span className={tabbarLabel}>{route.shortLabel ?? route.label}</span>
              {active && <span className={tabbarIndicator} aria-hidden="true" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TabBar;
