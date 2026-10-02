export interface ICategory {
  id: string;
  name: string;
  created_at: string;
  // PostgREST's embedded count of items in the category.
  inventory_items: { count: number }[];
}

export interface ICategoryOption {
  id: string;
  name: string;
}
