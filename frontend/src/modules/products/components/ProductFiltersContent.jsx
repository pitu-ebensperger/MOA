import { useMemo } from "react";
import { DoubleRangeSlider } from "./DoubleRangeSlider.jsx";

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

export function ProductFiltersContent({
  categories,
  filters,
  limits,
  onChangeCategory,
  onChangePrice,
}) {
  const normalizedCategories = useMemo(() => normalizeCategories(categories), [categories]);
  const minLimit = limits?.min ?? 0;
  const maxLimit = limits?.max ?? 0;
  const selectedMin = clampValue(Math.round(filters.min), minLimit, maxLimit);
  const selectedMax = clampValue(Math.round(filters.max), selectedMin, maxLimit);
  const sliderStep = Math.max(1, Math.round((maxLimit - minLimit) / 40));

  const updateRange = (nextMin, nextMax) => {
    const boundedMin = clampValue(Number(nextMin), minLimit, maxLimit);
    const boundedMax = clampValue(Number(nextMax), minLimit, maxLimit);
    const normalizedMin = Math.min(boundedMin, boundedMax);
    const normalizedMax = Math.max(boundedMin, boundedMax);
    onChangePrice({
      min: normalizedMin,
      max: normalizedMax,
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-700">Categorías</h3>
        </header>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-700">Rango de precio</h3>
          <span className="text-xs text-neutral-500">
            {selectedMin.toLocaleString("es-CL")} – {selectedMax.toLocaleString("es-CL")} CLP
          </span>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={selectedMin}
              min={minLimit}
              max={selectedMax}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateRange(Number.isFinite(value) ? value : minLimit, selectedMax);
              }}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm transition focus:border-[var(--color-primary-brown,#443114)] focus:outline-none"
            />
            <input
              type="number"
              value={selectedMax}
              min={selectedMin}
              max={maxLimit}
              onChange={(event) => {
                const value = Number(event.target.value);
                updateRange(selectedMin, Number.isFinite(value) ? value : maxLimit);
              }}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm transition focus:border-[var(--color-primary-brown,#443114)] focus:outline-none"
            />
          </div>

          <DoubleRangeSlider
            min={minLimit}
            max={maxLimit}
            valueMin={selectedMin}
            valueMax={selectedMax}
            onChange={updateRange}
            step={sliderStep}
          />
        </div>
      </section>
    </div>
  );
}
