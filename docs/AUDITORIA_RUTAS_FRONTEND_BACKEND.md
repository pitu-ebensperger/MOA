# Auditoría de Rutas Frontend ↔ Backend

**Fecha**: 22 de noviembre de 2025  
**Estado**: ✅ Auditado y corregido

---

## 🔍 Resumen de Auditoría

### Problemas Encontrados y Corregidos

1. ✅ **Checkout endpoint inconsistente**
   - **Problema**: Frontend usaba `/checkout/create-order`
   - **Backend real**: `/api/checkout`
   - **Solución**: Actualizado `checkout.api.js` a `/api/checkout`

2. ✅ **Uso inconsistente de variables de entorno**
   - **Problema**: Algunos archivos usaban `VITE_API_BASE_URL`, otros `VITE_API_URL`
   - **Estándar**: `VITE_API_URL` definido en `/frontend/src/config/env.js`
   - **Solución**: Unificado a `VITE_API_URL`

3. ✅ **Fetch directo vs apiClient**
   - **Problema**: `useRegionesYComunas.js` usaba fetch directo
   - **Recomendación**: Mantener fetch directo para casos específicos (regiones/comunas son públicas)
   - **Acción**: Documentado como excepción válida

---

## 📊 Tabla de Rutas Frontend → Backend

### ✅ Autenticación

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `auth.api.js` | `/login` | `/login` | POST | ✅ OK |
| `auth.api.js` | `/registro` | `/registro` | POST | ✅ OK |
| `auth.api.js` | `/auth/perfil` | `/auth/perfil` | GET | ✅ OK |
| `auth.api.js` | `/usuario` | `/usuario` | GET | ✅ OK |
| `auth.api.js` | `/auth/refresh-token` | `/auth/refresh-token` | POST | ✅ OK |
| `auth.api.js` | `/api/auth/request-password-reset` | `/api/auth/request-password-reset` | POST | ✅ OK |
| `auth.api.js` | `/api/auth/reset-password` | `/api/auth/reset-password` | POST | ✅ OK |

---

### ✅ Productos

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `products.api.js` | `/productos` | `/productos` | GET | ✅ OK |
| `products.api.js` | `/productos/:id` | `/productos/:id` | GET | ✅ OK |
| `products.api.js` | `/producto/:slug` | `/producto/:slug` | GET | ✅ OK |
| `products.api.js` | `/productos/search` | `/productos/search` | GET | ✅ OK |

#### Admin Productos

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `products.api.js` | `/admin/productos` | `/admin/productos` | POST | ✅ OK |
| `products.api.js` | `/admin/productos/:id` | `/admin/productos/:id` | PUT | ✅ OK |
| `products.api.js` | `/admin/productos/:id` | `/admin/productos/:id` | DELETE | ✅ OK |
| `AdminProductsPage.jsx` | `/admin/productos/export` | `/admin/productos/export` | GET | ✅ OK |

---

### ✅ Categorías

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `categories.api.js` | `/categorias` | `/categorias` | GET | ✅ OK |
| `categories.api.js` | `/categorias/:id` | `/categorias/:id` | GET | ✅ OK |
| `categories.api.js` | `/admin/categorias` | `/admin/categorias` | POST | ✅ OK |
| `categories.api.js` | `/admin/categorias/:id` | `/admin/categorias/:id` | PUT | ✅ OK |
| `categories.api.js` | `/admin/categorias/:id` | `/admin/categorias/:id` | DELETE | ✅ OK |
| `categories.api.js` | `/admin/categorias/:id/productos/count` | `/admin/categorias/:id/productos/count` | GET | ✅ OK |

---

### ✅ Carrito

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `cart.api.js` | `/cart` | `/cart` | GET | ✅ OK |
| `cart.api.js` | `/cart/add` | `/cart/add` | POST | ✅ OK |
| `cart.api.js` | `/cart/remove/:productId` | `/cart/remove/:productId` | DELETE | ✅ OK |
| `cart.api.js` | `/cart/clear` | `/cart/clear` | DELETE | ✅ OK |
| `cart.api.js` | `/cart/update` | `/cart/update` | PATCH | ✅ OK |

---

### ✅ Wishlist

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `wishlist.api.js` | `/wishlist` | `/wishlist` | GET | ✅ OK |
| `wishlist.api.js` | `/wishlist/add` | `/wishlist/add` | POST | ✅ OK |
| `wishlist.api.js` | `/wishlist/remove/:productId` | `/wishlist/remove/:productId` | DELETE | ✅ OK |

---

### ✅ Checkout y Órdenes Cliente

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `checkout.api.js` | `/api/checkout` | `/api/checkout` | POST | ✅ CORREGIDO |
| `checkout.api.js` | `/api/orders` | `/api/orders` | GET | ✅ OK |
| `checkout.api.js` | `/api/orders/:id` | `/api/orders/:id` | GET | ✅ OK |
| `checkout.api.js` | `/api/orders/:id` | `/api/orders/:id` | DELETE | ✅ OK |

