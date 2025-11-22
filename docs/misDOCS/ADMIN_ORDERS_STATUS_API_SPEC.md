# API Especificación - Admin Order Status

**Última actualización:** 21 de noviembre, 2025

## Endpoints

### 1. PATCH `/admin/pedidos/:id/estado`

Actualizar el estado de pago y/o envío de una orden. Endpoint principal para cambios de estado desde el admin dashboard.

#### Autenticación
- **Requerida:** Sí
- **Tipo:** Bearer Token (JWT)
- **Roles permitidos:** `ADMIN`

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `number` | ID de la orden (orden_id) |

#### Request Body
```json
{
  "estado_pago": "pagado",           // opcional
  "estado_envio": "enviado",         // opcional
  "notas_internas": "...",           // opcional
  "fecha_pago": "2025-11-21",        // opcional (ISO 8601)
  "fecha_envio": "2025-11-21",       // opcional (ISO 8601)
  "fecha_entrega_real": "2025-11-23", // opcional (ISO 8601)
  "numero_seguimiento": "CHX123456", // opcional
  "empresa_envio": "chilexpress"     // opcional
}
```

#### Valores Válidos

**`estado_pago`** (string, opcional):
- `"pendiente"` - Orden creada, esperando pago
- `"procesando"` - Pago en proceso de verificación
- `"pagado"` - Pago confirmado
- `"fallido"` - Pago rechazado
- `"reembolsado"` - Dinero devuelto al cliente
- `"cancelado"` - Orden cancelada

**`estado_envio`** (string, opcional):
- `"preparacion"` - Orden recibida, preparando productos
- `"empaquetado"` - Productos empaquetados, listo para envío
- `"enviado"` - Paquete entregado a courier
- `"en_transito"` - En ruta de entrega
- `"entregado"` - Entregado al cliente
- `"devuelto"` - Devuelto al remitente

**`empresa_envio`** (string, opcional):
- `"chilexpress"` - Chilexpress
- `"blue_express"` - Blue Express
- `"starken"` - Starken
- `"correos_chile"` - Correos de Chile
- `"otros"` - Otros couriers

**Notas:**
- Al menos uno de los campos debe estar presente
- Las fechas deben estar en formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
- `numero_seguimiento` solo es relevante cuando `estado_envio` es `"enviado"` o posterior
- `empresa_envio` se normaliza automáticamente (case-insensitive, espacios/guiones)

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "orden_id": 123,
    "order_code": "ORD-2025-123",
    "estado_pago": "pagado",
    "estado_envio": "enviado",
    "fecha_pago": "2025-11-21T14:30:00Z",
    "fecha_envio": "2025-11-21T16:00:00Z",
    "numero_seguimiento": "CHX123456",
    "empresa_envio": "chilexpress",
    "actualizado_en": "2025-11-21T16:05:23Z"
  }
}
```

#### Response Errors

**400 Bad Request** - Payload vacío
```json
{
  "success": false,
  "message": "Debe proporcionar al menos un campo para actualizar"
}
```

**400 Bad Request** - Estado de pago inválido
```json
{
  "success": false,
  "message": "Estado de pago inválido. Valores permitidos: pendiente, procesando, pagado, fallido, reembolsado, cancelado"
}
```

**400 Bad Request** - Estado de envío inválido
```json
{
  "success": false,
  "message": "Estado de envío inválido. Valores permitidos: preparacion, empaquetado, enviado, en_transito, entregado, devuelto"
}
```

**400 Bad Request** - Empresa de envío inválida
```json
{
  "success": false,
  "message": "Empresa de envío inválida. Valores permitidos: Chilexpress, Blue Express, Starken, Correos de Chile, Otros"
}
```

**401 Unauthorized** - Token faltante o inválido
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

**403 Forbidden** - Usuario no es admin
```json
{
  "success": false,
  "message": "Acceso denegado. Se requieren permisos de administrador"
}
```

**404 Not Found** - Orden no existe
```json
{
  "success": false,
  "message": "Orden no encontrada"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Error al actualizar estado de la orden",
  "error": "..." // solo en development
}
```

---

### 2. PUT `/api/admin/orders/:id/status`

Endpoint alternativo (alias de PATCH). Funcionalidad idéntica.

---

## Flujo de Estados Recomendado

### Estados de Pago
```
pendiente → procesando → pagado
         ↓              ↓
      cancelado     reembolsado
         ↓
      fallido
