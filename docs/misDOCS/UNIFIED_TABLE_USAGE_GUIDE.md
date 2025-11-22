# UnifiedDataTable + UnifiedTableToolbar - Guía de Uso

Sistema unificado de tablas para MOA que reemplaza a DataTableV2, TanstackDataTable y VirtualizedTable.

## 🎯 Características

### UnifiedDataTable
- ✅ TanStack Table v8 como base
- ✅ Virtualización OPCIONAL (automática para +100 registros)
- ✅ Diseño consistente MOA
- ✅ Sorting, filtering, pagination
- ✅ Row selection (checkboxes)
- ✅ Inline editing
- ✅ Row actions (ResponsiveRowActions)
- ✅ Densidad ajustable (compact, normal, comfortable)
- ✅ Toolbar integrado

### UnifiedTableToolbar
- 🔍 **Search bar** - Búsqueda global
- 🔽 **Column visibility** - Mostrar/ocultar columnas
- 📊 **Sort by** - Ordenar dropdown
- 📤 **Export** - CSV, JSON, XLSX
- 🎚️ **Density** - Compact, normal, comfortable
- 🔲 **Layout toggle** - Table/Grid/List
- 🔄 **Refresh** - Recargar datos
- 🏷️ **Quick filters** - Filtros rápidos (pills)
- 🎛️ **Advanced filters** - Filtros avanzados (popover)
- ➕ **Add new** - Botón agregar
- 🧹 **Clear filters** - Limpiar filtros
- 📌 **Active filters** - Badges de filtros activos

---

## 📖 Ejemplos de Uso

### 1. Tabla Básica

```jsx
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";

function ProductsTable() {
  const columns = [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "price", header: "Precio" },
    { accessorKey: "stock", header: "Stock" },
  ];

  const data = [
    { name: "Producto 1", price: 10000, stock: 50 },
    { name: "Producto 2", price: 20000, stock: 30 },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={data}
      loading={false}
    />
  );
}
```

---

### 2. Tabla con Paginación Manual (Backend)

```jsx
import { useState } from "react";
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";
import { useAdminProducts } from "@/modules/admin/hooks/useAdminProducts";

function ProductsPageWithPagination() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  
  const { data, loading, total } = useAdminProducts({ page, pageSize });

  const columns = [
    { accessorKey: "sku", header: "SKU", size: 120 },
    { accessorKey: "nombre", header: "Nombre", size: 250 },
    { accessorKey: "precio", header: "Precio", size: 120 },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={data || []}
      loading={loading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
    />
  );
}
```

---

### 3. Tabla Virtualizada (Grandes Datasets)

```jsx
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";

function LargeCustomersTable() {
  const { data, loading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchAllCustomers, // Retorna +1000 registros
  });

  const columns = [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "created_at", header: "Registro" },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={data || []}
      loading={loading}
      virtualized // ← Activa virtualización
      estimatedRowHeight={60}
      maxHeight={600}
    />
  );
}
```

---

### 4. Tabla con Row Selection

```jsx
import { useState } from "react";
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";

function SelectableProductsTable() {
  const [selectedProducts, setSelectedProducts] = useState([]);

  const columns = [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "precio", header: "Precio" },
  ];

  return (
    <>
      <p>Seleccionados: {selectedProducts.length}</p>
      
      <UnifiedDataTable
        columns={columns}
        data={products}
        selectable // ← Activa checkboxes
        onSelectionChange={setSelectedProducts}
      />
    </>
  );
}
```

---

### 5. Tabla con Row Actions

```jsx
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";
import { Eye, Pencil, Trash2 } from "lucide-react";

function ProductsWithActions() {
  const handleView = (product) => console.log("Ver", product);
  const handleEdit = (product) => console.log("Editar", product);
  const handleDelete = (product) => console.log("Eliminar", product);

  const rowActions = [
    {
      key: "view",
      label: "Ver detalle",
      icon: Eye,
      onAction: handleView,
    },
    {
      key: "edit",
      label: "Editar",
      icon: Pencil,
      onAction: handleEdit,
    },
    {
      key: "delete",
      label: "Eliminar",
      icon: Trash2,
      onAction: handleDelete,
      variant: "danger",
    },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={products}
      rowActions={rowActions} // ← Array o función
    />
  );
}
```

