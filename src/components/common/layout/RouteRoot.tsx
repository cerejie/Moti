import { RouterProvider } from "react-aria-components";
import { Outlet, useHref } from "react-router-dom";
import { useDismissSplash } from "../../../hook/common/splash.hook";
import {
  useHistoryPopDirection,
  useTransitionNavigate,
} from "../../../hook/layout/navigation.hook";

// Parent of every route. React Aria links (a Button, Item or sidebar entry with
// an href) navigate through this instead of reloading the page, as a view transition.
// It mounts once the first screen's loader and chunk are ready, which is when the
// launch splash goes.
const RouteRoot = () => {
  const navigate = useTransitionNavigate();
  useDismissSplash();
  useHistoryPopDirection();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
};

export default RouteRoot;
