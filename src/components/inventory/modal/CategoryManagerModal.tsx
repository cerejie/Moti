import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import AppModal from "../../common/modal/AppModal";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import RowActionMenu from "../../common/table/RowActionMenu";
import { useModal } from "../../../hook/common/modal.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import {
  useCategoryFormModal,
  useDeleteCategory,
} from "../../../hook/data/category/category.form.hook";
import { categoryManagerModalKey } from "../../../keys/modal.keys";
import type { ICategory } from "../../../models/data/category/category.response";
import {
  categoryCount,
  categoryList,
  categoryName,
  categoryRow,
  categoryRowText,
} from "../../../styles/inventory/inventory.styles";

const itemCountText = (count: number) => (count === 1 ? "1 item" : `${count} items`);

const CategoryManagerModal = () => {
  const { modal, openModal, closeModal } = useModal(categoryManagerModalKey);
  const { data: categories = [], isLoading, isError, error, refetch } = useCategoryOptions();
  const { openCreate, openRename } = useCategoryFormModal();
  const deleteCategory = useDeleteCategory();

  const actionsFor = (category: ICategory) => [
    { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openRename(category) },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 />,
      danger: true,
      // The database refuses too; this only saves a pointless attempt.
      disabled: category.item_count > 0,
      onSelect: () => deleteCategory(category),
    },
  ];

  const renderBody = () => {
    if (isLoading) return <StateBox loading>Loading categories…</StateBox>;
    if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
    if (categories.length === 0) {
      return (
        <StateBox icon={<Tags />} title="No categories yet">
          Group items like Brakes or Electrical to filter the inventory faster.
        </StateBox>
      );
    }

    return (
      <ul className={categoryList}>
        {categories.map((category) => (
          <li key={category.id} className={categoryRow}>
            <div className={categoryRowText}>
              <span className={categoryName}>{category.name}</span>
              <span className={categoryCount}>{itemCountText(category.item_count)}</span>
            </div>
            <RowActionMenu label={category.name} actions={actionsFor(category)} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <AppModal
      open={modal.visible}
      onOpenChange={(open) => (open ? openModal() : closeModal())}
      title="Categories"
      description="Categories with items can't be deleted until the items move or are archived."
      size="md"
      footer={
        <>
          <AppButton variant="secondary" onPress={closeModal}>
            Close
          </AppButton>
          <AppButton onPress={openCreate}>
            <Plus />
            Add category
          </AppButton>
        </>
      }
    >
      {renderBody()}
    </AppModal>
  );
};

export default CategoryManagerModal;
