export interface IBranch {
  id: string;
  name: string;
  sort: number;
  archived_at: string | null;
  created_at: string;
  // PostgREST's embedded count of the items this branch carries.
  branch_stock: { count: number }[];
}
