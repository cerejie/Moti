import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn.utils";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { accountSheetModalKey } from "../../../keys/modal.keys";
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
  accountSheetDanger,
  accountSheetHead,
  accountSheetItem,
  accountSheetList,
  accountSheetName,
  accountSheetRole,
  accountSheetText,
} from "../../../styles/layout/accountMenu.styles";
import AppButton from "../button/AppButton";
import AppSheet from "../modal/AppSheet";
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

// On compact screens TARTAR's account sheet stands in for the dropdown.
const AccountSheet = ({ name, subtitle, actions }: IProps) => {
  const { modal, openModal, closeModal } = useModal(accountSheetModalKey);

  const handleAction = (action: IRowAction) => {
    closeModal();
    action.onSelect();
  };

  return (
    <>
      <AppButton
        variant="ghost"
        aria-label={`Account menu for ${name}`}
        className={accountMenuTrigger}
        onPress={() => openModal()}
      >
        <AppAvatar alt={name} fallback={initialsOf(name)} className={accountMenuAvatar} />
      </AppButton>

      <AppSheet open={modal.visible} title="Account" onClose={closeModal}>
        <div className={accountSheetHead}>
          <AppAvatar alt={name} fallback={initialsOf(name)} className={accountMenuAvatar} />
          <span className={accountSheetText}>
            <span className={accountSheetName}>{name}</span>
            <span className={accountSheetRole}>{subtitle}</span>
          </span>
        </div>
        <nav aria-label="Account" className={accountSheetList}>
          {actions.map((action) => (
            <AppButton
              key={action.key}
              variant="ghost"
              disabled={action.disabled}
              className={cn(accountSheetItem, action.danger && accountSheetDanger)}
              onPress={() => handleAction(action)}
            >
              {action.icon}
              {action.label}
            </AppButton>
          ))}
        </nav>
      </AppSheet>
    </>
  );
};

const AccountMenu = (props: IProps) => {
  const { name, subtitle, email, actions } = props;
  const isCompact = useIsCompact();
  const regular = actions.filter((action) => !action.danger);
  const danger = actions.filter((action) => action.danger);

  if (isCompact) return <AccountSheet {...props} />;

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
