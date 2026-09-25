export interface ICategory {
  id: string;
  name: string;
  // The first part of its items' codes, e.g. BRK.
  code: string;
  // The brands it carries; an item's brand must be one of them.
  brand_ids: string[];
  // Archived items included: they still hold the category.
  item_count: number;
}
