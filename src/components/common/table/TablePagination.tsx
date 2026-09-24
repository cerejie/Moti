import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/cn.utils";
import { usePagination } from "../../../hook/common/pagination.hook";
import { totalPages as countPages } from "../../../models/common/pagination.model";
import {
  paginationControls,
  paginationRoot,
  paginationSizeGroup,
  paginationSizeLabel,
  paginationSizeTrigger,
  paginationStep,
  paginationStepDisabled,
} from "../../../styles/table/pagination.styles";

type IProps = {
  // Stable key for the pagination store; use the keys in keys/table.keys.ts.
  paginationKey: string;
  totalCount: number;
  // Offer a rows-per-page picker; left off, the store's page size is fixed.
  pageSizes?: number[];
  className?: string;
};

const TablePagination = ({
  paginationKey,
  totalCount,
  pageSizes = [],
  className,
}: IProps) => {
  const { pagination, setPagination } = usePagination(paginationKey);
  const showSizePicker = pageSizes.length > 1;

  const pageCount = countPages(totalCount, pagination.pageSize);
  const hasPrevious = pagination.pageNumber > 1;
  const hasNext = pagination.pageNumber < pageCount;

  const firstRow = totalCount === 0 ? 0 : (pagination.pageNumber - 1) * pagination.pageSize + 1;
  const lastRow = Math.min(pagination.pageNumber * pagination.pageSize, totalCount);

  return (
    <div className={cn(paginationRoot, className)}>
      <p className={paginationSizeLabel}>
        {totalCount === 0
          ? "No records"
          : `Showing ${firstRow}–${lastRow} of ${totalCount}`}
      </p>

      <div className={paginationControls}>
        {showSizePicker && (
          <div className={paginationSizeGroup}>
            <span className={paginationSizeLabel}>Rows</span>
            <Select
              value={String(pagination.pageSize)}
              // Changing page size invalidates the current offset, so go back to page one.
              onChange={(key) =>
                setPagination({ pageSize: Number(key), pageNumber: 1 })
              }
              aria-label="Rows per page"
              className={paginationSizeTrigger}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizes.map((size) => (
                    <SelectItem key={size} id={String(size)}>
                      {String(size)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                isDisabled={!hasPrevious}
                className={cn(
                  paginationStep,
                  !hasPrevious && paginationStepDisabled,
                )}
                onPress={() =>
                  setPagination({ pageNumber: pagination.pageNumber - 1 })
                }
              />
            </PaginationItem>

            <PaginationItem>
              <span className={paginationSizeLabel}>
                Page {pagination.pageNumber} of {Math.max(pageCount, 1)}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                isDisabled={!hasNext}
                className={cn(paginationStep, !hasNext && paginationStepDisabled)}
                onPress={() =>
                  setPagination({ pageNumber: pagination.pageNumber + 1 })
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TablePagination;
