import { useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../../../components/layout/Breadcrumbs.jsx";
import ProductGallery from "../components/ProductGallery.jsx";
import { ProductSidebar } from "../components/ProductSidebar.jsx";
import { ProductFiltersDrawer } from "../components/ProductFiltersDrawer.jsx";
import { PaginationControls } from "../components/PaginationControls.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { useCategories } from "../hooks/useCategories.js";
import { formatCurrencyCLP } from "../../../utils/currency.js";

const ensureNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const DEFAULT_PAGE_SIZE = 9;
const PAGE_SIZE_OPTIONS = [DEFAULT_PAGE_SIZE, 12, 18, 24];

const resolveProductPrice = (product) => {
  const rawPrice =
    product?.price ??
    product?.precio ??
    product?.priceCLP ??
    product?.precioCLP ??
    product?.pricing?.price ??
    null;
  if (rawPrice === null) return null;
  const numericValue = Number(rawPrice);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const matchesCategory = (product, categoryId) => {
  if (categoryId === "all") return true;
  if (!categoryId) return true;

  const idString = String(categoryId).toLowerCase();
  const candidates = [
    product?.categoryId,
    product?.fk_categoria_id,
    product?.categoria_id,
    product?.categoria_slug,
  ];

  if (Array.isArray(product?.categoryIds)) {
    candidates.push(...product.categoryIds);
  }
  if (Array.isArray(product?.category_slugs)) {
    candidates.push(...product.category_slugs);
  }

  return candidates
    .filter((value) => value !== undefined && value !== null)
    .some((value) => String(value).toLowerCase() === idString);
};

export default function ProductsPage() {
  const { products: fetchedProducts, isLoading, error } = useProducts();
  const { categories: fetchedCategories } = useCategories();

  const categories = useMemo(() => {
    const base = Array.isArray(fetchedCategories) ? fetchedCategories : [];
    const hasAll = base.some((category) => category.id === "all");
    return hasAll ? base : [{ id: "all", name: "Todos" }, ...base];
  }, [fetchedCategories]);

  const allProducts = useMemo(
    () => (Array.isArray(fetchedProducts) && fetchedProducts.length ? fetchedProducts : []),
    [fetchedProducts],
  );

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = allProducts
      .map((product) => resolveProductPrice(product))
      .filter((value) => Number.isFinite(value));
    if (!prices.length) return { minPrice: 0, maxPrice: 0 };
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [allProducts]);

  const [category, setCategory] = useState("all");
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const [sort, setSort] = useState("relevance");
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const price = resolveProductPrice(product) ?? 0;
      const safeMin = ensureNumber(min, minPrice);
      const safeMax = ensureNumber(max, maxPrice);
      const withinPriceRange = price >= safeMin && price <= safeMax;
      const matchesCat = matchesCategory(product, category);
      return withinPriceRange && matchesCat;
    });
  }, [allProducts, category, min, max, minPrice, maxPrice]);

  const sortedProducts = useMemo(() => {
    if (sort === "relevance") return filteredProducts;
    const copy = [...filteredProducts];
    if (sort === "price-asc") {
      return copy.sort(
        (a, b) => (resolveProductPrice(a) ?? 0) - (resolveProductPrice(b) ?? 0),
      );
    }
    if (sort === "price-desc") {
      return copy.sort(
        (a, b) => (resolveProductPrice(b) ?? 0) - (resolveProductPrice(a) ?? 0),
      );
    }
    if (sort === "name-asc") {
      return copy.sort((a, b) => (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? ""));
    }
    return copy;
  }, [filteredProducts, sort]);

  const totalResults = sortedProducts.length;

  useEffect(() => {
    setMin(minPrice);
    setMax(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, min, max, sort]);

  useEffect(() => {
    const safeLimit = Math.max(1, ensureNumber(itemsPerPage, DEFAULT_PAGE_SIZE));
    const totalPages = Math.max(1, Math.ceil(totalResults / safeLimit || 1));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [itemsPerPage, totalResults]);

  const activeCategory = useMemo(() => {
    if (category === "all") return null;
    return categories.find(
      (cat) => cat.id === category || String(cat.id) === String(category),
    );
  }, [category, categories]);

  const appliedFilters = [
    activeCategory ? { label: activeCategory.name, type: "category" } : null,
    min > minPrice ? { label: `Desde ${formatCurrencyCLP(min)}`, type: "min" } : null,
    max < maxPrice ? { label: `Hasta ${formatCurrencyCLP(max)}`, type: "max" } : null,
  ].filter(Boolean);

  const handleRemoveFilter = (type) => {
    if (type === "category") setCategory("all");
    if (type === "min") setMin(minPrice);
    if (type === "max") setMax(maxPrice);
  };

  const resetFilters = () => {
    setCategory("all");
    setMin(minPrice);
    setMax(maxPrice);
    setCurrentPage(1);
  };

  const paginationInfo = useMemo(() => {
    const safeLimit = Math.max(1, ensureNumber(itemsPerPage, DEFAULT_PAGE_SIZE));
    const totalItems = totalResults;
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
    const safePage = Math.min(Math.max(1, ensureNumber(currentPage, 1)), totalPages);
    const startIndex = (safePage - 1) * safeLimit;
    const endIndex = Math.min(startIndex + safeLimit, totalItems);

    return {
      items: sortedProducts.slice(startIndex, endIndex),
      page: safePage,
      totalPages,
      totalItems,
      pageSize: safeLimit,
      start: totalItems === 0 ? 0 : startIndex + 1,
      end: endIndex,
    };
  }, [sortedProducts, currentPage, itemsPerPage]);
  const { items: paginatedProducts } = paginationInfo;

  const handleChangeItemsPerPage = (nextValue) => {
    const numericValue = Math.max(1, ensureNumber(nextValue, DEFAULT_PAGE_SIZE));
    setItemsPerPage(numericValue);
    setCurrentPage(1);
  };

  return (
    <main className="page mx-auto max-w-7xl px-4 py-10 sm:px-6">
     
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
         <Breadcrumbs
        className="mb-0"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Productos" },
        ]}
      />
  
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="flex items-center gap-2 text-sm text-(--text-weak)">
              Mostrar{" "}
              <select
                value={itemsPerPage}
                onChange={(event) => handleChangeItemsPerPage(event.target.value)}
                className="w-fit rounded-full border border-transparent bg-transparent px-2 py-2 text-sm text-neutral-700 transition focus:border-(--color-primary-brown,#443114) focus:outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-(--text-weak)">
              Ordenar por{" "}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-fit rounded-full border border-transparent bg-transparent px-2 py-2 text-sm text-neutral-700 transition focus:border-(--color-primary-brown,#443114) focus:outline-none"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre A-Z</option>
              </select>
            </label>
           
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-(--color-primary-brown,#443114) px-3 py-2 text-sm font-medium text-(--color-primary-brown,#443114) transition hover:bg-(--color-primary-brown,#443114) hover:text-white lg:hidden"
            >
              Filtros
            </button>
          </div>
        </div>
      </header>

      {appliedFilters.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-(--color-light-beige,#f6efe7) px-5 py-3 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Filtros activos
          </span>
          {appliedFilters.map((filter) => (
            <button
              key={filter.type}
              type="button"
              onClick={() => handleRemoveFilter(filter.type)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100"
            >
              {filter.label}
              <span aria-hidden className="text-neutral-400">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <ProductSidebar
          categories={categories}
          filters={{ category, min, max }}
          limits={{ min: minPrice, max: maxPrice }}
          appliedFilters={appliedFilters}
          onChangeCategory={setCategory}
          onChangePrice={({ min: nextMin, max: nextMax }) => {
            setMin(ensureNumber(nextMin, minPrice));
            setMax(ensureNumber(nextMax, maxPrice));
          }}
          onRemoveFilter={handleRemoveFilter}
          onReset={resetFilters}
        />

        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              No pudimos cargar los productos. Intenta nuevamente más tarde.
            </div>
          )}
          {isLoading && paginationInfo.totalItems === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`product-skeleton-${index}`}
                  className="h-80 rounded-2xl bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <ProductGallery products={paginatedProducts} />
          )}
        </div>
      </div>

      {paginationInfo.totalItems > 0 && (
        <div className="mt-10 flex justify-center">
          <PaginationControls
            page={paginationInfo.page}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ProductFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        categories={categories}
        filters={{ category, min, max }}
        limits={{ min: minPrice, max: maxPrice }}
        appliedFilters={appliedFilters}
        onChangeCategory={(next) => setCategory(next)}
        onChangePrice={({ min: nextMin, max: nextMax }) => {
          setMin(ensureNumber(nextMin, minPrice));
          setMax(ensureNumber(nextMax, maxPrice));
        }}
        onRemoveFilter={handleRemoveFilter}
        onReset={resetFilters}
      />
    </main>
  );
}
