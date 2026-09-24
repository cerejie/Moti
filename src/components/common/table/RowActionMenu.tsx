import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn.utils";
import type { IRowAction } from "../../../models/common/action.model";
import { rowActionTrigger } from "../../../styles/table/rowActions.styles";
import AppButton from "../button/AppButton";

type IProps = {
  // Names the record the menu belongs to, e.g. "account 1234-5678".
  label: string;
  actions: IRowAction[];
  className?: string;
};

const RowActionMenu = ({ label, actions, className }: IProps) => {
  if (actions.length === 0) return null;

  return (
    <DropdownMenuTrigger>
      <AppButton
        variant="ghost"
        size="icon"
        aria-label={`Manage ${label}`}
        className={cn(rowActionTrigger, className)}
      >
        <MoreVertical />
      </AppButton>

      <DropdownMenu placement="bottom end" aria-label={`Manage ${label}`}>
        {actions.map((action) => (
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
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
};

export default RowActionMenu;
