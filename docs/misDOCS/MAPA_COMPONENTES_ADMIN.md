# Mapa de Componentes - Panel Admin

Guía rápida para encontrar y editar componentes del panel administrativo de MOA.

## 📊 Dashboard Admin (`/admin`)

**Archivo principal**: [`frontend/src/modules/admin/pages/AdminDashboardPage.jsx`](../../../frontend/src/modules/admin/pages/AdminDashboardPage.jsx)

### Componentes que usa:

- **Header**: `AdminPageHeader` → [`frontend/src/modules/admin/components/AdminPageHeader.jsx`](../../../frontend/src/modules/admin/components/AdminPageHeader.jsx)
- **Tabs**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` → [`frontend/src/components/ui/Tabs.jsx`](../../../frontend/src/components/ui/Tabs.jsx)
- **StatusPill**: [`frontend/src/components/ui/StatusPill.jsx`](../../../frontend/src/components/ui/StatusPill.jsx)

### Tab "Resumen"
- **Tarjetas de métricas** (ventas, pedidos, productos, clientes): Definidas inline en `AdminDashboardPage.jsx` (líneas ~100-200)
- **Gráfico de ventas** (Chart.js): Definido inline (líneas ~250-350)
- **Lista de pedidos recientes**: Definida inline con `StatusPill`

### Tab "Productos"
- **Gráfico de categorías** (performance): Definido inline (líneas ~400-500)
  - **Para editar**: Buscar `Tab Productos` o `Performance por Categoría` en `AdminDashboardPage.jsx`
  - Usa datos de `dashboardData?.categories` del hook `useAdminDashboard`
- **Lista de productos con bajo stock**: Definida inline
  - Botón "Ver todos" → navega a `/admin/productos?low_stock=1`

### Tab "Clientes"
- **Gráfico de nuevos clientes**: Definido inline
- **Lista de clientes recientes**: Definida inline

### Hook de datos:
- `useAdminDashboard` → [`frontend/src/modules/admin/hooks/useAdminDashboard.js`](../../../frontend/src/modules/admin/hooks/useAdminDashboard.js)

---

## 🛍️ Productos (`/admin/productos`)

**Archivo principal**: [`frontend/src/modules/admin/pages/AdminProductsPage.jsx`](../../../frontend/src/modules/admin/pages/AdminProductsPage.jsx)

### Componentes que usa:

- **Header**: `AdminPageHeader`
- **Tabla**: `DataTableV2` → [`frontend/src/components/data-display/DataTableV2.jsx`](../../../frontend/src/components/data-display/DataTableV2.jsx)
- **Columnas**: Definidas en `buildProductColumns` → [`frontend/src/modules/admin/utils/ProductsColumns.jsx`](../../../frontend/src/modules/admin/utils/ProductsColumns.jsx)
  - **Para editar columnas**: Buscar `buildProductColumns` en `ProductsColumns.jsx`
  - Incluye: Imagen, SKU, Nombre, Categoría, Precio, Stock, Estado, Acciones
- **Toolbar**: Renderizado inline con badges de filtros (líneas ~280-310)
- **Botones de acción**: `ResponsiveRowActions` → [`frontend/src/components/ui/ResponsiveRowActions.jsx`](../../../frontend/src/components/ui/ResponsiveRowActions.jsx)
  - Acciones: Ver detalle, Editar, Duplicar, Eliminar

### Drawers:
- **Crear/Editar producto**: `ProductDrawer` → [`frontend/src/modules/admin/components/ProductDrawer.jsx`](../../../frontend/src/modules/admin/components/ProductDrawer.jsx)
- **Ver detalle producto**: `ProductDetailDrawer` → [`frontend/src/modules/admin/components/ProductDetailDrawer.jsx`](../../../frontend/src/modules/admin/components/ProductDetailDrawer.jsx)

### Hook de datos:
- `useAdminProducts` → [`frontend/src/modules/admin/hooks/useAdminProducts.js`](../../../frontend/src/modules/admin/hooks/useAdminProducts.js)
- `useCategories` → [`frontend/src/modules/products/hooks/useCategories.js`](../../../frontend/src/modules/products/hooks/useCategories.js)

---

## 🗂️ Categorías (`/admin/categorias`)

**Archivo principal**: [`frontend/src/modules/admin/pages/AdminCategoriesPage.jsx`](../../../frontend/src/modules/admin/pages/AdminCategoriesPage.jsx)

### Componentes que usa:

- **Header**: `AdminPageHeader`
- **Tabla**: `DataTableV2`
- **Columnas**: Definidas en `buildCategoryColumns` → [`frontend/src/modules/admin/utils/categoriesColumns.jsx`](../../../frontend/src/modules/admin/utils/categoriesColumns.jsx)
  - **Para editar columnas**: Buscar `buildCategoryColumns`
  - Incluye: Nombre (con imagen), Slug, Descripción
- **Dialog de crear/editar**: `Dialog`, `DialogContent` → [`frontend/src/components/ui/radix/Dialog.jsx`](../../../frontend/src/components/ui/radix/Dialog.jsx)
  - Form inline en `AdminCategoriesPage.jsx` (líneas ~200-350)

### Hook de datos:
- `useAdminCategories` → [`frontend/src/modules/admin/hooks/useAdminCategories.js`](../../../frontend/src/modules/admin/hooks/useAdminCategories.js)

---

## 📦 Pedidos/Órdenes (`/admin/pedidos`)

**Archivo principal**: [`frontend/src/modules/admin/pages/orders/OrdersAdminPageV2.jsx`](../../../frontend/src/modules/admin/pages/orders/OrdersAdminPageV2.jsx)

### Componentes que usa:

- **Header**: `AdminPageHeader`
- **Toolbar**: `TableToolbar`, `TableSearch` → [`frontend/src/components/data-display/TableToolbar.jsx`](../../../frontend/src/components/data-display/TableToolbar.jsx)
  - **Para editar toolbar**: Buscar `TableToolbar` o líneas ~450-550 en `OrdersAdminPageV2.jsx`
  - Incluye: Búsqueda, filtros de estado pago/envío, botón exportar
- **Tabla**: `TanstackDataTable` → [`frontend/src/components/data-display/DataTable.jsx`](../../../frontend/src/components/data-display/DataTable.jsx)
- **Columnas**: Definidas en `buildOrderColumns` → [`frontend/src/modules/admin/utils/ordersColumns.jsx`](../../../frontend/src/modules/admin/utils/ordersColumns.jsx)
  - **Para editar columnas**: Buscar `buildOrderColumns`
  - Incluye: Orden #, Fecha, Total, Ítems, Estado, Acciones
- **Paginación**: `Pagination` → [`frontend/src/components/ui/Pagination.jsx`](../../../frontend/src/components/ui/Pagination.jsx)

### Filtros avanzados:
- Definidos inline (líneas ~350-450)
- Estados de pago: `ESTADOS_PAGO` (líneas ~38-45)
- Estados de envío: `ESTADOS_ENVIO` (líneas ~47-54)
- Métodos de despacho: `METODOS_DESPACHO` (líneas ~56-60)

### Exportación:
- Funciones inline: `handleExportCSV`, `handleExportJSON`, `handleExportXLSX` (líneas ~300-400)

### Hook de datos:
- `useAdminOrders` → [`frontend/src/modules/admin/hooks/useAdminOrders.js`](../../../frontend/src/modules/admin/hooks/useAdminOrders.js)

---

## 👥 Clientes/Usuarios (`/admin/usuarios`)

**Archivo principal**: [`frontend/src/modules/admin/pages/CustomersPage.jsx`](../../../frontend/src/modules/admin/pages/CustomersPage.jsx)

### Componentes que usa:

- **Header**: `AdminPageHeader`
- **Toolbar**: `TableToolbar`, `TableSearch`
  - **Para editar toolbar**: Buscar líneas ~250-300 en `CustomersPage.jsx`
  - Incluye: Búsqueda, toggle vista lista/grid, botón refrescar, botón nuevo cliente
- **Tabla (vista lista)**: `VirtualizedTable` → [`frontend/src/components/data-display/VirtualizedTable.jsx`](../../../frontend/src/components/data-display/VirtualizedTable.jsx)
  - Columnas definidas inline (líneas ~350-360): Nombre, Correo, Pedidos, Estado, Registro
  - Renderizado de fila customizado (líneas ~360-430)
- **Vista Grid**: Tarjetas customizadas inline (líneas ~470-550)
- **Drawer**: `CustomerDrawer` → [`frontend/src/modules/admin/components/CustomerDrawer.jsx`](../../../frontend/src/modules/admin/components/CustomerDrawer.jsx)
- **Drawer de órdenes**: `OrdersDrawer` → [`frontend/src/modules/admin/components/OrdersDrawer.jsx`](../../../frontend/src/modules/admin/components/OrdersDrawer.jsx)

### Diálogos:
- **Crear cliente**: Dialog inline (líneas ~580-650)
- **Editar cliente**: Dialog inline (líneas ~660-720)

### Hook de datos:
- Query con `@tanstack/react-query` directamente en el componente
- API: `customersAdminApi` → [`frontend/src/services/customersAdmin.api.js`](../../../frontend/src/services/customersAdmin.api.js)

---

## ⚙️ Configuración Tienda (`/admin/configuraciones`)

**Archivo principal**: [`frontend/src/modules/admin/pages/StoreSettingsPage.jsx`](../../../frontend/src/modules/admin/pages/StoreSettingsPage.jsx)

### Componentes que usa:

- **Header**: `AdminPageHeader`
- **Form**: Formulario inline con secciones
  - Información básica (líneas ~160-200)
  - Información de contacto (líneas ~205-245)
  - Redes sociales (líneas ~250-290)
- **Inputs**: `Input`, `Textarea` → [`frontend/src/components/ui/Input.jsx`](../../../frontend/src/components/ui/Input.jsx), [`frontend/src/components/shadcn/ui/textarea.jsx`](../../../frontend/src/components/shadcn/ui/textarea.jsx)
- **Botones**: `Button` → [`frontend/src/components/ui/Button.jsx`](../../../frontend/src/components/ui/Button.jsx)

### Servicios:
- `getStoreConfig`, `updateStoreConfig` → [`frontend/src/services/config.api.js`](../../../frontend/src/services/config.api.js)

---

## 🧩 Componentes Compartidos Admin

### 1. AdminPageHeader
**Ubicación**: [`frontend/src/modules/admin/components/AdminPageHeader.jsx`](../../../frontend/src/modules/admin/components/AdminPageHeader.jsx)

**Qué hace**: Header consistente para todas las páginas admin
- Props: `title`, `subtitle`, `icon`, `actions`, `className`
- **Para editar**: Cambiar estilos, layout de título/botones

### 2. Tablas

#### 🆕 UnifiedDataTable (RECOMENDADO)
**Ubicación**: [`frontend/src/components/data-display/UnifiedDataTable.jsx`](../../../frontend/src/components/data-display/UnifiedDataTable.jsx)

**Qué hace**: Componente de tabla unificado que reemplaza a DataTableV2, TanstackDataTable y VirtualizedTable
- ✅ TanStack Table v8 + virtualización OPCIONAL
- ✅ Todas las features: sorting, paginación, selección, edición inline, acciones
- ✅ Densidad ajustable (compact, normal, comfortable)
- ✅ Toolbar integrado con `UnifiedTableToolbar`
- ✅ Auto-optimiza según cantidad de datos
- **Props clave**: `columns`, `data`, `virtualized`, `selectable`, `editable`, `rowActions`, `density`, `toolbar`
- **Documentación completa**: [`docs/misDOCS/UNIFIED_TABLE_USAGE_GUIDE.md`](./UNIFIED_TABLE_USAGE_GUIDE.md)
- **Para editar**: Este es el único componente de tabla que deberías usar en nuevos desarrollos

#### UnifiedTableToolbar (COMPANION)
**Ubicación**: [`frontend/src/components/data-display/UnifiedTableToolbar.jsx`](../../../frontend/src/components/data-display/UnifiedTableToolbar.jsx)

**Qué hace**: Toolbar all-in-one con TODAS las features configurables
- 🔍 Search bar, 🔽 Column visibility, 📊 Sort by, 📤 Export (CSV/JSON/XLSX)
- 🎚️ Density toggle, 🔲 Layout toggle, 🔄 Refresh, ➕ Add new
- 🏷️ Quick filter pills, 🎛️ Advanced filters popover, 🧹 Clear filters
- Solo activas las features que necesites con props booleanos
- **Ejemplo**: Ver sección "Casos de Uso" en la guía de uso

---

#### 📦 Componentes Legacy (Deprecados - Migrar a UnifiedDataTable)

<details>
<summary>DataTableV2 (Legacy)</summary>

**Ubicación**: [`frontend/src/components/data-display/DataTableV2.jsx`](../../../frontend/src/components/data-display/DataTableV2.jsx)

**Qué hace**: Tabla completa con TanStack Table v8
- Features: sorting, paginación, selección, edición inline, acciones, toolbar integrado
- **Usada en**: AdminProductsPage, AdminCategoriesPage
- **Estado**: Legacy - Migrar a `UnifiedDataTable`
</details>

<details>
<summary>TanstackDataTable (Legacy)</summary>

**Ubicación**: [`frontend/src/components/data-display/DataTable.jsx`](../../../frontend/src/components/data-display/DataTable.jsx)

**Qué hace**: Tabla básica con TanStack Table
- **Usada en**: OrdersAdminPageV2
- **Estado**: Legacy - Migrar a `UnifiedDataTable`
</details>

<details>
<summary>VirtualizedTable (Legacy)</summary>

**Ubicación**: [`frontend/src/components/data-display/VirtualizedTable.jsx`](../../../frontend/src/components/data-display/VirtualizedTable.jsx)

**Qué hace**: Tabla virtualizada para grandes datasets
- **Usada en**: CustomersPage (vista lista)
- **Estado**: Legacy - Migrar a `UnifiedDataTable` con `virtualized={true}`
</details>

### 3. TableToolbar (Legacy - Usar UnifiedTableToolbar)

<details>
<summary>TableToolbar (Legacy)</summary>

**Ubicación**: [`frontend/src/components/data-display/TableToolbar.jsx`](../../../frontend/src/components/data-display/TableToolbar.jsx)

**Qué hace**: Toolbar básico para tablas
- Incluye: `TableSearch`, `FilterSelect`, `FilterTags`, etc.
- **Estado**: Legacy - Migrar a `UnifiedTableToolbar`
- **Motivo**: `UnifiedTableToolbar` incluye todas estas features + muchas más
</details>

### 4. ResponsiveRowActions
**Ubicación**: [`frontend/src/components/ui/ResponsiveRowActions.jsx`](../../../frontend/src/components/ui/ResponsiveRowActions.jsx)

**Qué hace**: Botones de acciones que se adaptan a pantalla
- Desktop (≥768px): Muestra botones individuales con iconos
- Mobile (<768px): Muestra menú elipsis (⋯) con dropdown
- Props: `actions` (array), `menuLabel`, `tooltipPosition`
- **Para editar**: Breakpoint responsive, estilos de botones/menú

### 5. Drawers (Sidepanels)

#### ProductDrawer
**Ubicación**: [`frontend/src/modules/admin/components/ProductDrawer.jsx`](../../../frontend/src/modules/admin/components/ProductDrawer.jsx)
- Form de crear/editar producto
- Validación con Zod + React Hook Form

#### ProductDetailDrawer
**Ubicación**: [`frontend/src/modules/admin/components/ProductDetailDrawer.jsx`](../../../frontend/src/modules/admin/components/ProductDetailDrawer.jsx)
- Vista read-only de producto
- Botón para editar (abre ProductDrawer)

#### CustomerDrawer
**Ubicación**: [`frontend/src/modules/admin/components/CustomerDrawer.jsx`](../../../frontend/src/modules/admin/components/CustomerDrawer.jsx)
- Vista de perfil de cliente
- Tabs: Info, Pedidos, Direcciones

#### OrdersDrawer
**Ubicación**: [`frontend/src/modules/admin/components/OrdersDrawer.jsx`](../../../frontend/src/modules/admin/components/OrdersDrawer.jsx)
- Lista de pedidos de un cliente
- Usado dentro de CustomerDrawer

### 6. StatusPill
**Ubicación**: [`frontend/src/components/ui/StatusPill.jsx`](../../../frontend/src/components/ui/StatusPill.jsx)

**Qué hace**: Badge de estado con colores
- Props: `status`, `domain` ('order', 'payment', 'shipping', 'user', 'product')
- Mapeo de colores en [`frontend/src/config/status-maps.js`](../../../frontend/src/config/status-maps.js)
- **Para editar colores**: Modificar `status-maps.js`

---

## 📁 Estructura de Archivos Clave

```
frontend/src/
├── modules/admin/
│   ├── pages/                          # Páginas principales
│   │   ├── AdminDashboardPage.jsx      # Dashboard principal
│   │   ├── AdminProductsPage.jsx       # Gestión de productos
│   │   ├── AdminCategoriesPage.jsx     # Gestión de categorías
│   │   ├── CustomersPage.jsx           # Gestión de clientes
│   │   ├── StoreSettingsPage.jsx       # Configuración tienda
│   │   └── orders/
│   │       ├── OrdersAdminPageV2.jsx   # Gestión de pedidos
│   │       └── OrderDetailPage.jsx     # Detalle de pedido
│   ├── components/                     # Componentes específicos admin
│   │   ├── AdminPageHeader.jsx         # Header común
│   │   ├── ProductDrawer.jsx           # Form producto
│   │   ├── ProductDetailDrawer.jsx     # Vista detalle producto
│   │   ├── CustomerDrawer.jsx          # Perfil cliente
│   │   └── OrdersDrawer.jsx            # Lista pedidos cliente
│   ├── hooks/                          # Hooks de datos
│   │   ├── useAdminDashboard.js
│   │   ├── useAdminProducts.js
│   │   ├── useAdminCategories.js
│   │   ├── useAdminOrders.js
│   │   └── useAdminOrderStats.js
│   └── utils/                          # Utilidades
│       ├── ProductsColumns.jsx         # Definición columnas productos
│       ├── categoriesColumns.jsx       # Definición columnas categorías
│       └── ordersColumns.jsx           # Definición columnas pedidos
│
├── components/
│   ├── data-display/                   # Componentes de tablas
│   │   ├── DataTableV2.jsx             # Tabla principal (TanStack)
│   │   ├── DataTable.jsx               # Tabla básica
│   │   ├── VirtualizedTable.jsx        # Tabla virtualizada
│   │   └── TableToolbar.jsx            # Toolbar + Search
│   └── ui/                             # UI Components
│       ├── Button.jsx
│       ├── StatusPill.jsx
│       ├── ResponsiveRowActions.jsx
│       ├── Pagination.jsx
│       └── radix/                      # Radix UI wrappers
│           ├── Dialog.jsx
│           └── DropdownMenu.jsx
│
├── services/                           # API clients
│   ├── products.api.js
│   ├── categories.api.js
│   ├── ordersAdmin.api.js
│   ├── customersAdmin.api.js
│   └── config.api.js
│
└── config/
    ├── status-maps.js                  # Mapeo de estados y colores
    └── status-options.js               # Opciones de estados
