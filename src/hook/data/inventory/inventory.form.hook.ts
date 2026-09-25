import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  analyzerRankingKey,
  analyzerReorderKey,
  analyzerSummaryKey,
  brandOptionsKey,
  categoryOptionsKey,
  dashboardAlertsKey,
  dashboardSummaryKey,
  inventoryItemKey,
  inventoryListKey,
  masterfileOptionsKey,
} from "../../../keys/query.keys";
import { itemFormModalKey } from "../../../keys/modal.keys";
import {
  emptyItemRequest,
  itemSchema,
  type IItemRequest,
} from "../../../models/data/inventory/inventory.request";
import type { IInventoryItem } from "../../../models/data/inventory/inventory.response";
import inventoryServices from "../../../services/data/inventory.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { useBrandFormModal } from "../brand/brand.form.hook";
import { useBrandOptions } from "../brand/brand.list.hook";
import { useCategoryFormModal } from "../category/category.form.hook";
import { useCategoryOptions } from "../category/category.list.hook";
import { useMasterfileOptions } from "../masterfile/masterfile.list.hook";
import { useActiveShop } from "../shop/shop.list.hook";

type ISaveItem = { id?: string; values: IItemRequest };

// Masterfile counts and the dashboard include every item, so item writes refresh them too.
const affectedKeys = [
  inventoryListKey,
  inventoryItemKey,
  categoryOptionsKey,
  brandOptionsKey,
  masterfileOptionsKey,
  dashboardSummaryKey,
  dashboardAlertsKey,
  analyzerRankingKey,
  analyzerSummaryKey,
  analyzerReorderKey,
];

// The unit a new item starts with, as before units became a list.
const defaultUnitName = "pc";

const toRequest = (item: IInventoryItem): IItemRequest => ({
  item_code: item.item_code,
  name: item.name,
  category_id: item.category_id ?? "",
  brand_id: item.brand_id ?? "",
  part_number: item.part_number ?? "",
  fitment: item.fitment ?? "",
  unit_id: item.unit_id,
  reorder_level: String(item.reorder_level),
  selling_price: item.selling_price === null ? "" : String(item.selling_price),
  location_id: item.location_id ?? "",
  opening_quantity: "",
});

export const useItemFormModal = () => {
  const { openModal } = useModal<IInventoryItem>(itemFormModalKey);

  return {
    openCreate: () => openModal(),
    openEdit: (item: IInventoryItem) => openModal(item),
  };
};

