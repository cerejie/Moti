import { Toaster } from "@/components/ui/sonner";
import { selectTheme, useThemeStore } from "../../../store/common/theme.store";

// The app's only toaster, mounted once by App. The generated Toaster reads
// next-themes, which Moti does not use, so the theme store's value wins here.
// Top of the screen keeps toasts clear of the phone tab bar.
const AppToaster = () => {
  const theme = useThemeStore(selectTheme);

  return <Toaster theme={theme} position="top-center" richColors={false} />;
};

export default AppToaster;
