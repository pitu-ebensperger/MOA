# Admin Orders - Gestión de Pedidos (Backend)

## 📋 Índice

- [Descripción General](#descripción-general)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Estados de Órdenes](#estados-de-órdenes)
- [Flujo de Estados](#flujo-de-estados)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Testing con cURL](#testing-con-curl)
- [Integración Frontend](#integración-frontend)

---

## Descripción General

La funcionalidad de **Admin Orders** permite a los administradores gestionar completamente las órdenes de compra del sistema MOA, incluyendo:

- Listar todas las órdenes con filtros avanzados
- Ver detalles completos de cualquier orden
- Actualizar estados de pago y envío
- Agregar información de seguimiento
- Consultar estadísticas de ventas
- Gestionar notas internas

### Archivos Implementados

```
backend/
├── src/
│   ├── models/
│   │   └── orderAdminModel.js       # Lógica de datos para admin
│   ├── controllers/
│   │   └── orderAdminController.js  # Controladores HTTP
│   └── middleware/
│       └── verifyAdmin.js           # Middleware de autorización
├── routes/
│   └── adminRoutes.js               # Rutas protegidas
```

---

## Endpoints Disponibles

### 1. **Obtener Todas las Órdenes**

Listado paginado de órdenes con filtros avanzados.

**Endpoint:** `GET /admin/pedidos`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parámetro       | Tipo   | Requerido | Descripción                                      |
|-----------------|--------|-----------|--------------------------------------------------|
| limit           | number | No        | Cantidad de registros (default: 20)              |
| offset          | number | No        | Desplazamiento para paginación (default: 0)      |
| estado_pago     | string | No        | Filtrar por estado de pago                       |
| estado_envio    | string | No        | Filtrar por estado de envío                      |
| metodo_despacho | string | No        | Filtrar por método: standard, express, retiro    |
| fecha_desde     | string | No        | Filtrar desde fecha (ISO 8601)                   |
| fecha_hasta     | string | No        | Filtrar hasta fecha (ISO 8601)                   |
| search          | string | No        | Buscar por order_code, email o nombre            |
| order_by        | string | No        | Ordenar por: creado_en, total_cents, estado_pago |
| order_dir       | string | No        | Dirección: ASC o DESC (default: DESC)            |

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "orden_id": 1,
      "order_code": "MOA-20241117-0001",
      "usuario_id": 5,
      "usuario_nombre": "Juan Pérez",
      "usuario_email": "juan@example.com",
      "usuario_telefono": "+56912345678",
      "total_cents": 45000,
      "subtotal_cents": 40000,
      "envio_cents": 5000,
      "estado_pago": "pagado",
      "estado_envio": "en_transito",
      "metodo_despacho": "standard",
      "total_items": 3,
      "comuna": "Providencia",
      "ciudad": "Santiago",
      "region": "Región Metropolitana",
      "creado_en": "2024-11-17T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 2. **Obtener Orden por ID**

Detalles completos de una orden específica.

**Endpoint:** `GET /admin/pedidos/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "orden_id": 1,
    "order_code": "MOA-20241117-0001",
    "usuario_id": 5,
    "usuario_nombre": "Juan Pérez",
    "usuario_email": "juan@example.com",
    "usuario_telefono": "+56912345678",
    "usuario_public_id": "usr_abc123",
    "total_cents": 45000,
    "subtotal_cents": 40000,
    "envio_cents": 5000,
    "descuento_cents": 0,
    "impuestos_cents": 0,
    "estado_pago": "pagado",
    "estado_envio": "en_transito",
    "metodo_despacho": "standard",
    "transaccion_id": "TXN-1731842400-abc123",
    "fecha_pago": "2024-11-17T10:35:00Z",
    "fecha_envio": "2024-11-17T14:00:00Z",
    "numero_seguimiento": "CHX123456789",
    "empresa_envio": "Chilexpress",
    "notas_cliente": "Dejar con conserje",
    "notas_internas": "Cliente VIP - prioridad alta",
    "calle": "Av. Providencia",
    "numero": "1234",
    "depto_oficina": "Apto 302",
    "comuna": "Providencia",
    "ciudad": "Santiago",
    "region": "Región Metropolitana",
    "codigo_postal": "7500000",
    "pais": "Chile",
    "telefono_contacto": "+56912345678",
    "instrucciones_entrega": "Tocar timbre 302",
    "metodo_pago_tipo": "tarjeta_credito",
    "ultimos_digitos": "4242",
    "metodo_pago_marca": "Visa",
    "creado_en": "2024-11-17T10:30:00Z",
    "items": [
      {
        "orden_item_id": 1,
        "orden_id": 1,
        "producto_id": 10,
        "producto_nombre": "Almohada Memory Foam",
        "producto_slug": "almohada-memory-foam",
        "producto_sku": "ALM-001",
        "producto_img": "https://cdn.moa.cl/almohada.jpg",
        "producto_stock_actual": 15,
        "cantidad": 2,
        "precio_unit": 15000
      }
    ]
  }
}
```

---

### 3. **Actualizar Estado de Orden**

Actualizar estado de pago, envío, fechas y notas internas.

**Endpoint:** `PATCH /admin/pedidos/:id/estado`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "estado_pago": "pagado",
  "estado_envio": "enviado",
  "notas_internas": "Pedido urgente procesado",
  "fecha_envio": "2024-11-17T14:00:00Z"
}
```

**Campos Opcionales:**
- `estado_pago`: pendiente, procesando, pagado, fallido, reembolsado, cancelado
- `estado_envio`: preparacion, empaquetado, enviado, en_transito, entregado, devuelto
- `notas_internas`: string
- `fecha_pago`: ISO 8601 timestamp
- `fecha_envio`: ISO 8601 timestamp
- `fecha_entrega_real`: ISO 8601 timestamp

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Estado de orden actualizado exitosamente",
  "data": {
    "orden_id": 1,
    "estado_pago": "pagado",
    "estado_envio": "enviado",
    "fecha_envio": "2024-11-17T14:00:00Z"
  }
}
```

---

### 4. **Agregar Información de Seguimiento**

Agregar número de tracking y empresa de envío.

**Endpoint:** `POST /admin/pedidos/:id/seguimiento`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "numero_seguimiento": "CHX123456789",
  "empresa_envio": "Chilexpress",
  "fecha_envio": "2024-11-17T14:00:00Z"
}
```

**Campos:**
- `numero_seguimiento`: string (requerido) - Número de tracking del courier
- `empresa_envio`: string (requerido) - Nombre de la empresa (Chilexpress, Starken, Correos Chile, etc.)
- `fecha_envio`: string (opcional) - Fecha de envío, si no se provee usa now()

**Comportamiento:** Actualiza automáticamente `estado_envio` a `enviado` si está en `preparacion` o `empaquetado`.

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Información de seguimiento agregada exitosamente",
  "data": {
    "orden_id": 1,
    "numero_seguimiento": "CHX123456789",
    "empresa_envio": "Chilexpress",
    "fecha_envio": "2024-11-17T14:00:00Z",
    "estado_envio": "enviado"
  }
}
```

---

### 5. **Obtener Estadísticas de Órdenes**

Métricas agregadas de órdenes y ventas.

**Endpoint:** `GET /admin/pedidos/stats`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parámetro   | Tipo   | Requerido | Descripción                    |
|-------------|--------|-----------|--------------------------------|
| fecha_desde | string | No        | Filtrar desde fecha (ISO 8601) |
| fecha_hasta | string | No        | Filtrar hasta fecha (ISO 8601) |

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total_ordenes": 150,
    "pendientes": 12,
    "procesando": 8,
    "pagadas": 120,
    "canceladas": 10,
    "en_preparacion": 15,
    "enviadas": 45,
    "entregadas": 85,
    "total_ventas_cents": 6750000,
    "ticket_promedio_cents": 45000,
    "ventas_confirmadas_cents": 5400000
  }
}
```

---

### 6. **Actualizar Notas Internas**

Actualizar solo las notas internas de una orden.

**Endpoint:** `PATCH /admin/pedidos/:id/notas`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "notas_internas": "Cliente solicitó cambio de dirección por teléfono"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Notas internas actualizadas exitosamente",
  "data": {
    "orden_id": 1,
    "notas_internas": "Cliente solicitó cambio de dirección por teléfono"
  }
}
```