```

---

## 🆕 Migración a Componentes Unificados

### ¿Por qué migrar?
- ✅ **Un solo componente** para todas las tablas → más fácil de mantener
- ✅ **Virtualización automática** para grandes datasets → mejor rendimiento
- ✅ **Toolbar all-in-one** con todas las features → desarrollo más rápido
- ✅ **Diseño consistente** en todo el admin → mejor UX
- ✅ **Props booleanos** para activar features → configuración más simple

### Guía de Migración Rápida

```jsx
// ❌ Antes (DataTableV2 + TableToolbar)
<>
  <TableToolbar>
    <TableSearch value={search} onChange={setSearch} />
  </TableToolbar>
  <DataTableV2 columns={columns} data={data} rowActions={actions} />
</>

// ✅ Ahora (UnifiedDataTable + UnifiedTableToolbar)
<UnifiedDataTable
  columns={columns}
  data={data}
  rowActions={actions}
  toolbar={(table) => (
    <UnifiedTableToolbar
      table={table}
      search
      searchValue={search}
      onSearchChange={setSearch}
      columnVisibility
      refresh
      onRefresh={refetch}
    />
  )}
/>
```

### Ejemplos Completos
Ver guía completa: [`docs/misDOCS/UNIFIED_TABLE_USAGE_GUIDE.md`](./UNIFIED_TABLE_USAGE_GUIDE.md)

---

## 🔧 Casos de Uso Comunes

### 1. Editar gráfico de categorías en Dashboard
**Ruta**: Dashboard Admin → Tab "Productos" → Gráfico de performance

**Archivo**: [`frontend/src/modules/admin/pages/AdminDashboardPage.jsx`](../../../frontend/src/modules/admin/pages/AdminDashboardPage.jsx)

**Buscar**: 
- Línea ~400-500
- Texto: `"Performance por Categoría"` o `Tab Productos`
- Variable: `dashboardData?.categories`

**Cambios típicos**:
- Colores del gráfico: Array `backgroundColor` en config de Chart.js
- Tipo de gráfico: Cambiar `type: 'bar'` a `'line'`, `'pie'`, etc.
- Datos: Modificar [`useAdminDashboard`](../../../frontend/src/modules/admin/hooks/useAdminDashboard.js) hook

---

### 2. Editar toolbar de tablas admin
**Componente base**: `TableToolbar` y `TableSearch`

**Archivos**:
- Componente: [`frontend/src/components/data-display/TableToolbar.jsx`](../../../frontend/src/components/data-display/TableToolbar.jsx)
- Uso en productos: [`frontend/src/modules/admin/pages/AdminProductsPage.jsx`](../../../frontend/src/modules/admin/pages/AdminProductsPage.jsx) (líneas ~280-310)
- Uso en pedidos: [`frontend/src/modules/admin/pages/orders/OrdersAdminPageV2.jsx`](../../../frontend/src/modules/admin/pages/orders/OrdersAdminPageV2.jsx) (líneas ~450-550)
- Uso en clientes: [`frontend/src/modules/admin/pages/CustomersPage.jsx`](../../../frontend/src/modules/admin/pages/CustomersPage.jsx) (líneas ~250-300)

**Cambios típicos**:
- Estilos del search: Modificar `TableSearch` en `TableToolbar.jsx`
- Agregar filtro: Añadir `<Select>` o `<Button>` dentro del toolbar
- Layout: Cambiar clases Tailwind en `TableToolbar`

---

### 3. Editar columnas de tabla de productos
**Archivo**: [`frontend/src/modules/admin/utils/ProductsColumns.jsx`](../../../frontend/src/modules/admin/utils/ProductsColumns.jsx)

**Función**: `buildProductColumns`

**Cambios típicos**:
- Agregar columna: Añadir objeto al array retornado
- Ocultar columna: Eliminar objeto del array
- Cambiar orden: Reordenar objetos en el array
- Personalizar celda: Modificar prop `cell` de la columna

**Ejemplo agregar columna "Marca"**:
```jsx
{
  accessorKey: "brand",
  header: "Marca",
  size: 120,
  cell: ({ getValue }) => (
    <span className="text-sm">{getValue() || "—"}</span>
  ),
}
```

---

### 4. Cambiar colores de estados (StatusPill)
**Archivo**: [`frontend/src/config/status-maps.js`](../../../frontend/src/config/status-maps.js)

**Variables**:
- `ORDER_STATUS_MAP`: Estados de pedidos
- `PAYMENT_STATUS_MAP`: Estados de pago
- `SHIPPING_STATUS_MAP`: Estados de envío
- `USER_STATUS_MAP`: Estados de usuarios
- `PRODUCT_STATUS_MAP`: Estados de productos

**Ejemplo cambiar color de "pagado"**:
```javascript
pagado: {
  label: 'Pagado',
  color: 'success',  // Cambiar a: 'primary', 'warning', 'error', 'neutral'
  variant: 'solid'   // Cambiar a: 'outline', 'soft'
}
```

---

### 5. Modificar acciones de fila (botones)
**Componente**: `ResponsiveRowActions`

**Archivos de definición**:
- Productos: [`frontend/src/modules/admin/utils/ProductsColumns.jsx`](../../../frontend/src/modules/admin/utils/ProductsColumns.jsx) (líneas ~195-245)
- Pedidos: [`frontend/src/modules/admin/utils/ordersColumns.jsx`](../../../frontend/src/modules/admin/utils/ordersColumns.jsx) (líneas ~105-135)
- Clientes: [`frontend/src/modules/admin/pages/CustomersPage.jsx`](../../../frontend/src/modules/admin/pages/CustomersPage.jsx) (líneas ~410-425)

**Cambios típicos**:
- Agregar acción: Añadir objeto al array `actions`
- Cambiar icono: Importar de `lucide-react` y usar en prop `icon`
- Cambiar orden: Reordenar objetos en el array

**Ejemplo agregar acción "Archivar"**:
```jsx
{
  key: "archive",
  label: "Archivar",
  icon: Archive,  // Importar: import { Archive } from "lucide-react"
  onAction: () => handleArchive(product),
}
```

---

### 6. Cambiar tamaño/estilo de botones en drawers
**Archivos**:
- [`frontend/src/modules/admin/components/ProductDrawer.jsx`](../../../frontend/src/modules/admin/components/ProductDrawer.jsx) (líneas ~303-336)
- [`frontend/src/modules/admin/components/ProductDetailDrawer.jsx`](../../../frontend/src/modules/admin/components/ProductDetailDrawer.jsx) (líneas ~214-230)

**Propiedades del Button**:
- `size`: `"xs"`, `"sm"`, `"md"`, `"lg"`
- `appearance`: `"solid"`, `"outline"`, `"ghost"`
- `intent`: `"primary"`, `"neutral"`, `"error"`, `"success"`
- `className`: Para estilos custom (ej: `"rounded-full"` para pill)

---

## 📊 Hooks de Datos Admin

Todos los hooks devuelven data, loading, error y funciones de refetch.

| Hook | Archivo | Qué trae |
|------|---------|----------|
| `useAdminDashboard` | `hooks/useAdminDashboard.js` | Métricas generales, ventas, gráficos |
| `useAdminProducts` | `hooks/useAdminProducts.js` | Lista de productos con filtros y paginación |
| `useAdminCategories` | `hooks/useAdminCategories.js` | Lista de categorías |
| `useAdminOrders` | `hooks/useAdminOrders.js` | Lista de pedidos con filtros |
| `useAdminOrderStats` | `hooks/useAdminOrderStats.js` | Estadísticas de pedidos |

---

## 🎨 Guía de Estilos

### Colores (CSS Variables)
Definidos en: [`frontend/src/index.css`](../../../frontend/src/index.css)

```css
--color-primary1: #1a73e8;     /* Azul principal */
--color-secondary1: #5f6368;   /* Gris texto */
--color-success: #34a853;      /* Verde éxito */
--color-warning: #fbbc04;      /* Amarillo advertencia */
--color-error: #ea4335;        /* Rojo error */
--color-neutral3: #f1f3f4;     /* Gris fondo */
```

### Tamaños de botón
- `xs`: 24px alto, texto 12px
- `sm`: 32px alto, texto 14px
- `md`: 40px alto, texto 14px
- `lg`: 48px alto, texto 16px

### Breakpoints Tailwind
- `sm`: 640px
- `md`: 768px ← Breakpoint de ResponsiveRowActions
- `lg`: 1024px
- `xl`: 1280px

---

## 🚀 Tips de Desarrollo

### 1. Hot Reload
Si el hot reload no funciona después de cambios:
1. Presiona **F5** en el navegador
2. O detén el servidor y vuelve a ejecutar `npm run -w frontend dev`

### 2. Debugging de Tablas
Para ver data de las filas en consola:
```jsx
// En buildProductColumns.jsx o similar
cell: ({ row }) => {
  console.log('Row data:', row.original);
  return <span>...</span>;
}
```

### 3. Logs de Desarrollo
Los hooks ya tienen logs en modo DEV. Para ver:
```bash
# En consola del navegador (F12)
# Buscar: [useAdminProducts], [useAdminOrders], etc.
```

### 4. Verificar Props de Componentes
Usa PropTypes en los componentes. Los errores de tipo aparecen en consola.

### 5. Rutas Admin
Todas las rutas admin están en `frontend/src/config/api-paths.js`:
```javascript
admin: {
  dashboard: "/admin",
  products: "/admin/productos",
  categories: "/admin/categorias",
  orders: "/admin/pedidos",
  customers: "/admin/usuarios",
  settings: "/admin/configuraciones",
}
```

---

## 📝 Checklist de Cambios Comunes

### Agregar nueva columna a tabla
- [ ] Editar archivo de columnas (`*Columns.jsx`)
- [ ] Agregar objeto con `accessorKey`, `header`, `cell`
- [ ] Verificar que la data tenga ese campo
- [ ] Testear sorting si es necesario

### Agregar nuevo filtro
- [ ] Agregar estado en el componente de página
- [ ] Agregar `<Select>` o `<Input>` en el toolbar
- [ ] Pasar filtro al hook de datos
- [ ] Actualizar backend si es necesario

### Cambiar diseño de drawer
- [ ] Editar archivo del drawer (`*Drawer.jsx`)
- [ ] Modificar estructura del form
- [ ] Actualizar validación Zod si cambias campos
- [ ] Testear submit

### Agregar nueva acción
- [ ] Editar array de `actions` en columnas o componente
- [ ] Crear función handler (`handleNuevaAccion`)
- [ ] Agregar API call si es necesario
- [ ] Testear con loading/error states

---

## 🐛 Troubleshooting

### Loop infinito en tabla
**Problema**: Página se recarga constantemente

**Causa**: `buildColumns` sin `useMemo`

**Solución**:
```jsx
// ❌ Mal
<DataTableV2 columns={buildProductColumns({ ... })} />

// ✅ Bien
const columns = useMemo(() => 
  buildProductColumns({ ... }), 
  [deps]
);
<DataTableV2 columns={columns} />
```

### Import no resuelto
**Error**: `Failed to resolve import "@/..."`

**Solución**: 
1. Verificar que el archivo exista
2. Verificar alias `@/` en `jsconfig.json`
3. Reiniciar dev server

### Tabla no actualiza después de cambio
**Problema**: Data no se refresca

**Solución**: Llamar `refetch()` del hook después de mutación:
```jsx
const { refetch } = useAdminProducts();

const handleUpdate = async () => {
  await api.update();
  refetch(); // ← Importante
};
```

---

**Última actualización**: 22 de noviembre, 2025
