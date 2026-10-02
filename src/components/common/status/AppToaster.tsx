import { Toaster } from "@/components/ui/sonner";
import { selectTheme, useThemeStore } from "../../../store/common/theme.store";

// The app's one toast host; it follows Moti's theme store, not the OS.
const AppToaster = () => {
  const theme = useThemeStore(selectTheme);

  return <Toaster theme={theme} position="top-center" richColors closeButton />;
};

export default AppToaster;
