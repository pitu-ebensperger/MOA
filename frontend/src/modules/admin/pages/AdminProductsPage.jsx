import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Edit3, Eye, Trash2, X } from "lucide-react";
import { PRODUCTS } from "../../../mocks/database/products.js";
import { CATEGORIES } from "../../../mocks/database/categories.js";
import { formatCurrencyCLP } from "../../../utils/currency.js";
import Button from "../../../components/ui/Button.jsx";
import { Pagination } from "../../../components/ui/Pagination.jsx";

const SORT_FIELDS = {
  stock: (a) => (typeof a.stock === "number" ? a.stock : 0),
  price: (a) => (typeof a.price === "number" ? a.price : 0),
  name: (a) => (a.name ?? "").toLowerCase(),
};

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((category) => [category.id, category.name]));

const PUBLICATION_BADGES = {
  activo: { label: "Activo", classes: "bg-emerald-50 text-emerald-700" },
  borrador: { label: "Borrador", classes: "bg-amber-50 text-amber-700" },
  archivado: { label: "Archivado", classes: "bg-neutral-100 text-neutral-500" },
};

const PAGE_SIZE = 6;
const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "critical", label: "Stock crítico" },
  { key: "activo", label: "Activo" },
  { key: "borrador", label: "Borrador" },
  { key: "archivado", label: "Archivado" },
];

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState({ field: "stock", direction: "desc" });
  const [detailProduct, setDetailProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dataset, setDataset] = useState(PRODUCTS);
  const [editProduct, setEditProduct] = useState(null);

  const totalProducts = dataset.length;
  const lowStock = dataset.filter((product) => typeof product.stock === "number" && product.stock <= 10);

  const preparedProducts = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    let list = dataset.filter((product) => {
      if (!normalizedTerm) return true;
      const label = `${product.name} ${product.sku}`.toLowerCase();
      return label.includes(normalizedTerm);
    });

    const filtered = list.filter((product) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "critical") {
        return typeof product.stock === "number" && product.stock <= 8;
      }
      return (product.status ?? "activo").toLowerCase().startsWith(activeFilter);
    });

    const selector = SORT_FIELDS[sortKey.field] ?? SORT_FIELDS.stock;
    filtered.sort((a, b) => {
      const aValue = selector(a);
      const bValue = selector(b);
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortKey.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (aValue === bValue) return 0;
      return sortKey.direction === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [dataset, searchTerm, sortKey, activeFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortKey, activeFilter]);

  useEffect(() => {
    if (detailProduct) {
      setEditProduct({
        ...detailProduct,
        tagsText: (detailProduct.tags ?? []).join(", "),
      });
    } else {
      setEditProduct(null);
    }
  }, [detailProduct]);

  const totalPages = Math.max(1, Math.ceil(preparedProducts.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageProducts = preparedProducts.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = preparedProducts.length ? startIndex + 1 : 0;
  const showingTo = startIndex + pageProducts.length;

  const toggleSort = (field) => {
    setSortKey((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { field, direction: "desc" };
    });
  };

  const handleFieldChange = (field, value) => {
    if (!editProduct) return;
    setEditProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!editProduct) return;
    const normalizedTags = editProduct.tagsText
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const updated = {
      ...editProduct,
      tags: normalizedTags,
      status: editProduct.status,
    };
    setDataset((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setDetailProduct(updated);
    setEditProduct({
      ...updated,
      tagsText: normalizedTags.join(", "),
    });
  };

  return (
    <div className="space-y-6">
       <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold title-sans ">Productos</h1>
             <p className="text-xs font-medium uppercase tracking-[0.3em] text-secondary">Catálogo & Inventario</p>

          </div>

       </div>
      <section className="rounded-3xl bg-white p-6 shadow-md">
       
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Referencias activas</p>
            <p className="text-3xl font-semibold text-neutral-900">{totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Stock crítico</p>
            <p className="text-3xl font-semibold error">{lowStock.length}</p>
          </div>
        </div>
      </section>

  <header className="mb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const isActiveFilter = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                    isActiveFilter
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          
           <div className="flex items-center gap-3 text-sm font-regular text-neutral-500">
          <span
            role="button"
            onClick={() => toggleSort("stock")}
            className="cursor-pointer transition hover:text-neutral-900"
          >
            Ordenar por stock {sortKey.field === "stock" ? (sortKey.direction === "asc" ? "↑" : "↓") : ""}
          </span>
          <span
            role="button"
            onClick={() => toggleSort("price")}
            className="cursor-pointer transition hover:text-neutral-900"
          >
            Ordenar por precio {sortKey.field === "price" ? (sortKey.direction === "asc" ? "↑" : "↓") : ""}
          </span>
        </div>
        </div>
       
      </header>
      <section className="rounded-3xl bg-white p-0 shadow-[0_20px_45px_rgba(0,0,0,0.05)] mt-4">
        <div className="rounded-t-2xl border border-neutral-100 shadow-inner overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-primary1 text-sm text-white font-regular rounded-t-2xl">
              <tr>
                <th className="px-4 py-3 text-center">Imagen</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">
                  <button
                    className="text-center text-sm"
                    type="button"
                    onClick={() => toggleSort("stock")}
                  >
                    Stock
                  </button>
                </th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((product) => {
                const isLowStock = typeof product.stock === "number" && product.stock <= 8;
                return (
                  <tr
                    key={product.id}
                    className="border-t border-neutral-100 bg-white transition hover:bg-neutral-50 first:border-t-0"
                  >
                    <td className="px-4 py-4">
                      <img
                        src={product.imgUrl ?? product.gallery?.[0]}
                        alt={product.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-regular text-body">{product.name}</p>
                      <p className="text-xs text-muted tracking-[0.1em]">{product.sku}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">
                      {CATEGORY_MAP[product.fk_category_id] ?? "General"}
                    </td>
                    <td
                      className={`px-4 py-4 text-sm font-semibold ${
                        isLowStock ? "text-[var(--color-error)]" : "text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {product.stock ?? "—"}
                        {isLowStock && (
                          <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" aria-hidden />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const statusKey = (product.status ?? "activo").toLowerCase();
                        const badge = PUBLICATION_BADGES[statusKey] ?? PUBLICATION_BADGES.activo;
                        return (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${badge.classes}`}
                          >
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-900">{formatCurrencyCLP(product.price)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="icon"
                          size="sm"
                          className="text-secondary focus-visible:ring-2 "
                          onClick={() => setDetailProduct(product)}
                          aria-label={`Ver más detalles de ${product.name}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden />
                          <span className="sr-only">Más info</span>
                        </Button>
                        <Button
                          variant="icon"
                          size="sm"
                          className="text-neutral-500 hover:text-neutral-900"
                          onClick={() => {}}
                          aria-label={`Editar ${product.name}`}
                        >
                          <Edit3 className="h-4 w-4" aria-hidden />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="icon"
                          size="sm"
                          className="text-rose-500 hover:text-rose-700"
                          onClick={() => {}}
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-sm text-neutral-500">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Mostrando {showingFrom}-{showingTo} de {preparedProducts.length}
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={preparedProducts.length}
            onPageChange={setPage}
          />
        </div>
      </section>

      {detailProduct && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg space-y-6 max-h-[90vh] overflow-y-auto"
          >
                <div className="flex items-center justify-between gap-6">
                  <img
                    src={detailProduct.imgUrl ?? detailProduct.gallery?.[0]}
                    alt={detailProduct.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
                      Detalle editable
                    </p>
                    <input
                      value={editProduct.name}
                      onChange={(event) => handleFieldChange("name", event.target.value)}
                      className="text-2xl font-semibold text-neutral-900 border-b border-transparent focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                className="rounded-full p-2 text-neutral-500 transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500"
                type="button"
                onClick={() => setDetailProduct(null)}
                aria-label="Cerrar detalle"
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="text-sm text-neutral-500">{editProduct.description ?? "Sin descripción disponible."}</p>
            <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-neutral-400">SKU</label>
                <p className="text-sm font-medium text-neutral-900">{detailProduct.sku}</p>
              </div>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Status</span>
                <select
                  value={editProduct.status}
                  onChange={(event) => handleFieldChange("status", event.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  {Object.keys(PUBLICATION_BADGES).map((status) => (
                    <option key={status} value={status}>
                      {PUBLICATION_BADGES[status].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Stock</span>
                <input
                  type="number"
                  min={0}
                  value={editProduct.stock ?? 0}
                  onChange={(event) => handleFieldChange("stock", Number(event.target.value))}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Precio</span>
                <input
                  type="number"
                  min={0}
                  value={editProduct.price ?? 0}
                  onChange={(event) => handleFieldChange("price", Number(event.target.value))}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            </div>
            <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Material</span>
                <input
                  value={editProduct.material ?? ""}
                  onChange={(event) => handleFieldChange("material", event.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Color</span>
                <input
                  value={editProduct.color ?? ""}
                  onChange={(event) => handleFieldChange("color", event.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            </div>
            <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Altura (cm)</span>
                <input
                  type="number"
                  value={editProduct.dimensions?.height ?? ""}
                  onChange={(event) =>
                    handleFieldChange("dimensions", {
                      ...editProduct.dimensions,
                      height: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Ancho (cm)</span>
                <input
                  type="number"
                  value={editProduct.dimensions?.width ?? ""}
                  onChange={(event) =>
                    handleFieldChange("dimensions", {
                      ...editProduct.dimensions,
                      width: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            </div>
            <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Profundidad (cm)</span>
                <input
                  type="number"
                  value={editProduct.dimensions?.length ?? ""}
                  onChange={(event) =>
                    handleFieldChange("dimensions", {
                      ...editProduct.dimensions,
                      length: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Descripción</span>
                <textarea
                  value={editProduct.description ?? ""}
                  onChange={(event) => handleFieldChange("description", event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-neutral-600">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">Tags (coma separados)</span>
              <input
                value={editProduct.tagsText ?? ""}
                onChange={(event) => handleFieldChange("tagsText", event.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="space-y-1 text-sm text-neutral-600">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">URL imagen</span>
              <input
                value={editProduct.imgUrl ?? ""}
                onChange={(event) => handleFieldChange("imgUrl", event.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary-round" className="px-4" type="submit">
                Guardar cambios
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDetailProduct(null)}>
                Cerrar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
