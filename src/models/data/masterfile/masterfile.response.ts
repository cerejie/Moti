// One unit or storage location.
export interface IMasterfileEntry {
  id: string;
  name: string;
  // Archived items included: they still hold the entry.
  item_count: number;
}
