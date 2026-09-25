import EntityFormModal from "../../common/form/EntityFormModal";
import type { MasterfileKind } from "../../../enums/masterfile.enum";
import { useMasterfileForm } from "../../../hook/data/masterfile/masterfile.form.hook";
import type { IMasterfileRequest } from "../../../models/data/masterfile/masterfile.request";

type IProps = {
  kind: MasterfileKind;
};

const placeholders: Record<MasterfileKind, string> = {
  unit: "e.g. set, bottle",
  location: "e.g. Shelf A1",
};

const MasterfileFormModal = ({ kind }: IProps) => {
  const { form, onSubmit, label, open, isEditing, onOpenChange, errorText, isPending } =
    useMasterfileForm(kind);

  return (
    <EntityFormModal<IMasterfileRequest>
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `Rename ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
      size="sm"
      form={form}
      fields={[
        { name: "name", label: "Name", type: "text", span: "full", required: true, placeholder: placeholders[kind] },
      ]}
      onSubmit={onSubmit}
      submitting={isPending}
      submitLabel={isEditing ? "Save" : `Add ${label.toLowerCase()}`}
      error={errorText}
    />
  );
};

export default MasterfileFormModal;
