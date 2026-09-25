import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useShopFormModal } from "../../../hook/data/shop/shop.form.hook";

const ShopActions = () => {
  const { openCreate } = useShopFormModal();

  return (
    <AppButton onPress={openCreate}>
      <Plus />
      Add shop
    </AppButton>
  );
};

export default ShopActions;
