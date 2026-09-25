import { BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { useBrandFormModal, useDeleteBrand } from "../../../hook/data/brand/brand.form.hook";
import { useBrandOptions } from "../../../hook/data/brand/brand.list.hook";
import { useCategoryOptions } from "../../../hook/data/category/category.list.hook";
import type { IBrand } from "../../../models/data/brand/brand.response";
import { formatItemCount } from "../../../utils/format.utils";
import MasterfileList from "./MasterfileList";

const BrandListPanel = () => {
  const { data: brands = [], isLoading, isError, error, refetch } = useBrandOptions();
  const { data: categories = [] } = useCategoryOptions();
  const { openCreate, openEdit } = useBrandFormModal();
  const deleteBrand = useDeleteBrand();

  const categoryNames = (brand: IBrand) =>
    categories
      .filter((category) => brand.category_ids.includes(category.id))
      .map((category) => category.name)
      .join(", ");

  return (
    <MasterfileList<IBrand>
      rows={brands}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      noun={{ one: "brand", many: "brands" }}
      addLabel="Add brand"
      onAdd={() => openCreate()}
      metaOf={(brand) =>
        [brand.code, categoryNames(brand) || "Not in any category", formatItemCount(brand.item_count)].join(" · ")
      }
      actionsFor={(brand) => [
        { key: "edit", label: "Edit", icon: <Pencil />, onSelect: () => openEdit(brand) },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 />,
          danger: true,
          // The database refuses too; this only saves a pointless attempt.
          disabled: brand.item_count > 0,
          onSelect: () => deleteBrand(brand),
        },
      ]}
      emptyIcon={<BadgeCheck />}
      emptyTitle="No brands yet"
      emptyText="Add the brands you stock and pick the categories that carry them."
    />
  );
};

export default BrandListPanel;
