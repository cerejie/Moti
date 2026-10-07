export interface IPaginationRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sort?: string;
}

export class IPaginationFormValue implements IPaginationRequest {
  pageNumber: number = 1;
  pageSize: number = 8;
  search?: string;
  sort?: string;

  constructor(values?: Partial<IPaginationRequest>) {
    Object.assign(this, values);
  }
}

export interface IPaginationResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export const emptyPage = <T>(
  pagination: IPaginationRequest,
): IPaginationResponse<T> => ({
  data: [],
  currentPage: pagination.pageNumber,
  pageSize: pagination.pageSize,
  totalPages: 0,
  totalCount: 0,
});

export const totalPages = (totalCount: number, pageSize: number) =>
  pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;

// Supabase .range() bounds for a 1-based page, inclusive at both ends.
export const pageRange = (pagination: IPaginationRequest): [number, number] => {
  const from = (pagination.pageNumber - 1) * pagination.pageSize;
  return [from, from + pagination.pageSize - 1];
};

export const toPage = <T>(
  data: T[],
  totalCount: number,
  pagination: IPaginationRequest,
): IPaginationResponse<T> => ({
  data,
  currentPage: pagination.pageNumber,
  pageSize: pagination.pageSize,
  totalPages: totalPages(totalCount, pagination.pageSize),
  totalCount,
});

export type IPageItem = number | "gap-start" | "gap-end";

// Phones load more rows by growing the page instead of stepping through pages.
export const loadMoreStep = 20;

export const grownPageSize = (pagination: IPaginationRequest) =>
  pagination.pageNumber * pagination.pageSize + loadMoreStep;

export const pageItems = (current: number, last: number): IPageItem[] => {
  const siblings = [current - 1, current, current + 1].filter(
    (page) => page > 1 && page < last,
  );
  const first = siblings.at(0);
  const final = siblings.at(-1);
  const items: IPageItem[] = [1];

  if (first !== undefined && first > 2) items.push("gap-start");
  items.push(...siblings);
  if (final !== undefined && final < last - 1) items.push("gap-end");
  if (last > 1) items.push(last);

  return items;
};
