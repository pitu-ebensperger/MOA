# Rutas del Backend - MOA API

**Última actualización**: 22 de noviembre de 2025  
**Backend Port**: 4000  
**Estado**: Homogenización completada - `notas_internas` eliminado

---

## 📋 Convenciones de Rutas

### Patrones de URL
- **Rutas públicas**: Sin prefijo `/api/` (e.g., `/productos`, `/categorias`)
- **Rutas de autenticación**: Sin prefijo `/api/` (e.g., `/login`, `/registro`)
- **Rutas protegidas usuarios**: Prefijo `/api/` (e.g., `/api/orders`, `/api/direcciones`)
- **Rutas admin**: Prefijo `/admin/` (e.g., `/admin/pedidos`, `/admin/usuarios`)

### Middleware
- `verifyToken`: Requiere JWT válido (cliente o admin)
- `verifyAdmin`: Requiere JWT con `rol_code: 'ADMIN'`
- `validatePaymentMethod`: Valida método de pago en checkout

---

## 🏠 Rutas Generales

### Health & Home
```
GET  /                     # API status
GET  /home                 # Home data
GET  /api/health           # Health check (duplicado en config y health)
```

---

## 🔐 Autenticación (`authRoutes.js`)

### Login/Registro
```
POST /login                      # Login de usuario
POST /registro                   # Registro de nuevo usuario
GET  /auth/perfil                # Obtener perfil del usuario autenticado
GET  /usuario                    # Alias de /auth/perfil
POST /auth/refresh-token         # Refrescar JWT token
```

### Recuperación de Contraseña
```
POST /api/auth/request-password-reset  # Solicitar reset de contraseña
POST /api/auth/reset-password          # Resetear contraseña con token
```

**Middleware**: `verifyToken` para rutas protegidas

---

## 👤 Usuarios (`usersRoutes.js`)

```
GET    /usuario/:id        # Obtener usuario por ID
PATCH  /usuario/:id        # Actualizar usuario
```

**Middleware**: `verifyToken`

---

## 📦 Productos (`productsRoutes.js`)

### Públicas
```
GET  /productos                  # Listar productos (paginado)
GET  /productos/search           # Buscar productos por query
GET  /producto/:slug             # Obtener producto por slug
GET  /productos/:id              # Obtener producto por ID
```

### Admin
```
GET    /admin/productos/export      # Exportar productos a CSV
GET    /admin/productos/stock/low   # Productos con stock bajo
GET    /admin/productos/stats       # Estadísticas de productos
POST   /admin/productos             # Crear producto
PUT    /admin/productos/:id         # Actualizar producto
DELETE /admin/productos/:id         # Eliminar producto
PATCH  /admin/productos/:id/stock   # Actualizar stock
```

**Middleware Admin**: `verifyToken`, `verifyAdmin`

---

## 📂 Categorías (`categoriesRoutes.js`)

### Públicas
```
GET  /categorias          # Listar categorías
GET  /categorias/:id      # Obtener categoría por ID
```

### Admin
```
POST   /admin/categorias                        # Crear categoría
PUT    /admin/categorias/:id                    # Actualizar categoría
DELETE /admin/categorias/:id                    # Eliminar categoría
GET    /admin/categorias/:id/productos/count    # Contar productos por categoría
```

**Middleware Admin**: `verifyToken`, `verifyAdmin`

---

## 🛒 Carrito (`cartRoutes.js`)

```
GET    /cart                        # Obtener carrito del usuario
POST   /cart/add                    # Agregar producto al carrito
DELETE /cart/remove/:productId      # Eliminar producto del carrito
DELETE /cart/clear                  # Vaciar carrito
PATCH  /cart/update                 # Actualizar cantidad de producto
```

**Middleware**: `verifyToken`

---

## 💚 Wishlist (`wishlistRoutes.js`)

```
GET    /wishlist                    # Obtener wishlist del usuario
POST   /wishlist/add                # Agregar producto a wishlist
DELETE /wishlist/remove/:productId  # Eliminar producto de wishlist
```

**Middleware**: `verifyToken`

---

## 📍 Direcciones (`addressRoutes.js`)

### Regiones y Comunas (Públicas)
```
GET  /api/regiones                           # Listar todas las regiones
GET  /api/regiones/:regionCode/comunas       # Obtener comunas por región
```

### CRUD Direcciones (Protegidas)
```
GET    /api/direcciones                      # Listar direcciones del usuario
GET    /api/direcciones/predeterminada       # Obtener dirección predeterminada
GET    /api/direcciones/:id                  # Obtener dirección por ID
POST   /api/direcciones                      # Crear dirección
PATCH  /api/direcciones/:id                  # Actualizar dirección
PATCH  /api/direcciones/:id/predeterminada   # Establecer como predeterminada
DELETE /api/direcciones/:id                  # Eliminar dirección
```

**Middleware**: `verifyToken`

---

## 📦 Órdenes (`orderRoutes.js`)

### Cliente
```
POST   /api/checkout                         # Crear orden desde carrito
POST   /api/checkout/create-order            # Alias de /api/checkout
GET    /api/orders                           # Listar órdenes del usuario
GET    /api/orders/:id                       # Obtener orden por ID
DELETE /api/orders/:id                       # Cancelar orden
```

**Middleware**: `verifyToken`, `validatePaymentMethod` (para checkout)

**Nota**: Rutas admin de órdenes están en `adminRoutes.js`

---

## 🔧 Admin - Pedidos (`adminRoutes.js`)

