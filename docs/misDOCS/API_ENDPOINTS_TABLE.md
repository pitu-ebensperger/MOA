# API Endpoints Reference

Inventario consolidado de todos los endpoints expuestos por la API de MOA.  
La columna **Auth** resume el requisito mínimo:

| Valor | Significado |
| --- | --- |
| `Public` | No requiere token JWT |
| `User` | JWT válido (`verifyToken`) |
| `Admin` | JWT válido + rol administrador (`verifyAdmin`) |

---

## General & Utilitarios

| Módulo | Método | Path | Descripción | Auth |
| --- | --- | --- | --- | --- |
| Core | GET | `/` | Ping simple usado por tests/monitoring | Public |
| Health | GET | `/api/health` | Health-check completo (status app + DB) | Public |
| Config (dup) | GET | `/api/health` | Health básico definido en `configRoutes` (mismo path anterior) | Public |
| Home | GET | `/home` | Datos agregados para landing (hero, destacados, etc.) | Public |

## Autenticación & Usuarios

| Módulo | Método | Path | Descripción | Auth |
| --- | --- | --- | --- | --- |
| Auth | POST | `/login` | Iniciar sesión (rate-limited) | Public |
| Auth | GET | `/auth/perfil` | Recuperar perfil del usuario autenticado | User |
| Auth | GET | `/usuario` | Alias de perfil autenticado | User |
| Auth | POST | `/auth/refresh-token` | Refrescar JWT antes de expirar | User |
| Password Reset | POST | `/api/auth/request-password-reset` | Solicitar email con token de reset | Public |
| Password Reset | POST | `/api/auth/reset-password` | Completar cambio de contraseña | Public |
| Usuarios | POST | `/registro` | Registro de cuenta (valida credenciales) | Public |
| Usuarios | GET | `/usuario/:id` | Obtener usuario por ID (solo dueños/admins) | User |
| Usuarios | PATCH | `/usuario/:id` | Actualizar datos propios | User |

## Catálogo Público

| Módulo | Método | Path | Descripción | Auth |
| --- | --- | --- | --- | --- |
| Categorías | GET | `/categorias` | Listado público con filtros básicos | Public |
| Categorías | GET | `/categorias/:id` | Detalle de categoría | Public |
| Productos | GET | `/productos` | Catálogo con filtros, paginación, ordenamiento | Public |
| Productos | GET | `/productos/search` | Búsqueda por texto/combinada | Public |
| Productos | GET | `/producto/:slug` | Detalle por slug (friendly URL) | Public |
| Productos | GET | `/productos/:id` | Detalle por ID numérico o `public_id` | Public |

## Flujos Autenticados (Cliente)

| Módulo | Método | Path | Descripción | Auth |
| --- | --- | --- | --- | --- |
| Wishlist | GET | `/wishlist` | Obtener wishlist del usuario | User |
| Wishlist | POST | `/wishlist/add` | Agregar producto (`producto_id`) | User |
| Wishlist | DELETE | `/wishlist/remove/:productId` | Quitar producto | User |
| Carrito | GET | `/cart` | Obtener carrito activo | User |
| Carrito | POST | `/cart/add` | Agregar item (`producto_id`, `cantidad`) | User |
| Carrito | DELETE | `/cart/remove/:productId` | Eliminar item puntual | User |
| Carrito | DELETE | `/cart/clear` | Vaciar carrito | User |
| Carrito | PATCH | `/cart/update` | Actualizar cantidad (`producto_id`, `cantidad`) | User |
| Órdenes | POST | `/api/checkout` | Crear orden desde carrito (valida stock) | User |
| Órdenes | GET | `/api/orders` | Listar órdenes propias (filtros estado/paginación) | User |
| Órdenes | GET | `/api/orders/:id` | Detalle de orden (valida pertenencia) | User |
| Órdenes | DELETE | `/api/orders/:id` | Cancelar orden (solo propias) | User |
| Direcciones | GET | `/api/direcciones` | Listar direcciones guardadas | User |
| Direcciones | GET | `/api/direcciones/predeterminada` | Obtener dirección default | User |
| Direcciones | GET | `/api/direcciones/:id` | Detalle (scoped al owner) | User |
| Direcciones | POST | `/api/direcciones` | Crear nueva dirección | User |
| Direcciones | PATCH | `/api/direcciones/:id` | Actualizar datos | User |
| Direcciones | PATCH | `/api/direcciones/:id/predeterminada` | Marcar como default | User |
| Direcciones | DELETE | `/api/direcciones/:id` | Eliminar dirección | User |
| Configuración | GET | `/api/config` | Leer configuración pública de la tienda | Public |

