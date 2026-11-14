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
        Edit product
      </AppButton>

      {archived ? (
        <AppButton
          size="lg"
          variant="outline"
          onPress={() => restore(item)}
          className={detailManageButton}
        >
          <ArchiveRestore data-icon="inline-start" aria-hidden />
          Restore product
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
          Archive product
        </AppButton>
      )}

      <p className={detailManageHint}>
        {archived
          ? "Restoring puts the product back on Stocks and on sale."
          : "Archived products leave Stocks and can't be sold. Their history is kept, and you can restore them anytime."}
      </p>
    </div>
  );
};

export default ItemManageActions;
