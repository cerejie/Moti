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
