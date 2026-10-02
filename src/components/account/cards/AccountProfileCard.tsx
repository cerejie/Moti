import { effectiveRoleLabels } from "../../../enums/role.enum";
import {
  selectDisplayName,
  selectEmail,
  selectRole,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { detailLabel, detailValue } from "../../../styles/common/typography.styles";
import { accountFacts, accountFact } from "../../../styles/account/account.styles";
import SectionCard from "../../common/card/SectionCard";

const AccountProfileCard = () => {
  const name = useAccountStore(selectDisplayName);
  const email = useAccountStore(selectEmail);
  const role = useAccountStore(selectRole);

  const facts = [
    { label: "Name", value: name },
    { label: "Email", value: email },
    { label: "Role", value: role ? effectiveRoleLabels[role] : "—" },
  ];

  return (
    <SectionCard title="Profile" description="Ask the owner to change your name or email.">
      <dl className={accountFacts}>
        {facts.map((fact) => (
          <div key={fact.label} className={accountFact}>
            <dt className={detailLabel}>{fact.label}</dt>
            <dd className={detailValue}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
};

export default AccountProfileCard;
