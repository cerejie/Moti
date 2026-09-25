export interface IBrand {
  id: string;
  name: string;
  // The middle part of its items' codes, e.g. UMI.
  code: string;
  // The categories that carry it.
  category_ids: string[];
  // Archived items included: they still hold the brand.
  item_count: number;
}
