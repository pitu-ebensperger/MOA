import { useMemo, useState } from "react";
import ProductGallery from "../components/ProductGallery.jsx";
import { ProductSidebar } from "../components/ProductSidebar.jsx";
import { ProductFiltersDrawer } from "../components/ProductFiltersDrawer.jsx";
import { CATEGORIES, PRODUCTS as PRODUCTS_MOCK } from "../../../utils/mockdata.js";

const ensureNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const matchesCategory = (product, categoryId) => {
  if (categoryId === "all") return true;
  if (!categoryId) return true;

  const idString = String(categoryId);
  const productId = product?.categoryId;
  if (productId !== undefined && productId !== null) {
    if (productId === categoryId || String(productId) === idString) return true;
  }

  if (Array.isArray(product?.categoryIds)) {
    return product.categoryIds.some((cat) => cat === categoryId || String(cat) === idString);
  }

  return false;
};

export default function ProductsPage({ products }) {
  const allProducts = Array.isArray(products) && products.length ? products : PRODUCTS_MOCK ?? [];

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = allProducts.map((product) => ensureNumber(product.price, 0));
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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const price = ensureNumber(product.price, 0);
      const withinPriceRange = price >= ensureNumber(min, minPrice) && price <= ensureNumber(max, maxPrice);
      const matchesCat = matchesCategory(product, category);
      return withinPriceRange && matchesCat;
    });
  }, [allProducts, category, min, max, minPrice, maxPrice]);

  const activeCategory = useMemo(() => {
    if (category === "all") return null;
    return CATEGORIES.find((cat) => cat.id === category || String(cat.id) === String(category));
  }, [category]);

  const appliedFilters = [
    activeCategory ? { label: activeCategory.name, type: "category" } : null,
    min > minPrice ? { label: `Desde ${min.toLocaleString("es-CL")} CLP`, type: "min" } : null,
    max < maxPrice ? { label: `Hasta ${max.toLocaleString("es-CL")} CLP`, type: "max" } : null,
  ].filter(Boolean);

  const handleRemoveFilter = (type) => {
    if (type === "category") setCategory("all");
    if (type === "min") setMin(minPrice);
    if (type === "max") setMax(maxPrice);
  };

  const sortedProducts = useMemo(() => {
    if (sort === "relevance") return filteredProducts;
    const copy = [...filteredProducts];
    if (sort === "price-asc") {
      return copy.sort((a, b) => ensureNumber(a.price, 0) - ensureNumber(b.price, 0));
    }
    if (sort === "price-desc") {
      return copy.sort((a, b) => ensureNumber(b.price, 0) - ensureNumber(a.price, 0));
    }
    if (sort === "name-asc") {
      return copy.sort((a, b) => (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? ""));
    }
    return copy;
  }, [filteredProducts, sort]);

  const resetFilters = () => {
    setCategory("all");
    setMin(minPrice);
    setMax(maxPrice);
  };

  return (
    <main className="page container-px mx-auto py-10 max-w-7xl">
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="title-serif text-3xl sm:text-4xl">Productos</h1>
          <p className="ui-sans text-sm text-[var(--text-weak)]">
            Encontrá tus piezas favoritas seleccionando filtros por categoría y rango de precio.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <span className="ui-sans text-sm text-[var(--text-weak)]">
            {filteredProducts.length} resultado{filteredProducts.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--text-weak)]">
              Ordenar por
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-full border border-[var(--line,#e3ddd3)] bg-white px-3 py-2 text-sm text-neutral-700 transition focus:border-[var(--color-primary-brown,#443114)] focus:outline-none"
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
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-brown,#443114)] px-3 py-2 text-sm font-medium text-[var(--color-primary-brown,#443114)] transition hover:bg-[var(--color-primary-brown,#443114)] hover:text-white lg:hidden"
            >
              Filtros
            </button>
          </div>
        </div>
      </header>

      {appliedFilters.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-[var(--color-light-beige,#f6efe7)] px-5 py-3">
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
          categories={CATEGORIES}
          filters={{ category, min, max }}
          limits={{ min: minPrice, max: maxPrice }}
          onChangeCategory={setCategory}
          onChangePrice={({ min: nextMin, max: nextMax }) => {
            setMin(ensureNumber(nextMin, minPrice));
            setMax(ensureNumber(nextMax, maxPrice));
          }}
          onReset={resetFilters}
        />

        <ProductGallery products={sortedProducts} />
      </div>

      <ProductFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        categories={CATEGORIES}
        filters={{ category, min, max }}
        limits={{ min: minPrice, max: maxPrice }}
        onChangeCategory={(next) => setCategory(next)}
        onChangePrice={({ min: nextMin, max: nextMax }) => {
          setMin(ensureNumber(nextMin, minPrice));
          setMax(ensureNumber(nextMax, maxPrice));
        }}
        onReset={resetFilters}
      />
    </main>
  );
}
