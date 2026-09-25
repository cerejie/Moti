import { PackageSearch } from "lucide-react";
import FilterToolbar from "../../common/filter/FilterToolbar";
import ErrorState from "../../common/status/ErrorState";
import StateBox from "../../common/status/StateBox";
import TablePagination from "../../common/table/TablePagination";
import SegmentTabs from "../../common/view/SegmentTabs";
import {
  allCategories,
  useProductCategory,
  useProductList,
} from "../../../hook/data/transaction/transaction.list.hook";
import { useCart } from "../../../hook/data/transaction/transaction.form.hook";
import { productTableKey } from "../../../keys/table.keys";
import {
  categoryChipsScroll,
  productGrid,
  productPanel,
} from "../../../styles/transaction/transaction.styles";
import ProductCard from "../cards/ProductCard";

const pageSizes = [8, 16, 32];

const ProductPanel = () => {
  const { data, isLoading, isError, error, refetch, search } = useProductList();
  const { categoryId, categories, setCategoryId } = useProductCategory();
  const { quantityOf, addItem } = useCart();
  const items = data?.data ?? [];

  const chips = [
    { key: allCategories, label: "All" },
    ...categories.map((category) => ({ key: category.id, label: category.name })),
  ];

  const body = () => {
    if (isLoading) return <StateBox loading title="Loading items…" />;
    if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;
    if (items.length === 0) {
      return (
        <StateBox icon={<PackageSearch />} title="No items found">
          {search || categoryId !== allCategories
            ? "No active items match this search or category."
            : "Add items in Inventory to start selling."}
        </StateBox>
      );
    }

    return (
      <div className={productGrid}>
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            inCart={quantityOf(item.id)}
            onAdd={addItem}
          />
        ))}
      </div>
    );
  };

  return (
    <section className={productPanel} aria-label="Products">
      <FilterToolbar
        filterKey={productTableKey}
        searchKey={productTableKey}
        searchPlaceholder="Search item name, code or part no."
      />
      {chips.length > 1 && (
        <div className={categoryChipsScroll}>
          <SegmentTabs
            label="Category"
            value={categoryId}
            onValueChange={setCategoryId}
            tabs={chips}
          />
        </div>
      )}
      {body()}
      <TablePagination
        paginationKey={productTableKey}
        totalCount={data?.totalCount ?? 0}
        pageSizes={pageSizes}
      />
    </section>
  );
};

export default ProductPanel;
