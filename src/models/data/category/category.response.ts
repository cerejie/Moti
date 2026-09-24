export interface ICategory {
  id: string;
  name: string;
  // Archived items included: they still hold the category.
  item_count: number;
}
