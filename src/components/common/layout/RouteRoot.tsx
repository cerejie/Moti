import { RouterProvider } from "react-aria-components";
import { Outlet, useHref, useNavigate } from "react-router-dom";

// Parent of every route. React Aria links (a Button, Item or sidebar entry with
// an href) navigate through this instead of reloading the page.
const RouteRoot = () => {
  const navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
};

export default RouteRoot;