---

### 6. Tabla con Inline Editing

```jsx
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";

function EditableProductsTable() {
  const handleCommitEdit = (product, changes) => {
    console.log("Guardar cambios:", product, changes);
    // API call para actualizar
  };

  const columns = [
    { accessorKey: "nombre", header: "Nombre", meta: { editable: true } },
    { accessorKey: "precio", header: "Precio", meta: { editable: true } },
    { accessorKey: "stock", header: "Stock", meta: { editable: true } },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={products}
      editable // ← Activa edición inline
      onCommitEdit={handleCommitEdit}
    />
  );
}
```

---

### 7. Tabla con Toolbar Completo

```jsx
import { useState } from "react";
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";
import { UnifiedTableToolbar } from "@/components/data-display/UnifiedTableToolbar";
import { Package, AlertCircle, CheckCircle } from "lucide-react";

function ProductsWithFullToolbar() {
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState("normal");
  const [activeFilters, setActiveFilters] = useState([]);
  const [quickFilters, setQuickFilters] = useState([]);

  const { data, loading, refetch } = useAdminProducts({ search });

  const quickFilterOptions = [
    { value: "active", label: "Activos", icon: <CheckCircle size={14} />, count: 120 },
    { value: "low_stock", label: "Stock bajo", icon: <AlertCircle size={14} />, count: 15 },
    { value: "new", label: "Nuevos", icon: <Package size={14} />, count: 8 },
  ];

  const handleExport = (format) => {
    console.log("Exportar en formato:", format);
    // Lógica de exportación
  };

  const handleAddNew = () => {
    console.log("Abrir drawer de nuevo producto");
  };

  const handleQuickFilterChange = (value) => {
    setQuickFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setQuickFilters([]);
    setActiveFilters([]);
  };

  return (
    <UnifiedDataTable
      columns={columns}
      data={data || []}
      loading={loading}
      density={density}
      toolbar={(table) => (
        <UnifiedTableToolbar
          table={table}
          
          // Search
          search
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar productos..."
          
          // Quick Filters
          quickFilters
          quickFilterOptions={quickFilterOptions}
          activeQuickFilters={quickFilters}
          onQuickFilterChange={handleQuickFilterChange}
          
          // Active Filters
          activeFilters={activeFilters}
          onRemoveFilter={(filter) => 
            setActiveFilters(prev => prev.filter(f => f !== filter))
          }
          
          // Column Visibility
          columnVisibility
          
          // Density
          density
          densityValue={density}
          onDensityChange={setDensity}
          
          // Export
          exportMenu
          onExport={handleExport}
          exportFormats={["csv", "xlsx", "json"]}
          
          // Refresh
          refresh
          onRefresh={refetch}
          
          // Add New
          addNew
          onAddNew={handleAddNew}
          addNewLabel="Nuevo producto"
          
          // Clear Filters
          clearFilters
          onClearFilters={handleClearFilters}
        />
      )}
    />
  );
}
```

---

### 8. Toolbar Minimalista (Solo Search + Refresh)

```jsx
<UnifiedDataTable
  columns={columns}
  data={data}
  toolbar={(table) => (
    <UnifiedTableToolbar
      table={table}
      search
      searchValue={search}
      onSearchChange={setSearch}
      refresh
      onRefresh={refetch}
    />
  )}
/>
```

---

### 9. Toolbar con Advanced Filters

