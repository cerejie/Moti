import type { ReactNode } from "react";
import { MapPin, Pencil, Ruler, Trash2 } from "lucide-react";
import {
  masterfileKindLabels,
  type MasterfileKind,
} from "../../../enums/masterfile.enum";
import {
  useDeleteMasterfileEntry,
  useMasterfileFormModal,
} from "../../../hook/data/masterfile/masterfile.form.hook";
import { useMasterfileOptions } from "../../../hook/data/masterfile/masterfile.list.hook";
import type { IMasterfileEntry } from "../../../models/data/masterfile/masterfile.response";
import { formatItemCount } from "../../../utils/format.utils";
import MasterfileList from "./MasterfileList";

type IProps = {
  kind: MasterfileKind;
};

const emptyStates: Record<MasterfileKind, { icon: ReactNode; title: string; text: string }> = {
  unit: {
    icon: <Ruler />,
    title: "No units yet",
    text: "Add how items are counted, like pc, set or bottle.",
  },
  location: {
    icon: <MapPin />,
    title: "No locations yet",
    text: "Add the shelves, drawers and racks where stock is kept.",
  },
};

// The Units or Locations tab.
const MasterfileEntryPanel = ({ kind }: IProps) => {
  const { data: entries = [], isLoading, isError, error, refetch } = useMasterfileOptions(kind);
  const { openCreate, openRename } = useMasterfileFormModal(kind);
  const deleteEntry = useDeleteMasterfileEntry(kind);
  const noun = masterfileKindLabels[kind];
  const empty = emptyStates[kind];

  return (
    <MasterfileList<IMasterfileEntry>
      rows={entries}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      noun={noun}
      addLabel={`Add ${noun.one}`}
      onAdd={openCreate}
      metaOf={(entry) => formatItemCount(entry.item_count)}
      actionsFor={(entry) => [
        { key: "rename", label: "Rename", icon: <Pencil />, onSelect: () => openRename(entry) },
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 />,
          danger: true,
          // The database refuses too; this only saves a pointless attempt.
          disabled: entry.item_count > 0,
          onSelect: () => deleteEntry(entry),
        },
      ]}
      emptyIcon={empty.icon}
      emptyTitle={empty.title}
      emptyText={empty.text}
    />
  );
};

export default MasterfileEntryPanel;
