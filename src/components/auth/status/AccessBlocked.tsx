import { Lock } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import StateBox from "../../common/status/StateBox";
import { useSignOut } from "../../../hook/data/auth/auth.session.hook";
import type { IProfile } from "../../../models/data/auth/auth.response";

type IProps = {
  profile: IProfile | null;
};

const describeBlock = (profile: IProfile | null) => {
  if (!profile) {
    return {
      title: "Your account isn't set up yet",
      message: "Ask your shop owner to finish setting up your account.",
    };
  }

  if (!profile.is_active) {
    return {
      title: "Your account is deactivated",
      message: "Ask your shop owner to reactivate it.",
    };
  }

  return {
    title: `${profile.shop?.name ?? "Your shop"} is suspended`,
    message: "Contact Moti support to restore access.",
  };
};

const AccessBlocked = ({ profile }: IProps) => {
  const { signOut, isPending } = useSignOut();
  const { title, message } = describeBlock(profile);

  return (
    <StateBox
      icon={<Lock />}
      title={title}
      action={
        <AppButton
          variant="outline"
          loading={isPending}
          onPress={signOut}
        >
          Sign out
        </AppButton>
      }
    >
      {message}
    </StateBox>
  );
};

export default AccessBlocked;