### Gestión de Pedidos
```
GET   /admin/pedidos                         # Listar todas las órdenes (admin)
GET   /admin/pedidos/stats                   # Estadísticas de órdenes
GET   /admin/pedidos/export                  # Exportar órdenes a CSV
GET   /admin/pedidos/:id                     # Obtener orden por ID (admin)
PATCH /admin/pedidos/:id/estado              # Actualizar estado de orden
PUT   /api/admin/orders/:id/status           # Alias de PATCH estado
POST  /admin/pedidos/:id/seguimiento         # Agregar info de seguimiento
```

### Campos Actualizables en `/admin/pedidos/:id/estado`
```json
{
  "estado_pago": "pagado | pendiente | rechazado | reembolsado",
  "estado_envio": "preparacion | enviado | en_transito | entregado | cancelado",
  "fecha_pago": "ISO8601",
  "fecha_envio": "ISO8601",
  "fecha_entrega_real": "ISO8601",
  "numero_seguimiento": "string",
  "empresa_envio": "chilexpress | correos-chile | starken | bluexpress | dhl"
}
```

**⚠️ Campo Eliminado**: `notas_internas` (no existe en DDL actual)

---

## 📊 Admin - Analytics (`adminRoutes.js`)

### Dashboard
```
GET  /admin                                           # Métricas generales de dashboard
GET  /admin/analytics/dashboard                       # Métricas de dashboard
GET  /admin/analytics/sales                           # Análisis de ventas
GET  /admin/analytics/conversion                      # Métricas de conversión
GET  /admin/analytics/products/top                    # Productos más vendidos
GET  /admin/analytics/categories                      # Análisis por categorías
GET  /admin/analytics/stock                           # Análisis de stock
GET  /admin/analytics/orders/distribution             # Distribución de órdenes
GET  /admin/analytics/customers/registrations         # Registros de clientes
```

### Dashboard Stats
```
GET  /admin/dashboard/stats                           # Estadísticas del dashboard
GET  /admin/dashboard/kpis                            # KPIs principales
GET  /admin/dashboard/payment-methods                 # Estadísticas por método de pago
GET  /admin/dashboard/shipping-methods                # Estadísticas por método de envío
GET  /admin/dashboard/top-products                    # Top productos
GET  /admin/dashboard/sales-evolution                 # Evolución de ventas
GET  /admin/dashboard/orders-by-status                # Órdenes por estado
```

---

## 👥 Admin - Usuarios y Clientes (`adminRoutes.js`)

```
GET   /admin/usuarios                # Listar todos los usuarios
PUT   /admin/usuarios/:id/rol        # Actualizar rol de usuario
POST  /admin/clientes                # Crear cliente
PATCH /admin/clientes/:id            # Actualizar cliente
```

---

## 🏪 Admin - Configuración Tienda (`adminRoutes.js`)

```
GET  /admin/configuracion            # Obtener configuración de tienda
PUT  /admin/configuracion            # Actualizar configuración de tienda
```

---

## ⚙️ Configuración (`configRoutes.js`)

```
GET  /api/config                     # Obtener configuración pública
PUT  /api/config                     # Actualizar configuración (admin)
POST /api/config/init                # Inicializar configuración (admin)
```

**Middleware Admin**: `verifyAdmin` para PUT/POST

---

## 🔍 Notas Importantes

### Estados Válidos (100% Español)

#### `estado_orden`
- `'borrador'` - Orden en creación
- `'confirmado'` - Orden confirmada (default)
- `'cancelado'` - Orden cancelada

#### `estado_pago`
- `'pendiente'` - Pago pendiente
- `'procesando'` - Pago en proceso
- `'pagado'` - Pago completado
- `'fallido'` - Pago fallido
- `'reembolsado'` - Pago reembolsado
- `'cancelado'` - Pago cancelado

#### `estado_envio`
- `'preparacion'` - Preparando envío (default)
- `'enviado'` - Enviado
- `'en_transito'` - En tránsito
- `'entregado'` - Entregado
- `'cancelado'` - Envío cancelado

### Empresas de Envío Válidas
- `'chilexpress'`
- `'correos-chile'`
- `'starken'`
- `'bluexpress'`
- `'dhl'`

### Campos de Usuario
- **`rol_code`**: `'CLIENT'` | `'ADMIN'` (NO usar `rol`)
- **JWT payload**: `{ id, email, role_code, rol }` donde `rol === role_code`

### Response Structure
```json
{
  "success": true,
  "data": [...],      // NO usar "items" 
  "pagination": {...}
}
```

---

## 🧪 Testing

**Tests Actuales**: 6 tests ejecutándose  
**Tests Pasando**: 1 suite (`stockValidation.test.js`)  
**Tests Fallando**: 5 suites (requieren ajustes de rutas/validaciones)

### Archivos de Test
```
✅ __tests__/stockValidation.test.js     - PASS
❌ __tests__/routes.test.js
❌ __tests__/adminOrderStatus.test.js
❌ __tests__/orderStock.test.js
❌ __tests__/adminOrderPermissions.test.js
❌ __tests__/adminPermissions.test.js
```

---

## 📝 Changelog Reciente

### 22 Nov 2025
- ✅ Eliminado campo `notas_internas` de DDL, backend y frontend
- ✅ Homogenización de estados a 100% español
- ✅ Rutas documentadas y verificadas
- ✅ Tests limpiados (referencias a `notas_internas` eliminadas)
- ✅ Campo `rol` eliminado, solo `rol_code` (`CLIENT`/`ADMIN`)

---

## 🔗 Ver También

- [DDL Schema](../backend/database/schema/DDL.sql)
- [Order States Constants](../shared/constants/order-states.js)
- [API Paths Config](../frontend/src/config/api-paths.js)
- [Estado del Proyecto](./misDOCS/ESTADO_PROYECTO_NOV_2025.md)
