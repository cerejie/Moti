import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { useItemArchive } from "../../../hook/data/inventory/inventory.form.hook";
import { itemFormModalKey } from "../../../keys/modal.keys";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import {
  detailManageActions,
  detailManageButton,
  detailManageHint,
} from "../../../styles/view/detailPage.styles";
import AppButton from "../../common/button/AppButton";

type IProps = {
  item: IInventoryItem;
};

// Edit first; the destructive action sits last and quieter, and still asks to confirm.
const ItemManageActions = ({ item }: IProps) => {
  const formModal = useModal<IInventoryItem>(itemFormModalKey);
  const { archive, restore } = useItemArchive();
  const archived = item.archived_at !== null;

  return (
    <div className={detailManageActions}>
      <AppButton
        size="lg"
        variant="outline"
        onPress={() => formModal.openModal(item)}
        className={detailManageButton}
      >
        <Pencil data-icon="inline-start" aria-hidden />
        Edit item
      </AppButton>

      {archived ? (
        <AppButton
          size="lg"
          variant="outline"
          onPress={() => restore(item)}
          className={detailManageButton}
        >
          <ArchiveRestore data-icon="inline-start" aria-hidden />
          Restore item
        </AppButton>
      ) : (
        <AppButton
          size="lg"
          variant="outline"
          tone="dangerSoft"
          onPress={() => archive(item)}
          className={detailManageButton}
        >
          <Archive data-icon="inline-start" aria-hidden />
          Archive item
        </AppButton>
      )}

      <p className={detailManageHint}>
        {archived
          ? "Restoring puts the item back on the list and on sale."
          : "Archived items leave the list and can't be sold. You can restore them anytime."}
      </p>
    </div>
  );
};

export default ItemManageActions;
