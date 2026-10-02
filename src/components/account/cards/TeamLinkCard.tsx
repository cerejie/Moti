import { Users } from "lucide-react";
import { usePermissions } from "../../../hook/account/account.permission.hook";
import { ROUTES } from "../../../routes/route.paths";
import { accountCardBody, accountHint } from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import BentoCell from "../../common/view/BentoCell";

// The phone tab bar has no Team tab, so Account is where managers reach it. The card
// brings its own cell so the grid has no empty slot for everyone else.
const TeamLinkCard = () => {
  const { manageUsers } = usePermissions();

  if (!manageUsers) return null;

  return (
    <BentoCell span="half">
      <SectionCard title="Team">
        <div className={accountCardBody}>
          <p className={accountHint}>Approve sign-ups, add staff and reset passwords.</p>
          <AppButton href={ROUTES.users} variant="secondary">
            <Users />
            Open Team
          </AppButton>
        </div>
      </SectionCard>
    </BentoCell>
  );
};

export default TeamLinkCard;
