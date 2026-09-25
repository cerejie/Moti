import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  analyzerRankingKey,
  analyzerReorderKey,
  analyzerSummaryKey,
  dashboardAlertsKey,
  dashboardSummaryKey,
  inventoryItemKey,
  inventoryListKey,
  shopListKey,
  shopOptionsKey,
  shopSettingsKey,
  shopTimezoneKey,
} from "../../../keys/query.keys";
import { shopFormModalKey } from "../../../keys/modal.keys";
import {
  shopSchema,
  shopSettingsSchema,
  type IShopRequest,
  type IShopSettingsRequest,
} from "../../../models/data/shop/shop.request";
import type { IShop, IShopSettings } from "../../../models/data/shop/shop.response";
import shopServices from "../../../services/data/shop.services";
import { useConfirm } from "../../common/confirmation.hook";
import { useAppMutation } from "../../common/mutation.hook";
import { useModal } from "../../common/modal.hook";
import { useShopSettings } from "./shop.list.hook";

type ISaveShop = { id?: string; values: IShopRequest };

// The switcher lists every shop too.
const shopKeys = [shopListKey, shopOptionsKey];

// The low margin decides stock status and the timezone decides every period,
// so a settings change refreshes whatever shows either.
const settingsKeys = [
  shopSettingsKey,
  shopTimezoneKey,
  inventoryListKey,
  inventoryItemKey,
  dashboardSummaryKey,
  dashboardAlertsKey,
  analyzerRankingKey,
  analyzerSummaryKey,
  analyzerReorderKey,
];

export const useShopFormModal = () => {
  const { openModal } = useModal<IShop>(shopFormModalKey);

  return {
    openCreate: () => openModal(),
    openRename: (shop: IShop) => openModal(shop),
  };
};

// The modal's data is the shop being renamed; without it the form adds one.
export const useShopForm = () => {
  const { modal, openModal, closeModal } = useModal<IShop>(shopFormModalKey);
  const editing = modal.data;

  const form = useForm<IShopRequest>({
    resolver: zodResolver(shopSchema),
    defaultValues: { name: "" },
  });

  const mutation = useAppMutation<ISaveShop>({
    mutationFn: ({ id, values }) =>
      id ? shopServices.rename(id, values) : shopServices.create(values),
    successMessage: ({ id }) => (id ? "Shop renamed" : "Shop added"),
    invalidates: shopKeys,
    onSuccess: () => closeModal(),
  });

  const { reset } = form;
  const { reset: resetMutation } = mutation;

  useEffect(() => {
    if (!modal.visible) return;
    reset({ name: editing?.name ?? "" });
    resetMutation();
  }, [modal.visible, editing, reset, resetMutation]);

  const onSubmit = (values: IShopRequest) => mutation.mutate({ id: editing?.id, values });

  return {
    form,
    onSubmit,
    open: modal.visible,
    isEditing: Boolean(editing),
    onOpenChange: (open: boolean) => (open ? openModal(editing) : closeModal()),
    errorText: mutation.errorText,
    isPending: mutation.isPending,
  };
};

// Suspending locks the shop's owner and employees out on their next request.
export const useShopSuspension = () => {
  const confirm = useConfirm();

  const mutation = useAppMutation<{ id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => shopServices.setActive(id, isActive),
    successMessage: ({ isActive }) => (isActive ? "Shop reactivated" : "Shop suspended"),
    invalidates: shopKeys,
    toastErrors: true,
  });

  // The confirm dialog awaits this; the mutation's own toast reports a failure.
  const run = (id: string, isActive: boolean) =>
    mutation.mutateAsync({ id, isActive }).catch(() => undefined);

  return {
    suspend: (shop: IShop) =>
      confirm({
        kind: "confirm",
        title: "Suspend shop?",
        itemName: shop.name,
        message: "Its owner and employees lose access to every screen until you reactivate it.",
        okText: "Suspend",
        onConfirm: () => run(shop.id, false),
      }),
    reactivate: (shop: IShop) => run(shop.id, true),
  };
};

const toSettingsRequest = (settings?: IShopSettings): IShopSettingsRequest => ({
  default_reorder_level: settings ? String(settings.default_reorder_level) : "",
  low_stock_margin_pct: settings ? String(settings.low_stock_margin_pct) : "",
  timezone: settings?.timezone ?? "",
});

export const useShopSettingsForm = () => {
  const settings = useShopSettings();
  const { data, shopId } = settings;

  const form = useForm<IShopSettingsRequest>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues: toSettingsRequest(),
  });

  const mutation = useAppMutation<IShopSettingsRequest>({
    mutationFn: (values) => shopServices.updateSettings(shopId ?? "", values),
    successMessage: "Shop settings saved",
    invalidates: settingsKeys,
  });

  const { reset } = form;

  // The form follows the loaded row, and the picked shop when the superadmin switches.
  useEffect(() => {
    reset(toSettingsRequest(data));
  }, [data, reset]);

  const onSubmit = (values: IShopSettingsRequest) => mutation.mutate(values);

  return {
    ...settings,
    form,
    onSubmit,
    errorText: mutation.errorText,
    // The query's own isPending stays the loading flag.
    isSaving: mutation.isPending,
  };
};
