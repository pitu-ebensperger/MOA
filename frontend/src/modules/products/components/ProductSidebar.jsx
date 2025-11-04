import { useMemo } from "react";

const normalizeCategories = (categories = []) => {
  const base = Array.isArray(categories) ? categories : [];
  const mapped = base
    .map((cat, index) => {
      if (typeof cat === "string") {
        return { id: `cat-${index}`, name: cat };
      }
      if (cat && (cat.id || cat.slug || cat.name)) {
        return {
          id: cat.id ?? cat.slug ?? `cat-${index}`,
          name: cat.name ?? cat.slug ?? String(cat.id ?? `Categoría ${index + 1}`),
        };
      }
      return null;
    })
    .filter(Boolean);

  const hasAll = mapped.some((cat) => cat.id === "all");
  return hasAll ? mapped : [{ id: "all", name: "Todas" }, ...mapped];
};

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

export function ProductSidebar({
  categories,
  filters,
  limits,
  onChangeCategory,
  onChangePrice,
  onReset,
}) {
  const normalizedCategories = useMemo(() => normalizeCategories(categories), [categories]);
  const minLimit = limits?.min ?? 0;
  const maxLimit = limits?.max ?? 0;
  const selectedMin = clampValue(filters.min, minLimit, maxLimit);
  const selectedMax = clampValue(filters.max, selectedMin, maxLimit);

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

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-700">Categorías</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
            {normalizedCategories.map((cat) => {
              const active = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChangeCategory(cat.id)}
                  className={[
                    "flex w-full items-center justify-between rounded-xl border px-4 py-2 text-sm transition",
                    active
                      ? "border-[var(--color-primary-brown,#443114)] bg-[var(--color-primary-brown,#443114)] text-white"
                      : "border-transparent bg-white text-neutral-700 hover:border-neutral-200",
                  ].join(" ")}
                >
                  <span>{cat.name}</span>
                  {active && <span aria-hidden>•</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-700">Rango de precio</h3>
            <span className="text-xs text-neutral-500">
              {selectedMin.toLocaleString("es-CL")} – {selectedMax.toLocaleString("es-CL")} CLP
            </span>
          </div>

          <div className="grid gap-4">
            <label className="space-y-2 text-xs font-medium text-neutral-500">
              <span>Mínimo</span>
              <input
                type="number"
                value={selectedMin}
                min={minLimit}
                max={selectedMax}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  onChangePrice({
                    min: clampValue(Number.isFinite(value) ? value : minLimit, minLimit, selectedMax),
                    max: selectedMax,
                  });
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm transition focus:border-[var(--color-primary-brown,#443114)] focus:outline-none"
              />
            </label>

            <label className="space-y-2 text-xs font-medium text-neutral-500">
              <span>Máximo</span>
              <input
                type="number"
                value={selectedMax}
                min={selectedMin}
                max={maxLimit}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  onChangePrice({
                    min: selectedMin,
                    max: clampValue(Number.isFinite(value) ? value : maxLimit, selectedMin, maxLimit),
                  });
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm transition focus:border-[var(--color-primary-brown,#443114)] focus:outline-none"
              />
            </label>

            <div className="grid gap-3">
              <input
                type="range"
                min={minLimit}
                max={selectedMax}
                value={selectedMin}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  onChangePrice({
                    min: clampValue(Number.isFinite(value) ? value : minLimit, minLimit, selectedMax),
                    max: selectedMax,
                  });
                }}
                className="w-full accent-[var(--color-primary-brown,#443114)]"
              />
              <input
                type="range"
                min={selectedMin}
                max={maxLimit}
                value={selectedMax}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  onChangePrice({
                    min: selectedMin,
                    max: clampValue(Number.isFinite(value) ? value : maxLimit, selectedMin, maxLimit),
                  });
                }}
                className="w-full accent-[var(--color-primary-brown,#443114)]"
              />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
