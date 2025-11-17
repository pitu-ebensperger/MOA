//path/frontend/src/modules/admin/pages/products/ProductsAdminPage.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import ProductDetailDrawer from "../components/ProductDetailDrawer.jsx";
import ProductDrawer from "../components/ProductDrawer.jsx";

import { DataTableV2 } from "../../../components/data-display/DataTableV2.jsx";
// Toolbar pieces used in separate ProductsToolbar component
import ProductsToolbar from "./ProductsToolbar.jsx";
import { Button } from "../../../components/ui/Button.jsx";

import { useAdminProducts } from "../hooks/useAdminProducts.js";
import { useCategories } from "../../products/hooks/useCategories.js";
import { buildProductColumns } from "../utils/ProductsColumns.jsx";
import { DEFAULT_PAGE_SIZE } from "../../../config/constants.js";
import { PRODUCT_STATUS_OPTIONS } from "../../../config/status-options.js";

export default function ProductsAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const condensed = false;
  const [selectedProductView, setSelectedProductView] = useState(null);
  const [selectedProductEdit, setSelectedProductEdit] = useState(null); // holds product being edited
  const [creatingNewProduct, setCreatingNewProduct] = useState(false); // flag for create drawer

  const limit = DEFAULT_PAGE_SIZE;

  const { items, total, isLoading, refetch } = useAdminProducts({
    page,
    limit,
    search,
    status,
    categoryId,
    onlyLowStock,
  });

  const { categories } = useCategories();
  const categoryMap = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c.name])),
    [categories],
  );
  const statusFilterOptions = useMemo(
    () => PRODUCT_STATUS_OPTIONS.filter((option) => option.value),
    [],
  );
  const categoryOptions = useMemo(() => {
    const entries = (categories ?? [])
      .filter((category) => category?.id != null)
      .map((category) => ({
        value: String(category.id),
        label: category.name ?? "Sin categoría",
      }));
    return entries.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [categories]);

  const handleStatusFilterChange = useCallback((value) => {
    setStatus(value);
    setPage(1);
    if (value) {
      const label = PRODUCT_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
      setActiveTags((tags) => [
        { key: "status", value, label: `Estado: ${label}` },
        ...tags.filter((t) => t.key !== "status"),
      ]);
    } else {
      setActiveTags((tags) => tags.filter((t) => t.key !== "status"));
    }
  }, []);

  const handleCategoryFilterChange = useCallback((value) => {
    const normalizedValue = value ? String(value) : "";
    setCategoryId(normalizedValue);
    setPage(1);
    if (normalizedValue) {
      const label = categoryOptions.find((option) => option.value === normalizedValue)?.label ?? normalizedValue;
      setActiveTags((tags) => [
        { key: "category", value: normalizedValue, label: `Categoría: ${label}` },
        ...tags.filter((tag) => tag.key !== "category"),
      ]);
    } else {
      setActiveTags((tags) => tags.filter((tag) => tag.key !== "category"));
    }
  }, [categoryOptions]);

  const handleDuplicateProduct = useCallback((product) => {
    console.log("Duplicar producto", product);
    refetch();
  }, [refetch]);

  const handleDeleteProduct = useCallback((product) => {
    if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      console.log("Eliminar producto", product);
      refetch();
    }
  }, [refetch]);

  const columns = useMemo(() => buildProductColumns({
    categoryMap,
    onView: setSelectedProductView,
    onEdit: setSelectedProductEdit,
    onDuplicate: handleDuplicateProduct,
    onDelete: handleDeleteProduct,
    statusFilterValue: status,
    statusFilterOptions,
    onStatusFilterChange: handleStatusFilterChange,
    categoryFilterValue: categoryId,
    categoryFilterOptions: categoryOptions,
    onCategoryFilterChange: handleCategoryFilterChange,
  }), [
    categoryMap,
    handleDuplicateProduct,
    handleDeleteProduct,
    status,
    statusFilterOptions,
    handleStatusFilterChange,
    categoryId,
    categoryOptions,
    handleCategoryFilterChange,
  ]);

  // Tag removal logic extracted for lint (avoid deep nesting)
  const handleRemoveTag = (tag) => {
    if (tag.key === "status") {
      handleStatusFilterChange("");
      return;
    }
    if (tag.key === "category") {
      handleCategoryFilterChange("");
      return;
    }
    setActiveTags((tags) => tags.filter((t) => !(t.key === tag.key && t.value === tag.value)));
  };

  // Render toolbar (external component) with stable reference for lint compliance
  const renderToolbar = useCallback(
    (table) => (
      <ProductsToolbar
        table={table}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onlyLowStock={onlyLowStock}
        onToggleLowStock={() => {
          setOnlyLowStock((v) => !v);
          setPage(1);
        }}
        activeTags={activeTags}
        onRemoveTag={handleRemoveTag}
      />
    ),
    [search, onlyLowStock, activeTags, handleRemoveTag],
  );

  // (toolbar inline version removed for lint compliance)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight text-primary">
            Productos
          </h1>
          <p className="text-sm text-(--text-weak)">
            Administra el catálogo y el inventario de la tienda MOA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            appearance="solid"
            intent="primary"
            size="sm"
            leadingIcon={<Plus className="h-4 w-4" />}
            style={{
              "--btn-gap": "0.35rem",
              "--btn-icon-gap-left": "0.35rem",
            }}
            onClick={() => {
              setCreatingNewProduct(true);
            }}
          >
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Tabla con toolbar integrado */}
      <DataTableV2
        columns={columns}
        data={items}
        loading={isLoading}
        page={page}
        pageSize={limit}
        total={total}
        onPageChange={setPage}
        toolbar={renderToolbar}
        maxHeight="calc(100vh - 260px)"
        condensed={condensed}
        variant="card"
      />

      {/* Drawers */}
      <ProductDetailDrawer
        open={!!selectedProductView}
        product={selectedProductView}
        onClose={() => setSelectedProductView(null)}
        categoryMap={categoryMap}
      />

      {/* Drawer: Crear nuevo producto */}
      <ProductDrawer
        open={creatingNewProduct}
        initial={null}
        categories={categories ?? []}
        onClose={() => setCreatingNewProduct(false)}
        onSubmit={(payload) => {
          console.log("Crear producto", payload);
          // Aquí iría llamada API POST /products
          setCreatingNewProduct(false);
          refetch();
        }}
      />

      {/* Drawer: Editar producto existente */}
      <ProductDrawer
        open={!!selectedProductEdit}
        initial={selectedProductEdit}
        categories={categories ?? []}
        onClose={() => setSelectedProductEdit(null)}
        onSubmit={(payload) => {
          console.log("Actualizar producto", payload);
          // Aquí iría llamada API PUT /products/:id
          setSelectedProductEdit(null);
          refetch();
        }}
        onDelete={(product) => {
          if (confirm(`¿Eliminar producto "${product.name}"?`)) {
            console.log("Eliminar producto", product);
            // Aquí iría llamada API DELETE /products/:id
            setSelectedProductEdit(null);
            refetch();
          }
        }}
      />
    </div>
  );
}
