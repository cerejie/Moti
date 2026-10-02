import { Plus } from "lucide-react";
import { useModal } from "../../../hook/common/modal.hook";
import { brandFormModalKey } from "../../../keys/modal.keys";
import type { IBrand } from "../../../models/data/brand/brand.response";
import AppButton from "../../common/button/AppButton";

const BrandCreateButton = () => {
  const { openModal } = useModal<IBrand>(brandFormModalKey);

  return (
    <AppButton onPress={() => openModal()}>
      <Plus />
      Add brand
    </AppButton>
  );
};

export default BrandCreateButton;
