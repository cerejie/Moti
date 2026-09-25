import { Pencil, Tags, Trash2 } from "lucide-react";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import {
  useCategoryFormModal,
  useDeleteCategory,
} from "../../../hook/data/category/category.form.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import type { ICategory } from "../../../models/data/category/category.response";
import { formatItemCount } from "../../../utils/format.utils";
import MasterfileList from "./MasterfileList";

const CategoryListPanel = () => {
  const { data: categories = [], isLoading, isError, error, refetch } = useCategoryOptions();
  const { data: brands = [] } = useBrandOptions();
  const { openCreate, openEdit } = useCategoryFormModal();
  const deleteCategory = useDeleteCategory();

  const brandNames = (category: ICategory) =>
    brands
      .filter((brand) => category.brand_ids.includes(brand.id))
      .map((brand) => brand.name)
      .join(", ");

  return (
    <MasterfileList<ICategory>
      rows={categories}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      noun={{ one: "category", many: "categories" }}
      addLabel="Add category"
      onAdd={() => openCreate()}
      metaOf={(category) =>
        [category.code, brandNames(category) || "No brands yet", formatItemCount(category.item_count)].join(" · ")
      }
      actionsFor={(category) => [
        { key: "edit", label: "Edit", icon: <Pencil />, onSelect: () => openEdit(category) },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 />,
          danger: true,
          // The database refuses too; this only saves a pointless attempt.
          disabled: category.item_count > 0,
          onSelect: () => deleteCategory(category),
        },
      ]}
      emptyIcon={<Tags />}
      emptyTitle="No categories yet"
      emptyText="Group items like Brakes or Electrical. Each category's code starts its item codes."
    />
  );
};

export default CategoryListPanel;
