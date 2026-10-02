import { RouterProvider } from "react-router-dom";
import ConfirmationModal from "./components/common/modal/ConfirmationModal";
import AppToaster from "./components/common/status/AppToaster";
import { useAccountExpiryHook } from "./hook/data/account/account.expiry.hook";
import { useAppRouter } from "./hook/data/account/account.me.hook";
import { useInstallListener } from "./hook/common/install.hook";
import { useKeyboardInset } from "./hook/common/keyboard.hook";
import { useAppUpdate } from "./hook/common/update.hook";
import { useApplyTheme } from "./hook/layout/theme.hook";

function App() {
  useApplyTheme();
  useKeyboardInset();
  useAccountExpiryHook();
  useInstallListener();
  useAppUpdate();
  const router = useAppRouter();

  return (
    <>
      <RouterProvider router={router} />

      {/* The app's only confirmation dialog. Callers open it with useConfirm. */}
      <ConfirmationModal />
      <AppToaster />
    </>
  );
}

export default App;