---

## Estados de Órdenes

### Estados de Pago (`estado_pago`)

| Estado       | Descripción                                       |
|--------------|---------------------------------------------------|
| pendiente    | Orden creada, esperando pago                      |
| procesando   | Pago en proceso de validación                     |
| pagado       | Pago confirmado y validado                        |
| fallido      | Pago rechazado o falló                            |
| reembolsado  | Dinero devuelto al cliente                        |
| cancelado    | Orden cancelada (antes del pago)                  |

### Estados de Envío (`estado_envio`)

| Estado      | Descripción                                       |
|-------------|---------------------------------------------------|
| preparacion | Orden confirmada, preparando productos            |
| empaquetado | Productos empaquetados, listo para enviar         |
| enviado     | Paquete entregado al courier                      |
| en_transito | Paquete en ruta hacia el destino                  |
| entregado   | Paquete recibido por el cliente                   |
| devuelto    | Envío devuelto (cliente rechazó o no estaba)      |

---

## Flujo de Estados

### Flujo Normal de Orden

```
┌─────────────┐
│   CREADA    │
│ pendiente   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   PAGANDO   │
│ procesando  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│   PAGADA    │────▶│ preparacion  │
│   pagado    │     └──────┬───────┘
└─────────────┘            │
                           ▼
                    ┌──────────────┐
                    │ empaquetado  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   enviado    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  en_transito │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  entregado   │
                    └──────────────┘
```