## Administración (requiere rol admin)

| Submódulo | Método | Path | Descripción | Auth |
| --- | --- | --- | --- | --- |
| Categorías | POST | `/admin/categorias` | Crear categoría | Admin |
| Categorías | PUT | `/admin/categorias/:id` | Actualizar categoría | Admin |
| Categorías | DELETE | `/admin/categorias/:id` | Eliminar categoría | Admin |
| Categorías | GET | `/admin/categorias/:id/productos/count` | Conteo de productos asociados | Admin |
| Productos | POST | `/admin/productos` | Crear producto | Admin |
| Productos | PUT | `/admin/productos/:id` | Actualizar producto | Admin |
| Productos | DELETE | `/admin/productos/:id` | Eliminar producto | Admin |
| Productos | PATCH | `/admin/productos/:id/stock` | Ajustar stock | Admin |
| Productos | GET | `/admin/productos/stock/low` | Listar productos con stock bajo | Admin |
| Productos | GET | `/admin/productos/stats` | Métricas de catálogo | Admin |
| Admin Placeholder | GET | `/admin/productos` | Endpoint legacy (responde 501) | Admin |
| Admin Placeholder | POST | `/admin/productos` | Alias legacy (501) | Admin |
| Admin Placeholder | PUT | `/admin/productos/:id` | Alias legacy (501) | Admin |
| Admin Placeholder | DELETE | `/admin/productos/:id` | Alias legacy (501) | Admin |
| Pedidos Admin | GET | `/admin/pedidos` | Listar pedidos globales (filtros avanzados) | Admin |
| Pedidos Admin | GET | `/admin/pedidos/:id` | Detalle admin | Admin |
| Pedidos Admin | GET | `/admin/pedidos/stats` | Métricas por estado/fecha | Admin |
| Pedidos Admin | GET | `/admin/pedidos/export` | Export CSV | Admin |
| Pedidos Admin | PATCH | `/admin/pedidos/:id/estado` | Actualizar estado pago/envío/notas | Admin |
| Pedidos Admin | PUT | `/api/admin/orders/:id/status` | Alias REST para el mismo update | Admin |
| Pedidos Admin | POST | `/admin/pedidos/:id/seguimiento` | Agregar tracking (nº seguimiento, empresa) | Admin |
| Analytics | GET | `/admin/analytics/dashboard` | Métricas resumen dashboard | Admin |
| Analytics | GET | `/admin/analytics/sales` | Series de ventas | Admin |
| Analytics | GET | `/admin/analytics/conversion` | Funnel / conversión | Admin |
| Analytics | GET | `/admin/analytics/products/top` | Productos top | Admin |
| Analytics | GET | `/admin/analytics/categories` | Rendimiento por categoría | Admin |
| Analytics | GET | `/admin/analytics/stock` | Salud de inventario | Admin |
| Analytics | GET | `/admin/analytics/orders/distribution` | Distribución por estado | Admin |
| Analytics | GET | `/admin/analytics/customers/registrations` | Altas de clientes | Admin |
| Usuarios Admin | GET | `/admin/usuarios` | Listado clientes (con filtros internos) | Admin |
| Usuarios Admin | PUT | `/admin/usuarios/:id/rol` | Cambiar rol/estado | Admin |
| Usuarios Admin | POST | `/admin/clientes` | Crear cliente manual | Admin |
| Usuarios Admin | PATCH | `/admin/clientes/:id` | Actualizar cliente existente | Admin |
| Config Admin | GET | `/admin/configuracion` | Leer configuración (versión editable) | Admin |
| Config Admin | PUT | `/admin/configuracion` | Actualizar configuración admin | Admin |
| Config Pública | PUT | `/api/config` | Actualizar config pública (requiere admin) | Admin |
| Config Pública | POST | `/api/config/init` | Inicializar valores por default | Admin |

---

### Notas rápidas
- Algunos endpoints tienen alias históricos (ej. `/admin/pedidos/:id/estado` y `/api/admin/orders/:id/status`). Ambos están activos y apuntan al mismo controlador.
- El endpoint `/checkout/create-order` usado por algunas partes del frontend no existe en la API; la ruta válida es `POST /api/checkout`.
- `/api/health` aparece dos veces (en `healthRoutes` y `configRoutes`); el primero expone métricas completas y debería ser el canon principal.