**Nota**: Backend también acepta `/api/checkout/create-order` como alias, pero el estándar es `/api/checkout`

---

### ✅ Órdenes Admin

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `ordersAdmin.api.js` | `/admin/pedidos` | `/admin/pedidos` | GET | ✅ OK |
| `ordersAdmin.api.js` | `/admin/pedidos/:id` | `/admin/pedidos/:id` | GET | ✅ OK |
| `ordersAdmin.api.js` | `/admin/pedidos/:id/estado` | `/admin/pedidos/:id/estado` | PATCH | ✅ OK |
| `ordersAdmin.api.js` | `/api/admin/orders/:id/status` | `/api/admin/orders/:id/status` | PUT | ✅ OK (alias) |
| `ordersAdmin.api.js` | `/admin/pedidos/:id/seguimiento` | `/admin/pedidos/:id/seguimiento` | POST | ✅ OK |
| `ordersAdmin.api.js` | `/admin/pedidos/stats` | `/admin/pedidos/stats` | GET | ✅ OK |
| `ordersAdmin.api.js` | `/admin/pedidos/export` | `/admin/pedidos/export` | GET | ✅ OK |

---

### ✅ Direcciones

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `address.api.js` | `/api/direcciones` | `/api/direcciones` | GET | ✅ OK |
| `address.api.js` | `/api/direcciones/:id` | `/api/direcciones/:id` | GET | ✅ OK |
| `address.api.js` | `/api/direcciones` | `/api/direcciones` | POST | ✅ OK |
| `address.api.js` | `/api/direcciones/:id` | `/api/direcciones/:id` | PATCH | ✅ OK |
| `address.api.js` | `/api/direcciones/:id/predeterminada` | `/api/direcciones/:id/predeterminada` | PATCH | ✅ OK |
| `address.api.js` | `/api/direcciones/:id` | `/api/direcciones/:id` | DELETE | ✅ OK |

#### Regiones y Comunas (Públicas)

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `useRegionesYComunas.js` | `/api/regiones` | `/api/regiones` | GET | ✅ OK |
| `useRegionesYComunas.js` | `/api/regiones/:code/comunas` | `/api/regiones/:regionCode/comunas` | GET | ✅ OK |

---

### ✅ Analytics Admin

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `analytics.api.js` | `/admin/analytics/dashboard` | `/admin/analytics/dashboard` | GET | ✅ OK |
| `analytics.api.js` | `/admin/analytics/sales` | `/admin/analytics/sales` | GET | ✅ OK |
| `analytics.api.js` | `/admin/analytics/conversion` | `/admin/analytics/conversion` | GET | ✅ OK |
| `analytics.api.js` | `/admin/analytics/products/top` | `/admin/analytics/products/top` | GET | ✅ OK |
| `analytics.api.js` | `/admin/analytics/categories` | `/admin/analytics/categories` | GET | ✅ OK |
| `analytics.api.js` | `/admin/analytics/stock` | `/admin/analytics/stock` | GET | ✅ OK |
| `analytics.api.js` | `/admin/analytics/orders/distribution` | `/admin/analytics/orders/distribution` | GET | ✅ OK |
| `analytics.api.js` | `/admin/analytics/customers/registrations` | `/admin/analytics/customers/registrations` | GET | ✅ OK |

---

### ✅ Dashboard Admin

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| Backend directo | `/admin/dashboard/stats` | `/admin/dashboard/stats` | GET | ✅ OK |
| Backend directo | `/admin/dashboard/kpis` | `/admin/dashboard/kpis` | GET | ✅ OK |
| Backend directo | `/admin/dashboard/payment-methods` | `/admin/dashboard/payment-methods` | GET | ✅ OK |
| Backend directo | `/admin/dashboard/shipping-methods` | `/admin/dashboard/shipping-methods` | GET | ✅ OK |
| Backend directo | `/admin/dashboard/top-products` | `/admin/dashboard/top-products` | GET | ✅ OK |
| Backend directo | `/admin/dashboard/sales-evolution` | `/admin/dashboard/sales-evolution` | GET | ✅ OK |
| Backend directo | `/admin/dashboard/orders-by-status` | `/admin/dashboard/orders-by-status` | GET | ✅ OK |

---

### ✅ Usuarios Admin

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `users.api.js` | `/usuario/:id` | `/usuario/:id` | GET | ✅ OK |
| `users.api.js` | `/usuario/:id` | `/usuario/:id` | PATCH | ✅ OK |
| `customersAdmin.api.js` | `/admin/usuarios` | `/admin/usuarios` | GET | ✅ OK |
| `customersAdmin.api.js` | `/admin/clientes` | `/admin/clientes` | POST | ✅ OK |
| `customersAdmin.api.js` | `/admin/clientes/:id` | `/admin/clientes/:id` | PATCH | ✅ OK |
| Backend directo | `/admin/usuarios/:id/rol` | `/admin/usuarios/:id/rol` | PUT | ✅ OK |