### Flujos Alternativos

**Cancelación:**
```
pendiente ──▶ cancelado (cliente cancela antes de pagar)
```

**Pago Fallido:**
```
procesando ──▶ fallido (tarjeta rechazada)
```

**Devolución:**
```
en_transito ──▶ devuelto (cliente no recibe, rechaza, etc.)
entregado ──▶ devuelto (devolución posterior)
```

**Reembolso:**
```
pagado ──▶ reembolsado (admin procesa devolución de dinero)
```

---

## Ejemplos de Uso

### Ejemplo 1: Listar Órdenes Pendientes de Hoy

```bash
curl -X GET "http://localhost:3000/admin/pedidos?estado_pago=pendiente&fecha_desde=2024-11-17T00:00:00Z&limit=50" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Ejemplo 2: Buscar Orden por Email del Cliente

```bash
curl -X GET "http://localhost:3000/admin/pedidos?search=juan@example.com" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Ejemplo 3: Marcar Orden como Enviada con Tracking

```bash
# Paso 1: Agregar tracking
curl -X POST "http://localhost:3000/admin/pedidos/1/seguimiento" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numero_seguimiento": "CHX123456789",
    "empresa_envio": "Chilexpress"
  }'

# Paso 2: Actualizar estado a en_transito
curl -X PATCH "http://localhost:3000/admin/pedidos/1/estado" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado_envio": "en_transito"
  }'
```

### Ejemplo 4: Procesar Reembolso

```bash
curl -X PATCH "http://localhost:3000/admin/pedidos/1/estado" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado_pago": "reembolsado",
    "notas_internas": "Reembolso procesado por producto defectuoso. Transacción REF-20241117-001"
  }'
```

---

## Testing con cURL

### Pre-requisito: Obtener Token de Admin

```bash
# 1. Login como admin
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moa.cl",
    "password": "admin123"
  }'

# Respuesta:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }

# Guardar el token en variable
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test 1: Listar Órdenes

```bash
curl -X GET "http://localhost:3000/admin/pedidos?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test 2: Ver Detalle de Orden

```bash
curl -X GET "http://localhost:3000/admin/pedidos/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test 3: Actualizar Estado

```bash
curl -X PATCH "http://localhost:3000/admin/pedidos/1/estado" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado_pago": "pagado",
    "estado_envio": "preparacion",
    "fecha_pago": "2024-11-17T10:30:00Z"
  }'
```

### Test 4: Agregar Tracking

```bash
curl -X POST "http://localhost:3000/admin/pedidos/1/seguimiento" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numero_seguimiento": "STK987654321",
    "empresa_envio": "Starken"
  }'
