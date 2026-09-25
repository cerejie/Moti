import type { LucideIcon } from "lucide-react";
import { ChevronRight, Layers, Store, UsersRound } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import type { IPermissionKey } from "../../../models/common/permission.model";
import { ROUTES } from "../../../routes/route.paths";
import {
  settingsLink,
  settingsLinkChevron,
  settingsLinkHint,
  settingsLinkLabel,
  settingsLinkList,
  settingsLinkText,
} from "../../../styles/settings/settings.styles";

type ISettingsLink = {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  path: string;
  can: IPermissionKey;
};

const links: ISettingsLink[] = [
  {
    key: "masterfile",
    label: "Masterfile",
    hint: "Categories, brands, units and storage locations",
    icon: Layers,
    path: ROUTES.masterfile,
    can: "manageCatalog",
  },
  {
    key: "users",
    label: "Users",
    hint: "Who can sign in, their role and access",
    icon: UsersRound,
    path: ROUTES.users,
    can: "manageEmployees",
  },
  {
    key: "shops",
    label: "Shops",
    hint: "Every shop on Moti and whether it is active",
    icon: Store,
    path: ROUTES.shops,
    can: "manageShops",
  },
];

// The screens that moved under Settings, each shown only to roles that can open it.
const SettingsLinksCard = () => {
  const permissions = usePermissions();
  const allowed = links.filter((link) => permissions[link.can]);

  if (allowed.length === 0) return null;

  return (
    <SectionCard title="Manage" description="Your shop's lists and the people who use Moti.">
      <ul className={settingsLinkList}>
        {allowed.map(({ key, label, hint, icon: Icon, path }) => (
          <li key={key}>
            <AppButton variant="ghost" href={path} className={settingsLink}>
              <Icon />
              <span className={settingsLinkText}>
                <span className={settingsLinkLabel}>{label}</span>
                <span className={settingsLinkHint}>{hint}</span>
              </span>
              <ChevronRight className={settingsLinkChevron} />
            </AppButton>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
};

export default SettingsLinksCard;
