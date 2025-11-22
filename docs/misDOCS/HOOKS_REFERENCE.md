# Referencia de Hooks - MOA

**Última actualización:** 21 de noviembre, 2025

---

## 📋 Índice
1. [Hooks generales](#hooks-generales)
2. [Hooks de autenticación](#hooks-de-autenticación)
3. [Hooks de productos](#hooks-de-productos)
4. [Hooks de órdenes](#hooks-de-órdenes)
5. [Hooks de carrito](#hooks-de-carrito)
6. [Hooks de perfil/wishlist](#hooks-de-perfilwishlist)
7. [Hooks de admin](#hooks-de-admin)
8. [Hooks UI/utilidades](#hooks-uiutilidades)

---

## 🔧 Hooks generales

### `useDebounce(value, delay)`
**Ubicación:** `frontend/src/hooks/useDebounce.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Retrasa la actualización de un valor para reducir llamadas a la API (ej: búsqueda) | `value`: valor a debounce<br>`delay`: ms de espera (default 500) | Valor debounced | `CustomersPage`, `OrdersAdminPageV2`, búsquedas en tiempo real |

**Ejemplo:**
```javascript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // Se ejecuta solo después de 300ms sin cambios
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

---

### `useDebouncedCallback(callback, delay)`
**Ubicación:** `frontend/src/hooks/useDebounce.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Similar a useDebounce pero para funciones completas | `callback`: función a ejecutar<br>`delay`: ms (default 500) | Función debounced | Validaciones de formularios, autocomplete |

---

### `usePersistentState(key, initialValue)`
**Ubicación:** `frontend/src/hooks/usePersistentState.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Estado que se guarda en localStorage automáticamente | `key`: clave en localStorage<br>`initialValue`: valor inicial | `[state, setState]` | `useCart` (carrito local), preferencias usuario |

**Ejemplo:**
```javascript
const [theme, setTheme] = usePersistentState('user-theme', 'light');
// Se guarda automáticamente en localStorage
```

---

### `useStoreConfig()`
**Ubicación:** `frontend/src/hooks/useStoreConfig.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Obtiene configuración global de la tienda (nombre, logo, envío, etc) | Ninguno | `{ config, loading, error }` | `Navbar`, `Footer`, `CheckoutPage` |

---

### `useErrorHandler(options)`
**Ubicación:** `frontend/src/hooks/useErrorHandler.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Manejo centralizado de errores con alertas visuales | `defaultMessage`: mensaje por defecto<br>`onError`: callback personalizado | `handleError(error)` | Todos los módulos críticos |

**Variantes:**
- `useFormErrorHandler()`: Para errores de formularios
- `useRetry(asyncFn, options)`: Reintenta operaciones fallidas

---

### `usePrefetch()`
**Ubicación:** `frontend/src/hooks/usePrefetch.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Pre-carga datos en cache para navegación instantánea | Ninguno | `{ prefetchProduct, prefetchCategory }` | Hover en cards, links de navegación |

---

### `useCacheManager()`
**Ubicación:** `frontend/src/hooks/useCacheManager.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Control manual de cache de React Query | Ninguno | `{ invalidate, clear, refresh }` | Admin después de crear/editar/eliminar |

**Variantes:**
- `useCacheStatus()`: Monitorea estado del cache
- `useQueryDebug()`: Debug de queries (dev only)

---

### `useCategoryMatcher(categories)`
**Ubicación:** `frontend/src/hooks/useCategoryMatcher.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Busca categoría por ID o slug en un array | `categories`: array de categorías | `{ findById, findBySlug }` | `ProductDetailPage`, breadcrumbs |

---

### `useSortedProducts(items, options)`
**Ubicación:** `frontend/src/hooks/useSortProducts.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Ordena array de productos según criterio | `items`: productos<br>`options`: `{sortBy, sortDir}` | Array ordenado | `ProductsPage`, listas de productos |

**Variante:**
- `useSortState(initial)`: Maneja estado de ordenamiento

---

## 🔐 Hooks de autenticación

### `useSessionMonitor(options)`
**Ubicación:** `frontend/src/hooks/useSessionMonitor.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Monitorea expiración del JWT y muestra alertas | `token`: JWT<br>`onExpired`: callback<br>`onWarning`: callback<br>`warningMinutes`: min antes (default 5) | `{ isExpiring, timeLeft, status }` | `App.jsx` (global) |

**Estados:**
- `'active'`: Sesión válida
- `'warning'`: Faltan X minutos
- `'expired'`: Token expirado

---

### `useRedirectAfterAuth()`
**Ubicación:** `frontend/src/modules/auth/hooks/useRedirectAuth.jsx`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Redirecciona después de login/logout según rol | Ninguno | `{ redirectAfterLogin, redirectAfterLogout }` | `LoginPage`, `Navbar` |

---

## 🛍️ Hooks de productos

### `useProducts(filters)`
**Ubicación:** `frontend/src/modules/products/hooks/useProducts.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Obtiene lista de productos con filtros | `filters`: objeto de filtros (categoría, precio, búsqueda, página) | `{ data, loading, error, hasMore }` | `ProductsPage`, `CategoriesPage` |

**Variantes:**
- `useProduct(productId)`: Un solo producto por ID
- `useInvalidateProducts()`: Invalida cache de productos

---

### `useCategories(options)`
**Ubicación:** `frontend/src/modules/products/hooks/useCategories.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Obtiene todas las categorías | `options`: `{enabled}` | `{ categories, loading, error }` | `Navbar`, `ProductsPage`, filters |

**Variantes:**
- `useCategory(categoryId)`: Una categoría por ID
- `useInvalidateCategories()`: Invalida cache

---

### `useProductFilters(options)`
**Ubicación:** `frontend/src/modules/products/hooks/useProductFilters.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Maneja estado completo de filtros de productos | `initialFilters`: filtros iniciales<br>`onFiltersChange`: callback | `{ filters, setFilters, resetFilters, activeFiltersCount }` | `ProductsPage` |

---

### `useCatalogControls(options)`
**Ubicación:** `frontend/src/modules/products/hooks/useCatalogControls.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Controles completos de catálogo (filtros + vista + sort) | `options`: config inicial | `{ filters, viewMode, sortBy, handlers }` | `ProductsPage` completa |

---

### `useHomeLanding()`
**Ubicación:** `frontend/src/modules/home/hooks/useHomeLanding.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Datos para landing page (productos destacados, categorías, banners) | Ninguno | `{ featured, categories, loading }` | `HomePage` |

---

## 📦 Hooks de órdenes

### `useOrders(options)` ⚠️
**Ubicación:** `frontend/src/modules/orders/hooks/useOrders.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Lista de órdenes del usuario (NO ADMIN) | `options`: filtros | `{ orders, loading, error }` | `ProfilePage`, `MyOrdersSection` |

**Variantes del mismo archivo:**
- `useOrder(orderId)`: Una orden por ID
- `useCreateOrder()`: Mutation para crear orden
- `useCancelOrder()`: Mutation para cancelar
- `useInvalidateOrders()`: Invalida cache

> ⚠️ **Nota:** Existe otro `useOrders` en `frontend/src/hooks/useOrders.js` (legacy) - preferir el de módulo

---

### `useUserOrders(options)`
**Ubicación:** `frontend/src/hooks/useUserOrders.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Lista de órdenes del usuario autenticado | `options`: config de query | `{ orders, loading, error, refetch }` | `ProfilePage`, `OrderHistoryPage` |

---

## 🛒 Hooks de carrito

### `useCart()`
**Ubicación:** `frontend/src/modules/cart/hooks/useCart.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| **Hook principal del carrito** - Gestión completa de items | Ninguno | `{ items, addItem, updateQty, removeItem, clear, total, subtotal, itemCount, syncCart }` | `CartPage`, `CartDrawer`, `ProductDetailPage`, `CheckoutPage` |

**Funciones clave:**
- `addItem(product, qty)`: Agregar producto
- `updateQuantity(productId, qty)`: Cambiar cantidad
- `removeItem(productId)`: Eliminar item
- `clearCart()`: Vaciar carrito
- `syncCart()`: Sincronizar con backend (si auth)

**Estados:**
- Carrito local (guest): localStorage
- Carrito auth: Backend + sincronización automática

---

## 👤 Hooks de perfil/wishlist

### `useUser()`
**Ubicación:** `frontend/src/modules/profile/hooks/useUser.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Datos del perfil del usuario autenticado | Ninguno | `{ user, loading, error, refetch }` | `ProfilePage`, `AddressesSection` |

---

### `useWishlist()`
**Ubicación:** `frontend/src/modules/profile/hooks/useWishlist.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Hook legacy de wishlist (context-based) | Ninguno | `{ items, addToWishlist, removeFromWishlist, isInWishlist }` | Legacy components |

---

### `useWishlistQuery()`
**Ubicación:** `frontend/src/modules/profile/hooks/useWishlistQuery.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Wishlist con React Query (recomendado) | Ninguno | `{ wishlist, loading, error }` | `WishlistPage`, `WishlistSection` |

**Variantes del mismo archivo:**
- `useAddToWishlistMutation()`: Agregar a wishlist
- `useRemoveFromWishlistMutation()`: Eliminar de wishlist
- `useIsInWishlist(productId)`: Verifica si está en wishlist
- `useToggleWishlist()`: Toggle add/remove
- `useClearWishlist()`: Vaciar wishlist

---

## 👨‍💼 Hooks de admin

### `useAdminDashboard()`
**Ubicación:** `frontend/src/modules/admin/hooks/useAdminDashboard.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Datos completos del dashboard admin (métricas, gráficos) | Ninguno | `{ data: { metrics, sales, conversion, stock, topProducts, categories }, loading }` | `AdminDashboardPage` |

---

### `useAdminOrders(options)`
**Ubicación:** `frontend/src/modules/admin/hooks/useAdminOrders.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Lista de órdenes para admin con filtros avanzados | `options`: `{page, limit, search, estadoPago, estadoEnvio}` | `{ orders, total, totalPages, loading, error, refetch }` | `OrdersAdminPageV2`, `OrdersDrawer` |

---

### `useAdminProducts(options)`
**Ubicación:** `frontend/src/modules/admin/hooks/useAdminProducts.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Lista de productos para admin con filtros | `options`: `{page, limit, search, status, categoryId, onlyLowStock}` | `{ items, total, totalPages, loading, refetch }` | `ProductsAdminPage`, `AdminProductsPage` |

---

### `useAdminCategories()`
**Ubicación:** `frontend/src/modules/admin/hooks/useAdminCategories.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Categorías para admin con paginación | Ninguno | `{ categories, loading, error, page, setPage, totalPages }` | `AdminCategoriesPage` |

---

### `useAdminOrderStats(options)`
**Ubicación:** `frontend/src/modules/admin/hooks/useAdminOrderStats.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Estadísticas de órdenes para dashboard | `options`: rango de fechas | `{ stats, loading }` | `AdminDashboardPage` (gráficos) |

---

## 🎨 Hooks UI/utilidades

### `useInput(initialValue)`
**Ubicación:** `frontend/src/hooks/useInput.js`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Simplifica manejo de inputs controlados | `initialValue`: valor inicial | `{ value, onChange }` | Formularios simples (legacy) |

**Ejemplo:**
```javascript
const name = useInput('');
<input {...name} />  // Spread value y onChange
```

---

### `useConfirm()`
**Ubicación:** `frontend/src/components/ui/ConfirmDialog.jsx`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Diálogo de confirmación programático | Ninguno | `confirm(options)` promise | Eliminar items, acciones destructivas |

**Ejemplo:**
```javascript
const confirm = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: '¿Eliminar producto?',
    message: 'Esta acción no se puede deshacer',
  });
  if (confirmed) deleteProduct();
};
```

---

### `useToast()`
**Ubicación:** `frontend/src/components/ui/Toast.jsx`

| Qué hace | Parámetros | Retorna | Usado en |
|----------|------------|---------|----------|
| Sistema de notificaciones toast | Ninguno | `{ success, error, info, warning }` | Feedback de acciones en toda la app |

**Ejemplo:**
```javascript
const toast = useToast();

toast.success('Producto agregado al carrito');
toast.error('Error al procesar pago');
```

---

## 📊 Resumen por categoría

### Hooks más usados (top 10)

| Hook | Ubicación | Usado en (aprox) | Propósito principal |
|------|-----------|------------------|---------------------|
| `useCart` | `modules/cart` | 15+ componentes | Gestión completa del carrito |
| `useAuth` | Context (no hook file) | 30+ componentes | Estado de autenticación |
| `useProducts` | `modules/products` | 8 componentes | Lista de productos |
| `useDebounce` | `hooks/` | 6 componentes | Búsquedas en tiempo real |
| `useErrorHandler` | `hooks/` | 10+ componentes | Manejo centralizado de errores |
| `useCategories` | `modules/products` | 7 componentes | Lista de categorías |
| `useWishlistQuery` | `modules/profile` | 5 componentes | Wishlist con React Query |
| `useAdminOrders` | `modules/admin` | 3 componentes | Órdenes en admin |
| `useStoreConfig` | `hooks/` | 4 componentes | Config global tienda |
| `useSessionMonitor` | `hooks/` | 1 componente (App.jsx) | Monitoreo JWT global |

---

## 🔍 Búsqueda rápida

### Por funcionalidad

| Necesitas... | Usa este hook |
|--------------|---------------|
| Agregar al carrito | `useCart()` |
| Ver órdenes del usuario | `useUserOrders()` o `useOrders()` |
| Filtrar productos | `useProductFilters()` o `useCatalogControls()` |
| Mostrar alerta | `useToast()` |
| Confirmar acción | `useConfirm()` |
| Buscar en tiempo real | `useDebounce()` |
| Guardar preferencias | `usePersistentState()` |
| Wishlist | `useWishlistQuery()` (moderno) o `useWishlist()` (legacy) |
| Dashboard admin | `useAdminDashboard()` |
| Manejo errores | `useErrorHandler()` |
| Pre-cargar datos | `usePrefetch()` |
| Monitor sesión | `useSessionMonitor()` |

---

## ⚠️ Hooks deprecados/legacy

| Hook | Ubicación | Reemplazado por | Acción |
|------|-----------|-----------------|--------|
| `useWishlist` | `modules/profile` | `useWishlistQuery` | Migrar a React Query |
| `useOrders` (raíz) | `hooks/` | `useOrders` (módulo) | Usar versión de módulo |
| `useInput` | `hooks/` | React Hook Form | Considerar react-hook-form |

---

## 📝 Convenciones

### Naming
- Hooks de datos: `use[Entity]()`  ej: `useProducts()`, `useOrders()`
- Hooks de acciones: `use[Action][Entity]`  ej: `useAddToWishlist()`, `useCreateOrder()`
- Hooks de estado: `use[State]State`  ej: `useSortState()`, `useFilterState()`
- Hooks de UI: `use[Component]`  ej: `useToast()`, `useConfirm()`

### Estructura de retorno
```javascript
// Hook de datos
const { data, loading, error, refetch } = useEntity();

// Hook de mutación
const { mutate, isLoading, error } = useCreateEntity();

// Hook de estado
const { state, setState, reset } = useEntityState();
```

---

**Última actualización:** 21 de noviembre, 2025

> 💡 **Tip:** Usa Ctrl+F para buscar rápidamente un hook por nombre o funcionalidad