```

### Estados de Envío
```
preparacion → empaquetado → enviado → en_transito → entregado
                                   ↓
                               devuelto
```

---

## Ejemplos de Uso

### Frontend (React)
```javascript
import { ordersAdminApi } from '@/services/ordersAdmin.api.js';

// Actualizar solo estado de pago
await ordersAdminApi.updateStatus(ordenId, {
  estado_pago: 'pagado',
});

// Actualizar ambos estados + tracking
await ordersAdminApi.updateOrderStatus(ordenId, {
  estado_pago: 'pagado',
  estado_envio: 'enviado',
  numero_seguimiento: 'CHX123456789',
  empresa_envio: 'chilexpress',
});

// Actualizar con notas internas
await ordersAdminApi.updateStatus(ordenId, {
  estado_envio: 'preparacion',
  notas_internas: 'Cliente solicitó cambio de dirección'
});
```

### Backend (Node.js/Express)
```javascript
import { ordersAdminApi } from './services/ordersAdmin.api.js';

// Controlador personalizado
app.patch('/admin/orders/:id/quick-ship', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { tracking_number, courier } = req.body;
  
  try {
    const result = await ordersAdminApi.updateOrderStatus(id, {
      estado_pago: 'pagado',
      estado_envio: 'enviado',
      numero_seguimiento: tracking_number,
      empresa_envio: courier,
      fecha_envio: new Date().toISOString(),
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## Validaciones Implementadas

### Controller Level
✅ Al menos un campo requerido  
✅ Estados de pago válidos (6 valores)  
✅ Estados de envío válidos (6 valores)  
✅ Empresas de envío válidas (5 opciones)  
✅ Normalización automática de `empresa_envio`  
✅ Verificación de existencia de orden  
✅ Autenticación JWT requerida  
✅ Rol ADMIN requerido  

### Database Level
✅ Foreign key constraints  
✅ NOT NULL constraints en campos críticos  
✅ Timestamps automáticos (created_at, updated_at)  
✅ Trigger para actualizar `updated_at` en modificaciones  

---

## Tests de Integración

Ver archivo: `/backend/__tests__/adminOrderStatus.test.js`

### Casos Cubiertos
- ✅ 401 sin token
- ✅ 403 cliente no admin
- ✅ 400 payload vacío
- ✅ 400 estado_pago inválido
- ✅ 400 estado_envio inválido
- ✅ 200 actualizar estado_pago
- ✅ 200 actualizar estado_pago + estado_envio

### Casos Pendientes (Roadmap)
- ⏳ 400 empresa_envio inválida
- ⏳ 404 orden no existe
- ⏳ 200 actualizar con notas_internas
- ⏳ 200 actualizar tracking completo
- ⏳ Validar que se dispara email al cambiar estado

---

## Notas de Implementación

### Backend (`orderAdminController.js`)
- Validación exhaustiva de payloads
- Normalización de empresa_envio con `normalizeShippingCompany()`
- Consulta verificación de existencia antes de actualizar
- Modelo retorna row completo con `RETURNING *`
- Logging de errores con stack trace

### Frontend (`ordersAdmin.api.js`)
- Dos métodos: `updateStatus()` y `updateOrderStatus()`
- Normalización de respuestas con `normalizeAdminOrder()`
- Manejo de errores con propagación de mensajes
- Validación de parámetros requeridos antes de request

### Shared (`shipping-companies.js`)
- Constantes centralizadas para couriers
- Función `normalizeShippingCompany()` para matching flexible
- Labels listos para UI (Chilexpress, Blue Express, etc.)

---

## Referencias

- Controller: `/backend/src/controllers/orderAdminController.js`
- Model: `/backend/src/models/orderAdminModel.js`
- API Service: `/frontend/src/services/ordersAdmin.api.js`
- Tests: `/backend/__tests__/adminOrderStatus.test.js`
- Constants: `/shared/constants/shipping-companies.js`
