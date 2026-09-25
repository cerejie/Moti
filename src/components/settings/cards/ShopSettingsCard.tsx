import { Store } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import FormField from "../../common/form/FormField";
import FormFieldGrid from "../../common/form/FormFieldGrid";
import FormRoot from "../../common/form/FormRoot";
import AppAlert from "../../common/status/AppAlert";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import { useShopSettingsForm } from "../../../hook/data/shop/shop.form.hook";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IShopSettingsRequest } from "../../../models/data/shop/shop.request";
import { timezoneOptions } from "../../../utils/date.utils";
import {
  settingsActions,
  settingsForm,
  settingsSubmit,
} from "../../../styles/settings/settings.styles";

// Owners and the superadmin only; the superadmin edits the shop picked in the switcher.
const ShopSettingsCard = () => {
  const {
    canManage,
    shopId,
    shopName,
    data,
    isPending,
    isError,
    error,
    refetch,
    form,
    onSubmit,
    errorText,
    isSaving,
  } = useShopSettingsForm();

  if (!canManage) return null;

  const fields: IFieldConfig<IShopSettingsRequest>[] = [
    {
      name: "default_reorder_level",
      label: "Default reorder level",
      type: "number",
      required: true,
      description: "Used for new items that leave their reorder level blank.",
    },
    {
      name: "low_stock_margin_pct",
      label: "Low-stock margin (%)",
      type: "number",
      required: true,
      description: "An item is Low when on hand ≤ reorder level + this share of it.",
    },
    {
      name: "timezone",
      label: "Timezone",
      type: "select",
      span: "full",
      required: true,
      searchable: true,
      placeholder: "Choose a timezone",
      options: timezoneOptions(data?.timezone ?? ""),
      description: "Weeks, months and date filters follow this shop's local time.",
    },
  ];

  const body = () => {
    if (!shopId) {
      return (
        <StateBox icon={<Store />} title="Choose a shop">
          Pick a shop from the switcher at the top to edit its settings.
        </StateBox>
      );
    }
    if (isPending) return <StateBox loading title="Loading settings…" />;
    if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

    return (
      <FormRoot form={form} onSubmit={onSubmit} className={settingsForm}>
        {errorText && <AppAlert tone="danger">{errorText}</AppAlert>}

        <FormFieldGrid>
          {fields.map((field) => (
            <FormField key={field.name} config={field} />
          ))}
        </FormFieldGrid>

        <div className={settingsActions}>
          <AppButton type="submit" loading={isSaving} className={settingsSubmit}>
            Save shop settings
          </AppButton>
        </div>
      </FormRoot>
    );
  };

  return (
    <SectionCard title="Shop settings" description={shopName ?? undefined}>
      {body()}
    </SectionCard>
  );
};

export default ShopSettingsCard;
