//path/frontend/src/modules/admin/pages/products/ProductsAdminPage.jsx
import React from "react";
import { Plus, RefreshCw, Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";

import { TanstackDataTable } from "@/components/data-display/DataTable.jsx"
import { Pagination } from "@/components/ui/Pagination.jsx"

import { useAdminProducts } from "@/modules/admin/hooks/useAdminProducts.js"
import { useCategories } from "@/modules/products/hooks/useCategories.js"
import { buildProductColumns } from "@/modules/admin/utils/ProductsColumns.jsx"

export default function ProductsAdminPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [onlyLowStock, setOnlyLowStock] = React.useState(false);
  const [showExportDropdown, setShowExportDropdown] = React.useState(false);

  const limit = 20;

  const { items, total, totalPages, isLoading, refetch } = useAdminProducts({
    page,
    limit,
    search,
    status,
    onlyLowStock,
  });

  const { categories } = useCategories();
  const categoryMap = React.useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c.name])),
    [categories],
  );

  const columns = React.useMemo(
    () =>
      buildProductColumns({
        categoryMap,
        onView: (product) => {
          console.log("view product", product);
        },
        onEdit: (product) => {
          console.log("edit product", product);
        },
        onDelete: (product) => {
          console.log("delete product", product);
        },
      }),
    [categoryMap],
  );

  // Funciones de exportación
  const exportToCSV = () => {
    const headers = ["SKU", "Nombre", "Categoría", "Precio", "Stock", "Estado"];
    const csvData = [
      headers.join(","),
      ...items.map(item => [
        item.sku || "",
        `"${item.name || ""}"`,
        `"${categoryMap[item.fk_category_id] || ""}"`,
        item.price || 0,
        item.stock || 0,
        item.status || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `productos_moa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportToExcel = () => {
    // Para una implementación más robusta de Excel, podrías usar una librería como xlsx
    // Por ahora, exportamos como CSV con extensión .xls para compatibilidad
    const headers = ["SKU", "Nombre", "Categoría", "Precio (CLP)", "Stock", "Estado"];
    const csvData = [
      headers.join("\t"),
      ...items.map(item => [
        item.sku || "",
        item.name || "",
        categoryMap[item.fk_category_id] || "",
        item.price || 0,
        item.stock || 0,
        item.status || ""
      ].join("\t"))
    ].join("\n");

    const blob = new Blob([csvData], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `productos_moa_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  // Cerrar dropdown al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary1 mb-2">
            Productos
          </h1>
          <p className="text-sm text-(--text-weak)">
            Administra el catálogo y el inventario de la tienda MOA.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-secondary1) text-(--color-secondary1) hover:bg-(--surface-subtle)"
            aria-label="Refrescar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          {/* Botón de exportación con dropdown */}
          <div className="relative export-dropdown">
            <button
              type="button"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="inline-flex items-center gap-1 rounded-full border border-(--color-secondary1) px-3 py-2 text-sm text-(--color-secondary1) hover:bg-(--surface-subtle)"
            >
              <Download className="h-4 w-4" />
              Exportar
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-(--border-subtle) bg-white shadow-lg z-10">
                <div className="p-1">
                  <button
                    type="button"
                    onClick={exportToCSV}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-(--text-weak) hover:bg-(--surface-subtle) hover:text-(--text-strong)"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar como CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportToExcel}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-(--text-weak) hover:bg-(--surface-subtle) hover:text-(--text-strong)"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar como Excel
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-(--color-primary1) px-3 py-2 text-sm text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-(--border-subtle) bg-(--surface-subtle) px-4 py-3">
        <div className="min-w-[200px] flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, SKU…"
            className="w-full rounded-full border border-(--border-subtle) bg-white px-3 py-1.5 text-sm"
          />
        </div>

        <div className="w-full sm:w-[180px]">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-full border border-(--border-subtle) bg-white px-3 py-1.5 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="borrador">Borrador</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-(--text-weak)">
          <input
            type="checkbox"
            checked={onlyLowStock}
            onChange={(e) => {
              setOnlyLowStock(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded border-(--border-subtle)"
          />
          <span>Solo stock crítico</span>
        </label>
      </div>

      {/* Tabla TanStack */}
      <TanstackDataTable
        columns={columns}
        data={items}
        loading={isLoading}
        page={page}
        pageSize={limit}
        total={total}
        onPageChange={setPage}
      />

      {/* Paginación */}
      <div className="mt-3">
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
