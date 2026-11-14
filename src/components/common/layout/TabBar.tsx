import { Link } from "react-router-dom";
import { useTabMenu } from "../../../hook/layout/navigation.hook";
import {
  tabbarIcon,
  tabbarIndicator,
  tabbarIndicatorTrack,
  tabbarItem,
  tabbarLabel,
  tabbarList,
  tabbarRoot,
  type ITabCount,
  type ITabIndex,
} from "../../../styles/layout/tabbar.styles";
import { setNavDirection } from "../../../utils/transition.utils";

const isTabCount = (value: number): value is ITabCount => value >= 2 && value <= 6;
const isTabIndex = (value: number): value is ITabIndex => value >= 0 && value <= 5;

// TARTAR's floating AppTabBar, fed by the role-filtered tab menu.
const TabBar = () => {
  const menu = useTabMenu();
  const activeIndex = menu.findIndex(({ active }) => active);
  const count = menu.length;

  return (
    <nav className={tabbarRoot} aria-label="Primary">
      <ul className={tabbarList}>
        {menu.map(({ route, active }) => (
          <li key={route.key}>
            <Link
              to={route.path}
              viewTransition
              onClick={() => setNavDirection("fade")}
              className={tabbarItem({ active })}
              aria-current={active ? "page" : undefined}
            >
              <span className={tabbarIcon} aria-hidden="true">
                <route.icon />
              </span>
              <span className={tabbarLabel}>{route.shortLabel ?? route.label}</span>
            </Link>
          </li>
        ))}
        {isTabCount(count) && isTabIndex(activeIndex) && (
          <li className={tabbarIndicatorTrack({ count, index: activeIndex })} aria-hidden="true">
            <span className={tabbarIndicator} />
          </li>
        )}
      </ul>
    </nav>
  );
};

export default TabBar;
