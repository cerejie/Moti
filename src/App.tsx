import { RouterProvider } from "react-router-dom";
import ConfirmationModal from "./components/common/modal/ConfirmationModal";
import { useAuthSession } from "./hook/data/auth/auth.session.hook";
import { useApplyTheme } from "./hook/layout/theme.hook";
import { router } from "./routes";

function App() {
  useApplyTheme();
  useAuthSession();

  return (
    <>
      <RouterProvider router={router} />

      {/* The app's only confirmation dialog. Callers open it with useConfirm. */}
      <ConfirmationModal />
    </>
  );
}

export default App;
