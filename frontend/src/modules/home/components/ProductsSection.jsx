import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../products/components/ProductCard.jsx";
import { productsDb, categoriesDb } from "../../../mocks/database/index.js";

const getMockProducts = () => {
  if (Array.isArray(productsDb?.PRODUCTS)) return productsDb.PRODUCTS;
  if (Array.isArray(productsDb?.products)) return productsDb.products;
  return [];
};

const getMockCategories = () => {
  if (Array.isArray(categoriesDb?.CATEGORIES) && categoriesDb.CATEGORIES.length) {
    return categoriesDb.CATEGORIES.filter((category) => category.parentId === null);
  }
  if (Array.isArray(categoriesDb?.categories) && categoriesDb.categories.length) {
    return categoriesDb.categories.filter((category) => category.parentId === null);
  }
  return [];
};

const FALLBACK_PRODUCTS = getMockProducts();
const FALLBACK_CATEGORIES = getMockCategories();

const normalizeProduct = (product, index) => {
  const safeId = product?.id ?? `featured-${index}`;
  const normalizedTitle = product?.title ?? product?.name ?? product?.nombre ?? `Producto ${index + 1}`;
  const normalizedImage =
    product?.image ?? product?.imageUrl ?? product?.imagen_url ?? product?.coverImage;
  const normalizedPrice = product?.price ?? product?.precio ?? 50000;
  const normalizedCategoryId =
    product?.categoryId ?? product?.fk_categoria_id ?? product?.categoria_id ?? null;

  return {
    ...product,
    id: safeId,
    title: normalizedTitle,
    name: product?.name ?? product?.nombre ?? product?.title,
    image: normalizedImage,
    imageUrl: normalizedImage,
    price: normalizedPrice,
    categoryId: normalizedCategoryId ?? product?.categoryId,
    categoryIds: Array.isArray(product?.categoryIds)
      ? product.categoryIds
      : normalizedCategoryId !== null
        ? [normalizedCategoryId]
        : product?.categoryIds,
  };
};

const buildTabs = (categories) => {
  const source = Array.isArray(categories) && categories.length ? categories : FALLBACK_CATEGORIES;

  const items = source
    .map((category, index) => {
      const filterValue = category?.id ?? category?.slug ?? category?.name ?? `category-${index}`;
      return {
        id: String(category?.id ?? category?.slug ?? index),
        label: category?.name ?? category?.title ?? `Categoría ${index + 1}`,
        value: filterValue,
      };
    })
    .filter((item) => Boolean(item.label));

  const hasAll = items.some((item) => item.value === "all");
  return hasAll ? items : [{ id: "all", label: "Todos", value: "all" }, ...items];
};

const matchesCategory = (product, categoryValue) => {
  if (!categoryValue || categoryValue === "all") return true;

  const pool = [
    product?.categoryId,
    ...(Array.isArray(product?.categoryIds) ? product.categoryIds : []),
  ].filter((id) => id !== undefined && id !== null);

  const comparer = String(categoryValue).toLowerCase();
  return pool.some((catId) => String(catId).toLowerCase() === comparer);
};

export default function ProductsSection({ products, categories }) {
  const tabs = useMemo(() => buildTabs(categories), [categories]);
  const [activeCategory, setActiveCategory] = useState(tabs[0]?.value ?? "all");

  useEffect(() => {
    const fallbackValue = tabs[0]?.value ?? "all";
    const isValid = tabs.some((tab) => String(tab.value) === String(activeCategory));
    if (!isValid) {
      setActiveCategory(fallbackValue);
    }
  }, [tabs, activeCategory]);

  const items = useMemo(() => {
    const source = Array.isArray(products) && products.length ? products : FALLBACK_PRODUCTS;
    const normalized = source.map(normalizeProduct);
    const filtered = normalized.filter((product) => matchesCategory(product, activeCategory));
    return filtered.slice(0, 4);
  }, [products, activeCategory]);

  return (
    <div className="space-y-8 p-10">
      <div className="text-center space-y-3 pb-10">
        <h2 className="font-italiana text-4xl text-dark">Productos</h2>
        <p className="font-garamond text-secondary1 mx-auto max-w-2xl">
          Explora nuestras categorías principales y descubre piezas curadas para cada ambiente.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-6 border-b border-neutral-200 sm:justify-between">
        {tabs.map((tab) => {
          const isActive = String(tab.value) === String(activeCategory);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.value)}
              className={`group relative pb-3 font-garamond text-base tracking-wide transition-colors ${
                isActive
                  ? "text-dark"
                  : "text-(--color-secondary1,#6b4e2f) hover:text-(--color-primary-brown,#6b4e2f)"
              }`}
            >
              {tab.label}
              <span
                className={`pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors ${
                  isActive
                    ? "bg-(--color-primary-brown,#443114)"
                    : "bg-transparent group-hover:bg-(--color-primary-brown,#c8a889)"
                }`}
              />
            </button>
          );
        })}
      </div>

      {items.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/80 px-6 py-10 text-center text-sm text-neutral-500">
          No encontramos productos destacados.
        </div>
      )}

      <div className="flex justify-center pt-1">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border border-dark px-5 py-2 text-sm font-medium text-dark transition hover:bg-dark hover:text-white"
        >
          Ver más productos
          <span aria-hidden className="text-base leading-none">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