```

### Test 5: Obtener Estadísticas

```bash
# Estadísticas de los últimos 7 días
FECHA_DESDE=$(date -u -v-7d +"%Y-%m-%dT%H:%M:%SZ")
FECHA_HASTA=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

curl -X GET "http://localhost:3000/admin/pedidos/stats?fecha_desde=$FECHA_DESDE&fecha_hasta=$FECHA_HASTA" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test 6: Actualizar Notas Internas

```bash
curl -X PATCH "http://localhost:3000/admin/pedidos/1/notas" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notas_internas": "Cliente contactó para confirmar dirección de entrega"
  }'
```

---

## Integración Frontend

### Crear Servicio de API

Crear o actualizar `/frontend/src/services/orders.api.js`:

```javascript
import apiClient from './api-client';

export const ordersAdminApi = {
  // Listar órdenes con filtros
  getAll: (params = {}) => {
    return apiClient.private.get('/admin/pedidos', { params });
  },

  // Obtener orden por ID
  getById: (ordenId) => {
    return apiClient.private.get(`/admin/pedidos/${ordenId}`);
  },

  // Actualizar estado
  updateStatus: (ordenId, data) => {
    return apiClient.private.patch(`/admin/pedidos/${ordenId}/estado`, data);
  },

  // Agregar tracking
  addTracking: (ordenId, data) => {
    return apiClient.private.post(`/admin/pedidos/${ordenId}/seguimiento`, data);
  },

  // Obtener estadísticas
  getStats: (params = {}) => {
    return apiClient.private.get('/admin/pedidos/stats', { params });
  },

  // Actualizar notas internas
  updateNotes: (ordenId, notasInternas) => {
    return apiClient.private.patch(`/admin/pedidos/${ordenId}/notas`, {
      notas_internas: notasInternas,
    });
  },
};
```

### Ejemplo de Componente React

```jsx
import { useState, useEffect } from 'react';
import { ordersAdminApi } from '@/services/orders.api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado_pago: '',
    estado_envio: '',
    limit: 20,
    offset: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAdminApi.getAll(filters);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ordenId, newStatus) => {
    try {
      await ordersAdminApi.updateStatus(ordenId, {
        estado_envio: newStatus,
      });
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // ... resto del componente
}
```

---

## Respuestas de Error

### 400 Bad Request
```json
{
  "success": false,
  "message": "Estado de pago inválido. Valores permitidos: pendiente, procesando, pagado, fallido, reembolsado, cancelado"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Acceso denegado. Se requieren permisos de administrador"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Orden no encontrada"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error al obtener órdenes",
  "error": "Detailed error message (only in development)"
}
```

---

## Notas Importantes

### Seguridad

1. **Todos los endpoints requieren autenticación JWT** con `role_code = 'admin'`
2. Los usuarios deben **re-loguearse** si sus tokens no incluyen `role_code`
3. El middleware `verifyAdmin` valida automáticamente los permisos

### Base de Datos

- Los estados están validados con `CHECK` constraints en PostgreSQL
- Las fechas se almacenan en formato `TIMESTAMPTZ` (UTC)
- Los montos se almacenan en centavos (integers) para evitar problemas de redondeo

### Performance

- Las consultas usan índices en `usuario_id`, `estado_pago`, `estado_envio`, `creado_en`
- La paginación es obligatoria para evitar cargar demasiados registros
- Las búsquedas por texto usan `ILIKE` (case-insensitive)

### Recomendaciones

1. Usar el endpoint de estadísticas para dashboards
2. Implementar notificaciones cuando cambia `estado_envio`
3. Validar transiciones de estados en el frontend (ej: no permitir pasar de `pendiente` a `entregado` directamente)
4. Mantener un log de cambios de estado (historial) para auditoría

---

## Próximos Pasos

- [ ] Implementar historial de cambios de estado
- [ ] Agregar webhooks para notificar cambios al cliente
- [ ] Integrar con APIs de couriers para tracking automático
- [ ] Implementar exportación de órdenes a CSV/Excel
- [ ] Agregar filtros por rango de montos
- [ ] Implementar bulk actions (actualizar múltiples órdenes)

---

**Documentación actualizada:** 17 de noviembre de 2024  
**Versión:** 1.0.0  
**Backend:** Node.js + Express + PostgreSQL
