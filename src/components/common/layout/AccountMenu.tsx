import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IRowAction } from "../../../models/common/action.model";
import {
  accountMenuAvatar,
  accountMenuHeader,
  accountMenuName,
  accountMenuPopover,
  accountMenuRole,
  accountMenuSeparator,
  accountMenuText,
  accountMenuTrigger,
} from "../../../styles/layout/accountMenu.styles";
import AppButton from "../button/AppButton";
import AppAvatar from "../view/AppAvatar";

type IProps = {
  name: string;
  subtitle: string;
  email: string;
  // Danger actions (sign out) render last, below a separator.
  actions: IRowAction[];
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const renderItem = (action: IRowAction) => (
  <DropdownMenuItem
    key={action.key}
    id={action.key}
    textValue={action.label}
    variant={action.danger ? "destructive" : "default"}
    isDisabled={action.disabled}
    onAction={action.onSelect}
  >
    {action.icon}
    {action.label}
  </DropdownMenuItem>
);

const AccountMenu = ({ name, subtitle, email, actions }: IProps) => {
  const regular = actions.filter((action) => !action.danger);
  const danger = actions.filter((action) => action.danger);

  return (
    <DropdownMenuTrigger>
      <AppButton variant="ghost" aria-label={`Account menu for ${name}`} className={accountMenuTrigger}>
        <AppAvatar alt={name} fallback={initialsOf(name)} className={accountMenuAvatar} />
        <span className={accountMenuText}>
          <span className={accountMenuName}>{name}</span>
          <span className={accountMenuRole}>{subtitle}</span>
        </span>
      </AppButton>

      <DropdownMenu placement="bottom end" aria-label="Account" className={accountMenuPopover}>
        <DropdownMenuGroup aria-label="Account">
          <DropdownMenuLabel className={accountMenuHeader}>
            <span className={accountMenuName}>{name}</span>
            <span className={accountMenuRole}>{email}</span>
          </DropdownMenuLabel>
          {regular.map(renderItem)}
        </DropdownMenuGroup>
        {danger.length > 0 && <DropdownMenuSeparator className={accountMenuSeparator} />}
        {danger.length > 0 && (
          <DropdownMenuGroup aria-label="Session">{danger.map(renderItem)}</DropdownMenuGroup>
        )}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
};

export default AccountMenu;
