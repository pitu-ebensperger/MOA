import { ProductFiltersContent } from "./ProductFiltersContent.jsx";

export function ProductSidebar({
  categories,
  filters,
  limits,
  onChangeCategory,
  onChangePrice,
  onReset,
}) {
  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col">
      <div className="sticky top-28 rounded-3xl border border-[var(--line,#e3ddd3)] bg-white/95 p-6 shadow-sm backdrop-blur">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Filtros</h2>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-[var(--color-primary-brown,#443114)] underline-offset-2 transition hover:underline"
          >
            Limpiar
          </button>
        </header>

        <ProductFiltersContent
          categories={categories}
          filters={filters}
          limits={limits}
          onChangeCategory={onChangeCategory}
          onChangePrice={onChangePrice}
        />
      </div>
    </aside>
  );
}
