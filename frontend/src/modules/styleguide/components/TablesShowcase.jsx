import { useState, useMemo } from "react";
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";
import { UnifiedTableToolbar } from "@/components/data-display/UnifiedTableToolbar";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatCurrencyCLP } from "@/utils/currency";
import { Eye, Pencil, Trash2, Package, ShoppingCart, Users, FolderOpen } from "lucide-react";
import { mockProducts, mockOrders, mockCustomers, mockCategories } from "../data/mockData";

/**
 * TablesShowcase - Demostración completa de UnifiedDataTable + UnifiedTableToolbar
 * para StyleGuide con todos los ejemplos y variaciones
 */
export function TablesShowcase() {
  // States para productos
  const [productSearch, setProductSearch] = useState("");
  const [productDensity, setProductDensity] = useState("normal");
  const [productQuickFilters, setProductQuickFilters] = useState([]);
  const [productActiveFilters, setProductActiveFilters] = useState([]);

  // States para órdenes
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDensity, setOrderDensity] = useState("normal");
  const [orderLayout, setOrderLayout] = useState("table");

  // States para clientes
  const [customerSearch, setCustomerSearch] = useState("");

  // Columnas de productos
  const productColumns = useMemo(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
        size: 140,
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        size: 250,
      },
      {
        accessorKey: "categoria_nombre",
        header: "Categoría",
        size: 140,
      },
      {
        accessorKey: "precio",
        header: "Precio",
        size: 120,
        cell: ({ getValue }) => formatCurrencyCLP(getValue()),
        meta: { align: "right" },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        size: 100,
        cell: ({ getValue }) => {
          const stock = getValue();
          return (
            <span
              className={
                stock === 0
                  ? "text-red-600 font-semibold"
                  : stock < 10
                  ? "text-orange-600 font-semibold"
                  : ""
              }
            >
              {stock}
            </span>
          );
        },
        meta: { align: "center" },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        size: 120,
        cell: ({ getValue }) => (
          <StatusPill status={getValue()} domain="product" />
        ),
      },
    ],
    []
  );

  // Columnas de órdenes
  const orderColumns = useMemo(
    () => [
      {
        accessorKey: "orden_numero",
        header: "Orden #",
        size: 140,
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue()}</span>
        ),
      },
      {
        accessorKey: "fecha_orden",
        header: "Fecha",
        size: 120,
        cell: ({ getValue }) =>
          new Date(getValue()).toLocaleDateString("es-CL"),
      },
      {
        accessorKey: "usuario_nombre",
        header: "Cliente",
        size: 200,
      },
      {
        accessorKey: "total",
        header: "Total",
        size: 120,
        cell: ({ getValue }) => formatCurrencyCLP(getValue()),
        meta: { align: "right" },
      },
      {
        accessorKey: "items_count",
        header: "Ítems",
        size: 80,
        meta: { align: "center" },
      },
      {
        accessorKey: "estado_pago",
        header: "Pago",
        size: 120,
        cell: ({ getValue }) => (
          <StatusPill status={getValue()} domain="payment" />
        ),
      },
      {
        accessorKey: "estado_envio",
        header: "Envío",
        size: 120,
        cell: ({ getValue }) => (
          <StatusPill status={getValue()} domain="shipping" />
        ),
      },
    ],
    []
  );

  // Columnas de clientes
  const customerColumns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre",
        size: 220,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 240,
      },
      {
        accessorKey: "ordenes_count",
        header: "Pedidos",
        size: 100,
        meta: { align: "center" },
      },
      {
        accessorKey: "total_compras",
        header: "Total Compras",
        size: 140,
        cell: ({ getValue }) => formatCurrencyCLP(getValue()),
        meta: { align: "right" },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        size: 120,
        cell: ({ getValue }) => <StatusPill status={getValue()} domain="user" />,
      },
    ],
    []
  );

  // Columnas de categorías
  const categoryColumns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre",
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-(--color-secondary2)" />
            <span className="font-medium">{row.original.nombre}</span>
          </div>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        size: 160,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-(--color-secondary2)">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        size: 300,
      },
      {
        accessorKey: "productos_count",
        header: "Productos",
        size: 100,
        meta: { align: "center" },
        cell: ({ getValue }) => (
          <span className="font-semibold text-(--color-primary1)">
            {getValue()}
          </span>
        ),
      },
    ],
    []
  );

  // Row actions de productos
  const productRowActions = [
    {
      key: "view",
      label: "Ver detalle",
      icon: Eye,
      onAction: (product) => console.log("Ver", product),
    },
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      onAction: (product) => console.log("Editar", product),
    },
    {
      key: "delete",
      label: "Eliminar",
      icon: Trash2,
      onAction: (product) => console.log("Eliminar", product),
      variant: "danger",
    },
  ];

  // Quick filters de productos
  const productQuickFilterOptions = [
    {
      value: "active",
      label: "Activos",
      icon: <Package size={14} />,
      count: mockProducts.filter((p) => p.estado === "activo").length,
    },
    {
      value: "low_stock",
      label: "Stock bajo",
      icon: <ShoppingCart size={14} />,
      count: mockProducts.filter((p) => p.stock < 10 && p.stock > 0).length,
    },
    {
      value: "out_of_stock",
      label: "Agotados",
      icon: <Trash2 size={14} />,
      count: mockProducts.filter((p) => p.stock === 0).length,
    },
  ];

  // Handlers
  const handleProductQuickFilterChange = (value) => {
    setProductQuickFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleClearProductFilters = () => {
    setProductSearch("");
    setProductQuickFilters([]);
    setProductActiveFilters([]);
  };

  const handleExport = (format) => {
    console.log(`Exportar en formato: ${format}`);
  };

  const handleAddNew = () => {
    console.log("Agregar nuevo");
  };

  const handleRefresh = () => {
    console.log("Refrescar datos");
  };

  return (
    <div className="space-y-12">
      {/* Intro */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Tablas & Toolbars</h2>
        <p className="text-(--color-text-muted)">
          Sistema unificado de tablas con todas las features: virtualización, sorting,
          filtering, pagination, selection, actions, y toolbar completo.
        </p>
      </div>

      {/* 1. Tabla de Productos - Full Featured */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            1. Tabla Completa - Productos
          </h3>
          <p className="text-sm text-(--color-text-muted)">
            Toolbar con todas las features: search, quick filters, column visibility,
            density, export, refresh, add new
          </p>
        </div>

        <UnifiedDataTable
          columns={productColumns}
          data={mockProducts}
          density={productDensity}
          rowActions={productRowActions}
          toolbar={(table) => (
            <UnifiedTableToolbar
              table={table}
              // Search
              search
              searchValue={productSearch}
              onSearchChange={setProductSearch}
              searchPlaceholder="Buscar productos..."
              // Quick Filters
              quickFilters
              quickFilterOptions={productQuickFilterOptions}
              activeQuickFilters={productQuickFilters}
              onQuickFilterChange={handleProductQuickFilterChange}
              // Active Filters
              activeFilters={productActiveFilters}
              onRemoveFilter={(filter) =>
                setProductActiveFilters((prev) => prev.filter((f) => f !== filter))
              }
              // Column Visibility
              columnVisibility
              // Density
              density
              densityValue={productDensity}
              onDensityChange={setProductDensity}
              // Export
              exportMenu
              onExport={handleExport}
              exportFormats={["csv", "xlsx", "json"]}
              // Refresh
              refresh
              onRefresh={handleRefresh}
              // Add New
              addNew
              onAddNew={handleAddNew}
              addNewLabel="Nuevo producto"
              // Clear Filters
              clearFilters
              onClearFilters={handleClearProductFilters}
            />
          )}
        />
      </section>

      {/* 2. Tabla de Órdenes - Con Layout Toggle */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            2. Tabla con Layout Toggle - Órdenes
          </h3>
          <p className="text-sm text-(--color-text-muted)">
            Toolbar con search, density y layout toggle (table/grid)
          </p>
        </div>

        <UnifiedDataTable
          columns={orderColumns}
          data={mockOrders}
          density={orderDensity}
          toolbar={(table) => (
            <UnifiedTableToolbar
              table={table}
              search
              searchValue={orderSearch}
              onSearchChange={setOrderSearch}
              searchPlaceholder="Buscar órdenes..."
              density
              densityValue={orderDensity}
              onDensityChange={setOrderDensity}
              layoutToggle
              layoutValue={orderLayout}
              onLayoutChange={setOrderLayout}
              layoutOptions={["table", "grid"]}
              refresh
              onRefresh={handleRefresh}
            />
          )}
        />
      </section>

      {/* 3. Tabla Virtualizada - Clientes */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            3. Tabla Virtualizada - Clientes
          </h3>
          <p className="text-sm text-(--color-text-muted)">
            Con virtualización activada para grandes datasets (solo search y refresh)
          </p>
        </div>

        <UnifiedDataTable
          columns={customerColumns}
          data={mockCustomers}
          virtualized
          estimatedRowHeight={60}
          maxHeight={400}
          toolbar={(table) => (
            <UnifiedTableToolbar
              table={table}
              search
              searchValue={customerSearch}
              onSearchChange={setCustomerSearch}
              searchPlaceholder="Buscar clientes..."
              refresh
              onRefresh={handleRefresh}
              variant="compact"
            />
          )}
        />
      </section>

      {/* 4. Tabla Simple - Categorías */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">4. Tabla Simple - Categorías</h3>
          <p className="text-sm text-(--color-text-muted)">
            Sin toolbar, variant plain, solo datos
          </p>
        </div>

        <UnifiedDataTable
          columns={categoryColumns}
          data={mockCategories}
          variant="plain"
          density="compact"
        />
      </section>

      {/* 5. Tabla con Selección */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            5. Tabla con Selección - Productos
          </h3>
          <p className="text-sm text-(--color-text-muted)">
            Con checkboxes de selección (bulk actions)
          </p>
        </div>

        <UnifiedDataTable
          columns={productColumns}
          data={mockProducts}
          selectable
          onSelectionChange={(selected) =>
            console.log("Seleccionados:", selected.length)
          }
        />
      </section>

      {/* 6. Densidad Comparativa */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">6. Densidades Comparativas</h3>
          <p className="text-sm text-(--color-text-muted)">
            Compact, Normal y Comfortable side-by-side
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-(--color-secondary2) mb-2">
              Compact (40px)
            </p>
            <UnifiedDataTable
              columns={categoryColumns}
              data={mockCategories.slice(0, 3)}
              variant="plain"
              density="compact"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-(--color-secondary2) mb-2">
              Normal (56px)
            </p>
            <UnifiedDataTable
              columns={categoryColumns}
              data={mockCategories.slice(0, 3)}
              variant="plain"
              density="normal"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-(--color-secondary2) mb-2">
              Comfortable (64px)
            </p>
            <UnifiedDataTable
              columns={categoryColumns}
              data={mockCategories.slice(0, 3)}
              variant="plain"
              density="comfortable"
            />
          </div>
        </div>
      </section>

      {/* 7. Variantes de Container */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">7. Variantes de Container</h3>
          <p className="text-sm text-(--color-text-muted)">
            Card (con shadow) vs Plain (solo border)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-(--color-secondary2) mb-2">
              Variant: Card
            </p>
            <UnifiedDataTable
              columns={categoryColumns}
              data={mockCategories.slice(0, 3)}
              variant="card"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-(--color-secondary2) mb-2">
              Variant: Plain
            </p>
            <UnifiedDataTable
              columns={categoryColumns}
              data={mockCategories.slice(0, 3)}
              variant="plain"
            />
          </div>
        </div>
      </section>

      {/* Color Reference */}
      <section className="rounded-xl border border-(--color-border) bg-(--color-neutral1) p-6">
        <h3 className="text-lg font-semibold mb-4">🎨 Color Reference</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Table</p>
            <ul className="space-y-1 text-(--color-text-muted)">
              <li>
                <code>border-(--color-border)</code> - Bordes de tabla
              </li>
              <li>
                <code>bg-white</code> - Fondo tabla
              </li>
              <li>
                <code>hover:bg-(--color-neutral2)/50</code> - Hover fila
              </li>
              <li>
                <code>text-(--color-secondary2)</code> - Headers
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-2">Toolbar</p>
            <ul className="space-y-1 text-(--color-text-muted)">
              <li>
                <code>border-(--color-primary1)</code> - Active filters
              </li>
              <li>
                <code>bg-(--color-primary1)/10</code> - Active pill bg
              </li>
              <li>
                <code>text-(--color-text-muted)</code> - Placeholders
              </li>
              <li>
                <code>rounded-full</code> - Search input, pills
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TablesShowcase;