// The modal's data is the item being edited; without it the form creates one.
export const useItemForm = () => {
  const { modal, openModal, closeModal } = useModal<IInventoryItem>(itemFormModalKey);
  const { shopId } = useActiveShop();
  const editing = modal.data;

  const { data: categories = [] } = useCategoryOptions();
  const { data: brands = [] } = useBrandOptions();
  const { data: units = [] } = useMasterfileOptions("unit");
  const { data: locations = [] } = useMasterfileOptions("location");
  const categoryFormModal = useCategoryFormModal();
  const brandFormModal = useBrandFormModal();

  const form = useForm<IItemRequest>({
    resolver: zodResolver(itemSchema),
    defaultValues: emptyItemRequest,
  });

  const mutation = useAppMutation<ISaveItem>({
    mutationFn: ({ id, values }) =>
      id ? inventoryServices.update(id, values) : inventoryServices.create(shopId, values),
    successMessage: ({ id }) => (id ? "Item updated" : "Item added"),
    queuedText: ({ id }) =>
      id ? null : "Saved offline — the item code is assigned when it syncs.",
    invalidates: affectedKeys,
    onSuccess: () => closeModal(),
  });

  const { control, reset, setValue, getValues } = form;
  const { reset: resetMutation } = mutation;
  const [categoryId, brandId] = useWatch({ control, name: ["category_id", "brand_id"] });
  // The category the brand was last checked against, so opening the form never clears it.
  const checkedCategoryId = useRef("");
  const defaultUnitId = units.find((unit) => unit.name.toLowerCase() === defaultUnitName)?.id;

  useEffect(() => {
    if (!modal.visible) return;
    reset(editing ? toRequest(editing) : emptyItemRequest);
    checkedCategoryId.current = editing?.category_id ?? "";
    resetMutation();
  }, [modal.visible, editing, reset, resetMutation]);

  useEffect(() => {
    if (!modal.visible || editing || !defaultUnitId || getValues("unit_id")) return;
    setValue("unit_id", defaultUnitId);
  }, [modal.visible, editing, defaultUnitId, getValues, setValue]);

  // A new category clears a brand it doesn't carry. Reads the live value, not the
  // render's, so the reset on open never counts as a change.
  useEffect(() => {
    const current = getValues("category_id");
    if (checkedCategoryId.current === current) return;
    checkedCategoryId.current = current;
    const carried = categories.find((category) => category.id === current)?.brand_ids ?? [];
    if (!carried.includes(getValues("brand_id"))) setValue("brand_id", "");
  }, [categoryId, categories, getValues, setValue]);

  const category = categories.find((option) => option.id === categoryId);
  const brand = brands.find((option) => option.id === brandId);
  const nextCode = category && brand ? `${category.code}-${brand.code}-###` : null;
  const moved =
    Boolean(editing) &&
    ((editing?.category_id ?? "") !== categoryId || (editing?.brand_id ?? "") !== brandId);

  const codeHint = () => {
    if (moved) {
      return nextCode
        ? `This item will get a new code: ${nextCode}.`
        : "This item will get a new code from its category and brand.";
    }
    if (editing) return "Set from the category and brand.";
    return nextCode
      ? `Will be ${nextCode} when saved.`
      : "Set from the category and brand when saved.";
  };

  const onSubmit = (values: IItemRequest) =>
    mutation.mutate({ id: editing?.id, values });

  return {
    form,
    onSubmit,
    open: modal.visible,
    isEditing: Boolean(editing),
    onOpenChange: (open: boolean) => (open ? openModal(editing) : closeModal()),
    errorText: mutation.errorText,
    isPending: mutation.isPending,
    categories,
    // Only the brands the chosen category carries.
    brands: brands.filter((option) => category?.brand_ids.includes(option.id)),
    units,
    locations,
    hasCategory: Boolean(categoryId),
    codeHint: codeHint(),
    // Opens the category form on top; the new category comes back selected.
    addCategory: () =>
      categoryFormModal.openCreate((id) =>
        setValue("category_id", id, { shouldValidate: true }),
      ),
    // Opens the brand form on top, already assigned to the chosen category.
    addBrand: () =>
      brandFormModal.openCreate(categoryId ? [categoryId] : [], (id) =>
        setValue("brand_id", id, { shouldValidate: true }),
      ),
  };
};

// Archived items leave the catalog and can't take stock until restored.
export const useItemArchive = () => {
  const confirm = useConfirm();

  const mutation = useAppMutation<{ id: string; archived: boolean }>({
    mutationFn: ({ id, archived }) => inventoryServices.setArchived(id, archived),
    successMessage: ({ archived }) => (archived ? "Item archived" : "Item restored"),
    invalidates: affectedKeys,
    toastErrors: true,
  });

  // The confirm dialog awaits this; the mutation's own toast reports a failure.
  const run = (id: string, archived: boolean) =>
    mutation.mutateAsync({ id, archived }).catch(() => undefined);

  return {
    archive: (item: IInventoryItem) =>
      confirm({
        kind: "confirm",
        title: "Archive item?",
        itemName: item.name,
        message: "It leaves the inventory list and can't be sold or restocked until you restore it.",
        okText: "Archive",
        onConfirm: () => run(item.id, true),
      }),
    restore: (item: IInventoryItem) => run(item.id, false),
    isPending: mutation.isPending,
  };
};