```jsx
import { UnifiedTableToolbar } from "@/components/data-display/UnifiedTableToolbar";
import { SelectSm } from "@/components/ui/Select";

function ToolbarWithAdvancedFilters() {
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const advancedFiltersContent = (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-(--color-secondary2)">
          Categoría
        </label>
        <SelectSm
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: "", label: "Todas" },
            { value: "electronics", label: "Electrónicos" },
            { value: "clothing", label: "Ropa" },
          ]}
        />
      </div>
      
      <div>
        <label className="text-xs font-semibold text-(--color-secondary2)">
          Rango de precio
        </label>
        <SelectSm
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          options={[
            { value: "", label: "Todos" },
            { value: "0-10000", label: "$0 - $10.000" },
            { value: "10000-50000", label: "$10.000 - $50.000" },
          ]}
        />
      </div>
    </div>
  );

  return (
    <UnifiedTableToolbar
      table={table}
      search
      advancedFilters
      advancedFiltersContent={advancedFiltersContent}
      advancedFiltersLabel="Filtros"
    />
  );
}
```

---

### 10. Tabla con Layout Toggle (Table/Grid)

```jsx
import { useState } from "react";
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable";
import { UnifiedTableToolbar } from "@/components/data-display/UnifiedTableToolbar";

function ProductsWithLayoutToggle() {
  const [layout, setLayout] = useState("table");

  return (
    <>
      <UnifiedTableToolbar
        layoutToggle
        layoutValue={layout}
        onLayoutChange={setLayout}
        layoutOptions={["table", "grid"]}
      />
      
      {layout === "table" ? (
        <UnifiedDataTable columns={columns} data={data} />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {data.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </>
  );
}
```

---

## 🎨 Propiedades de UnifiedDataTable

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `columns` | `Array` | **Required** | Columnas de TanStack Table |
| `data` | `Array` | **Required** | Datos de la tabla |
| `loading` | `Boolean` | `false` | Estado de carga |
| `emptyMessage` | `String` | `"Sin resultados"` | Mensaje cuando no hay datos |
| `page` | `Number` | - | Página actual (paginación manual) |
| `pageSize` | `Number` | - | Tamaño de página (paginación manual) |
| `total` | `Number` | - | Total de registros (paginación manual) |
| `onPageChange` | `Function` | - | Callback de cambio de página |
| `enablePagination` | `Boolean` | `true` | Habilitar paginación |
| `selectable` | `Boolean` | `false` | Habilitar selección de filas |
| `onSelectionChange` | `Function` | - | Callback de selección |
| `editable` | `Boolean` | `false` | Habilitar edición inline |
| `onCommitEdit` | `Function` | - | Callback al guardar cambios |
| `rowActions` | `Array\|Function` | `[]` | Acciones de fila |
| `virtualized` | `Boolean` | `false` | Activar virtualización |
| `estimatedRowHeight` | `Number` | `60` | Altura estimada de fila (virtualizado) |
| `overscan` | `Number` | `5` | Filas extra a renderizar (virtualizado) |
| `variant` | `"card"\|"plain"` | `"card"` | Estilo del contenedor |
| `density` | `"compact"\|"normal"\|"comfortable"` | `"normal"` | Densidad de filas |
| `maxHeight` | `String\|Number` | - | Altura máxima (scroll) |
| `toolbar` | `Node\|Function` | - | Toolbar personalizado |
| `onRowClick` | `Function` | - | Callback al hacer clic en fila |

---

