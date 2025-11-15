import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../products/components/ProductCard.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { createCategoryMatcher } from "../../products/utils/products.js";
import { ALL_CATEGORY_ID } from "../../../utils/constants.js";
import { API_PATHS } from "../../../config/api-paths.js";

const normalizeProduct = (product, index) => {
  const safeId = product?.id ?? `featured-${index}`;
  const normalizedName = product?.name ?? product?.slug ?? `Producto ${index + 1}`;
  const normalizedImage = product?.imgUrl ?? product?.gallery?.[0] ?? null;
  const normalizedPrice = product?.price ?? 50000;

  return {
    ...product,
    id: safeId,
    name: normalizedName,
    imgUrl: normalizedImage,
    price: normalizedPrice,
  };
};

const buildTabs = (categories) => {
  const source =
    Array.isArray(categories) && categories.length
      ? categories.filter((category) => category?.parentId === null || category?.parentId === undefined)
      : [];

  const items = source
    .map((category, index) => {
      const filterValue = category?.id ?? category?.slug ?? `category-${index}`;
      return {
        id: String(category?.id ?? category?.slug ?? index),
        label: category?.name ?? `Categoría ${index + 1}`,
        value: filterValue,
      };
    })
    .filter((item) => Boolean(item.label));

  const hasAll = items.some((item) => String(item.value) === String(ALL_CATEGORY_ID));
  const baseTabs = hasAll
    ? items
    : [{ id: ALL_CATEGORY_ID, label: "Todos", value: ALL_CATEGORY_ID }, ...items];

  return baseTabs.length ? baseTabs : [{ id: ALL_CATEGORY_ID, label: "Todos", value: ALL_CATEGORY_ID }];
};

export default function ProductsSection({ products, categories }) {
  const tabs = useMemo(() => buildTabs(categories), [categories]);
  const [activeCategory, setActiveCategory] = useState(tabs[0]?.value ?? ALL_CATEGORY_ID);
  const matchCategory = useMemo(
    () => createCategoryMatcher(Array.isArray(categories) ? categories : []),
    [categories],
  );

  useEffect(() => {
    const fallbackValue = tabs[0]?.value ?? ALL_CATEGORY_ID;
    const isValid = tabs.some((tab) => String(tab.value) === String(activeCategory));
    if (!isValid) {
      setActiveCategory(fallbackValue);
    }
  }, [tabs, activeCategory]);

  const items = useMemo(() => {
    const source = Array.isArray(products) ? products : [];
    const normalized = source.map(normalizeProduct);
    const filtered = normalized.filter((product) =>
      matchCategory(product, activeCategory),
    );
    return filtered.slice(0, 4);
  }, [products, activeCategory, matchCategory]);

  return (
    <div className="space-y-8 p-10">
      <div className="text-center space-y-3 pb-10">
        <h2 className="font-italiana text-4xl text-dark">Productos</h2>
        <p className="font-garamond text-secondary1 mx-auto max-w-2xl">
          Explora nuestras categorías principales y descubre piezas curadas para cada ambiente.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-6 border-b border-[rgba(207,195,181,0.5)] sm:justify-between">
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
                  : "text-(--color-secondary1,#6b4e2f) hover:text-(--color-primary1,#6B5444)"
              }`}
            >
              {tab.label}
              <span
                className={`pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors ${
                  isActive
                    ? "bg-(--color-primary1,#6B5444)"
                    : "bg-transparent group-hover:bg-(--color-primary1,#c8a889)"
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
        <Button
          to={API_PATHS.products.products}
          appearance="outline"
          intent="primary"
          shape="pill"
          motion={["lift", "icon-slide"]}
          size="md"
          className="gap-2 text-sm font-medium"
        >
          Ver más productos
          <span aria-hidden className="text-base leading-none btn-icon-right">&rarr;</span>
        </Button>
      </div>
    </div>
  );
}
