import { Check, ChevronsUpDown, Store } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { scopeSheetModalKey } from "../../../keys/modal.keys";
import type { IRowAction } from "../../../models/common/action.model";
import {
  scopeMenuCaret,
  scopeMenuCheck,
  scopeMenuItem,
  scopeMenuLabel,
  scopeMenuPopover,
  scopeMenuSeparator,
  scopeMenuTrigger,
  scopeMenuTriggerCompact,
  scopeSheetDivider,
  scopeSheetItem,
  scopeSheetLabel,
  scopeSheetList,
} from "../../../styles/layout/scopeMenu.styles";
import AppButton from "../button/AppButton";
import AppSheet from "../modal/AppSheet";

export type IScopeOption = {
  id: string;
  label: string;
};

type IProps = {
  // What is being scoped, e.g. "Branch".
  title: string;
  // The option that means "no filter", e.g. "All branches".
  allLabel: string;
  options: readonly IScopeOption[];
  // null is the "all" option.
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  // A last row below a separator, e.g. Manage branches.
  extraAction?: IRowAction;
};

const allKey = "__all";

// TARTAR's header scope picker: a dropdown on wide screens, a sheet on compact ones.
const ScopeMenu = ({ title, allLabel, options, selectedId, onSelect, extraAction }: IProps) => {
  const isCompact = useIsCompact();
  const { modal, openModal, closeModal } = useModal(scopeSheetModalKey);
  const rows: IScopeOption[] = [{ id: allKey, label: allLabel }, ...options];
  const selectedKey = selectedId ?? allKey;
  const selectedLabel = options.find((option) => option.id === selectedId)?.label ?? allLabel;
  const triggerLabel = `${title}: ${selectedLabel}. Choose which to view`;

  const choose = (id: string) => onSelect(id === allKey ? null : id);

  if (isCompact) {
    const handlePress = (run: () => void) => {
      closeModal();
      run();
    };

    return (
      <>
        {/* The name stays visible on phones too: which branch you are looking at is never hidden. */}
        <AppButton
          variant="ghost"
          aria-label={triggerLabel}
          className={scopeMenuTriggerCompact}
          onPress={() => openModal()}
        >
          <Store />
          <span className={scopeMenuLabel}>{selectedLabel}</span>
        </AppButton>

        <AppSheet open={modal.visible} title={title} onClose={closeModal}>
          <nav aria-label={title} className={scopeSheetList}>
            {rows.map((row) => (
              <AppButton
                key={row.id}
                variant="ghost"
                aria-current={row.id === selectedKey ? "true" : undefined}
                className={scopeSheetItem}
                onPress={() => handlePress(() => choose(row.id))}
              >
                <span className={scopeSheetLabel}>{row.label}</span>
                {row.id === selectedKey && <Check className={scopeMenuCheck} />}
              </AppButton>
            ))}
            {extraAction && (
              <>
                <Separator className={scopeSheetDivider} />
                <AppButton
                  variant="ghost"
                  className={scopeSheetItem}
                  onPress={() => handlePress(extraAction.onSelect)}
                >
                  {extraAction.icon}
                  {extraAction.label}
                </AppButton>
              </>
            )}
          </nav>
        </AppSheet>
      </>
    );
  }

  return (
    <DropdownMenuTrigger>
      <AppButton variant="ghost" aria-label={triggerLabel} className={scopeMenuTrigger}>
        <Store />
        <span className={scopeMenuLabel}>{selectedLabel}</span>
        <ChevronsUpDown className={scopeMenuCaret} />
      </AppButton>

      <DropdownMenu placement="bottom end" aria-label={title} className={scopeMenuPopover}>
        <DropdownMenuGroup aria-label={title}>
          {rows.map((row) => (
            <DropdownMenuItem
              key={row.id}
              id={row.id}
              textValue={row.label}
              className={scopeMenuItem}
              onAction={() => choose(row.id)}
            >
              {row.label}
              {row.id === selectedKey && <Check className={scopeMenuCheck} />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {extraAction && <DropdownMenuSeparator className={scopeMenuSeparator} />}
        {extraAction && (
          <DropdownMenuGroup aria-label={extraAction.label}>
            <DropdownMenuItem
              id={extraAction.key}
              textValue={extraAction.label}
              className={scopeMenuItem}
              onAction={extraAction.onSelect}
            >
              {extraAction.icon}
              {extraAction.label}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
};

export default ScopeMenu;