## 🎛️ Propiedades de UnifiedTableToolbar

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `table` | `Object` | - | Instancia de TanStack Table |
| `search` | `Boolean` | `false` | Mostrar search bar |
| `searchValue` | `String` | `""` | Valor del search |
| `onSearchChange` | `Function` | - | Callback de cambio de search |
| `columnVisibility` | `Boolean` | `false` | Mostrar selector de columnas |
| `sortBy` | `Boolean` | `false` | Mostrar selector de orden |
| `sortByOptions` | `Array` | `[]` | Opciones de ordenamiento |
| `exportMenu` | `Boolean` | `false` | Mostrar menú de exportación |
| `onExport` | `Function` | - | Callback de exportación |
| `exportFormats` | `Array` | `["csv","json","xlsx"]` | Formatos disponibles |
| `density` | `Boolean` | `false` | Mostrar selector de densidad |
| `densityValue` | `String` | `"normal"` | Densidad actual |
| `onDensityChange` | `Function` | - | Callback de cambio de densidad |
| `layoutToggle` | `Boolean` | `false` | Mostrar toggle de layout |
| `layoutValue` | `String` | `"table"` | Layout actual |
| `onLayoutChange` | `Function` | - | Callback de cambio de layout |
| `refresh` | `Boolean` | `false` | Mostrar botón de refresh |
| `onRefresh` | `Function` | - | Callback de refresh |
| `quickFilters` | `Boolean` | `false` | Mostrar filtros rápidos |
| `quickFilterOptions` | `Array` | `[]` | Opciones de filtros rápidos |
| `activeQuickFilters` | `Array` | `[]` | Filtros rápidos activos |
| `onQuickFilterChange` | `Function` | - | Callback de filtro rápido |
| `advancedFilters` | `Boolean` | `false` | Mostrar filtros avanzados |
| `advancedFiltersContent` | `Node` | - | Contenido del popover de filtros |
| `addNew` | `Boolean` | `false` | Mostrar botón agregar |
| `onAddNew` | `Function` | - | Callback de agregar nuevo |
| `clearFilters` | `Boolean` | `false` | Mostrar botón limpiar filtros |
| `onClearFilters` | `Function` | - | Callback de limpiar filtros |
| `activeFilters` | `Array` | `[]` | Filtros activos (badges) |
| `onRemoveFilter` | `Function` | - | Callback de quitar filtro |
| `customActions` | `Node` | - | Acciones personalizadas |
| `variant` | `"default"\|"compact"` | `"default"` | Variante del toolbar |

---

## 🚀 Migración desde componentes antiguos

### Desde DataTableV2
```jsx
// ❌ Antes
<DataTableV2
  columns={columns}
  data={data}
  loading={loading}
  rowActions={actions}
/>

// ✅ Ahora
<UnifiedDataTable
  columns={columns}
  data={data}
  loading={loading}
  rowActions={actions}
/>
```

### Desde VirtualizedTable
```jsx
// ❌ Antes
<VirtualizedTable
  data={data}
  columns={columns}
  renderRow={renderRow}
  rowHeight={60}
/>

// ✅ Ahora (más simple)
<UnifiedDataTable
  columns={columns}
  data={data}
  virtualized
  estimatedRowHeight={60}
/>
```

### Desde TanstackDataTable
```jsx
// ❌ Antes
<TanstackDataTable
  columns={columns}
  data={data}
  page={page}
  pageSize={pageSize}
  total={total}
  onPageChange={onPageChange}
/>

// ✅ Ahora (idéntico)
<UnifiedDataTable
  columns={columns}
  data={data}
  page={page}
  pageSize={pageSize}
  total={total}
  onPageChange={onPageChange}
/>
```

---

## 📌 Notas Importantes

1. **Virtualización**: Se activa automáticamente con `virtualized={true}`. Ideal para +100 registros.
2. **Paginación**: Si pasas `page`, `pageSize`, `total` y `onPageChange`, usa paginación manual (backend).
3. **Toolbar**: Pasa como prop `toolbar` o usa `UnifiedTableToolbar` con las features que necesites.
4. **Row Actions**: Usa `ResponsiveRowActions` integrado - se adapta a mobile automáticamente.
5. **Column Visibility**: Funciona automáticamente con `enableColumnVisibility={true}` (default).
6. **Sorting**: TanStack Table maneja sorting client-side. Para sorting server-side, usa `onSortChange`.
7. **Density**: Ajusta altura de filas: `compact` (40px), `normal` (56px), `comfortable` (64px).

---

## 🎯 Casos de Uso Recomendados

| Caso | Configuración |
|------|---------------|
| **Tabla simple** | Solo `columns` y `data` |
| **Paginación backend** | `page`, `pageSize`, `total`, `onPageChange` |
| **Grandes datasets** | `virtualized={true}` + `maxHeight` |
| **CRUD completo** | `rowActions` + `addNew` + `editable` |
| **Dashboard** | `quickFilters` + `density` + `refresh` |
| **Reportes** | `exportMenu` + `sortBy` + `columnVisibility` |

---

**Creado**: 22 de noviembre, 2025  
**Autor**: MOA Team  
**Versión**: 1.0.0
