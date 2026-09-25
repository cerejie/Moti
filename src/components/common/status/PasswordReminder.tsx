import { KeyRound } from "lucide-react";
import AppButton from "../button/AppButton";
import AppAlert from "./AppAlert";
import { ROUTES } from "../../../routes/route.paths";
import {
  selectMustChangePassword,
  useAuthStore,
} from "../../../store/data/auth/auth.store";

// Shown on every page, Settings included, until a user on a temporary password sets their own.
const PasswordReminder = () => {
  const mustChange = useAuthStore(selectMustChangePassword);

  if (!mustChange) return null;

  return (
    <AppAlert
      tone="warning"
      title="Change your temporary password"
      actions={
        <AppButton variant="outline" href={ROUTES.settings}>
          <KeyRound />
          Change password
        </AppButton>
      }
    >
      Your password was set by your shop owner. Choose your own to keep your account safe.
    </AppAlert>
  );
};

export default PasswordReminder;
