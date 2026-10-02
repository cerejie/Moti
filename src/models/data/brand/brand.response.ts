export interface IBrand {
  id: string;
  name: string;
  created_at: string;
  // PostgREST's embedded count of items carrying the brand.
  inventory_items: { count: number }[];
}

export interface IBrandOption {
  id: string;
  name: string;
}
