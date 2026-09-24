import SectionCard from "../../common/card/SectionCard";
import AppAlert from "../../common/status/AppAlert";
import StatusBadge from "../../common/status/StatusBadge";
import { userRoleLabels } from "../../../enums/role.enum";
import { useMe } from "../../../hook/data/auth/auth.session.hook";
import { useActiveShop } from "../../../hook/data/shop/shop.list.hook";
import {
  homeWelcomeMeta,
  homeWelcomeShop,
} from "../../../styles/home/home.styles";

// ProtectedRoute has already loaded the profile, so it is present here.
const HomeWelcome = () => {
  const { data: me } = useMe();
  const { shopName } = useActiveShop();

  if (!me) return null;

  return (
    <SectionCard title={`Welcome, ${me.full_name}`}>
      <div className={homeWelcomeMeta}>
        <StatusBadge tone="brand">{userRoleLabels[me.role]}</StatusBadge>
        {shopName && <span className={homeWelcomeShop}>{shopName}</span>}
      </div>

      {me.role === "superadmin" && !shopName && (
        <AppAlert tone="info" title="Choose a shop">
          Pick a shop from the switcher at the top to open its screens.
        </AppAlert>
      )}
    </SectionCard>
  );
};

export default HomeWelcome;