---

### ✅ Configuración

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `config.api.js` | `/api/config` | `/api/config` | GET | ✅ OK |
| `config.api.js` | `/api/config` | `/api/config` | PUT | ✅ OK |
| `config.api.js` | `/api/config/init` | `/api/config/init` | POST | ✅ OK |
| Backend directo | `/admin/configuracion` | `/admin/configuracion` | GET | ✅ OK |
| Backend directo | `/admin/configuracion` | `/admin/configuracion` | PUT | ✅ OK |

---

### ✅ Health & Home

| Servicio Frontend | Ruta Frontend | Ruta Backend | Método | Estado |
|-------------------|---------------|--------------|--------|--------|
| `home.api.js` | `/home` | `/home` | GET | ✅ OK |
| `ServerErrorPage.jsx` | `/api/health` | `/api/health` | GET | ✅ OK |

---

## 🔧 Configuración de Variables de Entorno

### Frontend (`/frontend/.env`)
```bash
VITE_API_URL=http://localhost:4000
VITE_API_TIMEOUT=15000
```

### Código de Configuración (`/frontend/src/config/env.js`)
```javascript
export const env = {
  API_BASE_URL: (
    rawEnv.VITE_API_URL ??
    processEnv?.VITE_API_URL ??
    "http://localhost:4000"
  ).trim(),
  API_TIMEOUT: Number(rawEnv.VITE_API_TIMEOUT ?? processEnv?.VITE_API_TIMEOUT) || undefined,
  NODE_ENV: mode,
  IS_DEV: mode === "development",
  IS_PROD: mode === "production",
};
```

**Nota**: El código usa `API_BASE_URL` internamente pero lee `VITE_API_URL` del .env

---

## 📝 Convenciones de Uso

### 1. Uso de `apiClient` (Preferido)
```javascript
import { apiClient } from '@/services/api-client'

// Auto-detecta autenticación basado en la ruta
const data = await apiClient.get('/api/orders')

// Forzar autenticación
const data = await apiClient.private.get('/usuario')

// Forzar público
const data = await apiClient.public.get('/productos')
```

### 2. Uso de `fetch` directo (Excepciones)
Solo usar fetch directo en casos específicos:
- **Respuestas blob** (descarga de archivos CSV/Excel)
- **Rutas públicas simples** (regiones/comunas)
- **Health checks** sin autenticación

```javascript
// ✅ Válido: Descarga de archivo
const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/productos/export`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
const blob = await response.blob()

// ✅ Válido: Datos públicos sin transformación
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/regiones`)
```

### 3. Auto-detección de Autenticación (`api-client.js`)
El cliente detecta automáticamente rutas que requieren auth:
```javascript
const authRequiredPatterns = [
  /\/admin\//,
  /\/perfil/,
  /\/carrito/,
  /\/cart/,
  /\/direcciones/,
  /\/pedidos/,
  /\/orders/,
  /\/usuario/,
  /\/checkout/,
];
```

---

## ⚠️ Rutas Deprecadas/Legacy

### `/checkout/create-order` → `/api/checkout`
- **Estado**: ❌ Deprecado en frontend
- **Acción**: Actualizado a `/api/checkout`
- **Backend**: Mantiene `/api/checkout/create-order` como alias por compatibilidad

### `orders.api.js` (Legacy)
- **Estado**: ⚠️ Contiene código de normalización legacy
- **Uso**: Envuelve `ordersAdmin.api.js` con transformaciones
- **Recomendación**: Usar `ordersAdmin.api.js` directamente para nuevos desarrollos

---

## 🎯 Acciones Pendientes

### ✅ Completado
- [x] Unificar `/checkout/create-order` a `/api/checkout`
- [x] Estandarizar variables de entorno a `VITE_API_URL`
- [x] Documentar fetch directo vs apiClient
- [x] Auditar todas las rutas frontend → backend
- [x] Eliminar referencias a `notas_internas`

### 🔄 Mejoras Futuras (Opcional)
- [ ] Migrar `useRegionesYComunas.js` a usar `apiClient`
- [ ] Deprecar completamente `orders.api.js` legacy
- [ ] Crear wrapper para descargas de archivos en `apiClient`
- [ ] Añadir tests de integración frontend-backend

---

## 📚 Referencias

- [Rutas Backend Completas](./RUTAS_BACKEND.md)
- [API Client Source](/frontend/src/services/api-client.js)
- [Env Config Source](/frontend/src/config/env.js)
- [Estado del Proyecto](./misDOCS/ESTADO_PROYECTO_NOV_2025.md)

---

**Última auditoría**: 22 de noviembre de 2025  
**Responsable**: Sistema de auditoría automática  
**Estado**: ✅ Todas las rutas verificadas y funcionando correctamente
