import { usePermissions } from "../../../hook/data/auth/auth.session.hook";
import { useShopOptions } from "../../../hook/data/shop/shop.list.hook";
import {
  selectActiveShopId,
  useShopStore,
} from "../../../store/data/shop/shop.store";
import { topbarShopSwitcher } from "../../../styles/layout/topbar.styles";
import SelectInput from "../form/SelectInput";

// Superadmin only: picks the shop every owner screen opens for.
const ShopSwitcher = () => {
  const { isSuperadmin } = usePermissions();
  const { data: shops = [], isPending } = useShopOptions();
  const activeShopId = useShopStore(selectActiveShopId);
  const setActiveShopId = useShopStore((state) => state.setActiveShopId);

  if (!isSuperadmin) return null;

  const options = shops.map((shop) => ({
    value: shop.id,
    label: shop.is_active ? shop.name : `${shop.name} (suspended)`,
  }));

  return (
    <SelectInput
      label="Shop"
      value={activeShopId ?? ""}
      onValueChange={(value) => setActiveShopId(value || null)}
      options={options}
      placeholder={isPending ? "Loading shops…" : "Choose a shop"}
      disabled={isPending}
      className={topbarShopSwitcher}
    />
  );
};

export default ShopSwitcher;
