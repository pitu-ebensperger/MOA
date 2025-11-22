# 📦 Admin Orders - Resumen Ejecutivo

## ✅ Implementación Completa

### Archivos Creados

1. **`/backend/src/models/orderAdminModel.js`** (421 líneas)
   - 7 métodos principales para gestión admin de órdenes
   - Filtros avanzados: estado, fecha, búsqueda, método de despacho
   - Paginación completa con totales
   - Estadísticas agregadas

2. **`/backend/src/controllers/orderAdminController.js`** (255 líneas)
   - 6 controladores HTTP con validaciones completas
   - Manejo de errores detallado
   - Validación de estados permitidos

3. **`/backend/routes/adminRoutes.js`** (actualizado)
   - 6 nuevas rutas protegidas con `verifyAdmin`
   - Reemplaza stubs 501 con implementación real

4. **`/docs/misDOCS/ADMIN_ORDERS.md`** (570+ líneas)
   - Documentación completa de todos los endpoints
   - Diagramas de flujo de estados
   - Ejemplos cURL para testing
   - Guía de integración frontend

5. **`/frontend/src/services/ordersAdmin.api.js`** (nuevo módulo core)
   - Normaliza respuestas `snake_case` ↔ `camelCase`
   - Expone `getAll`, `getById`, `updateOrderStatus`, `addTracking`, `getStats`, `exportOrders`
   - Reutilizado por hooks (`useAdminOrders`, `useAdminOrderStats`), drawers y `orders.api.js` (compatibilidad legacy)

---

## 🚀 Endpoints Implementados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/admin/pedidos` | Listar órdenes con filtros |
| GET | `/admin/pedidos/stats` | Estadísticas agregadas |
| GET | `/admin/pedidos/:id` | Detalle completo de orden |
| GET | `/admin/pedidos/export` | Exportar CSV con filtros y BOM UTF-8 |
| PATCH | `/admin/pedidos/:id/estado` | Actualizar estados |
| POST | `/admin/pedidos/:id/seguimiento` | Agregar tracking |
| PATCH | `/admin/pedidos/:id/notas` | Actualizar notas internas |
| PUT | `/api/admin/orders/:id/status` | Alias compatible (OrdersDrawer / hooks antiguos) |

---

## 🔑 Funcionalidades Clave

### 1. **Listado Avanzado**
- Paginación (limit/offset)
- Filtros múltiples: estado_pago, estado_envio, metodo_despacho, fechas
- Búsqueda por order_code, email, nombre
- Ordenamiento personalizado (ASC/DESC)
- Respuesta incluye: totales, datos de usuario, ubicación, items

### 2. **Gestión de Estados**
**Estados de Pago:**
- pendiente → procesando → pagado
- Alternativas: fallido, cancelado, reembolsado

**Estados de Envío:**
- preparacion → empaquetado → enviado → en_transito → entregado
- Alternativa: devuelto

### 3. **Tracking de Envíos**
- Número de seguimiento
- Empresa de envío (Chilexpress, Starken, etc.)
- Fecha de envío
- Actualización automática de estado

### 4. **Estadísticas**
- Total de órdenes por estado
- Ventas totales y confirmadas (en centavos)
- Ticket promedio
- Filtros por rango de fechas

### 5. **Notas Internas**
- Campo exclusivo para administradores
- No visible para clientes
- Útil para seguimiento interno y comunicación entre admins

---

## 📊 Modelo de Datos

### Tabla `ordenes` (campos principales)

```sql
-- Identificación
orden_id BIGSERIAL PRIMARY KEY
order_code TEXT UNIQUE (formato: MOA-YYYYMMDD-XXXX)
usuario_id BIGINT

-- Estados
estado_pago TEXT CHECK (pendiente, procesando, pagado, fallido, reembolsado, cancelado)
estado_envio TEXT CHECK (preparacion, empaquetado, enviado, en_transito, entregado, devuelto)

-- Montos (en centavos)
total_cents INT
subtotal_cents INT
envio_cents INT
descuento_cents INT
impuestos_cents INT

-- Envío
metodo_despacho TEXT CHECK (standard, express, retiro)
numero_seguimiento TEXT
empresa_envio TEXT
fecha_envio TIMESTAMPTZ
fecha_entrega_real TIMESTAMPTZ

-- Pago
transaccion_id TEXT
fecha_pago TIMESTAMPTZ
metodo_pago_usado TEXT

-- Notas
notas_cliente TEXT
notas_internas TEXT (solo admin)

-- Referencias
direccion_id BIGINT
metodo_pago_id BIGINT
```

---

## 🧪 Testing Rápido

### 1. Login como Admin
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@moa.cl", "password": "admin123"}'

# Guardar token
export TOKEN="<tu_token_jwt>"
```

### 2. Listar Órdenes
```bash
curl -X GET "http://localhost:3000/admin/pedidos?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Ver Detalle
```bash
curl -X GET "http://localhost:3000/admin/pedidos/1" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Actualizar Estado
```bash
curl -X PATCH "http://localhost:3000/admin/pedidos/1/estado" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado_envio": "enviado"}'
```

### 5. Agregar Tracking
```bash
curl -X POST "http://localhost:3000/admin/pedidos/1/seguimiento" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numero_seguimiento": "CHX123456789",
    "empresa_envio": "Chilexpress"
  }'
```

---

## 🔐 Seguridad

### Middleware Chain
```javascript
router.get("/admin/pedidos", verifyAdmin, asyncHandler(orderAdminController.getAllOrders));
```

### Validaciones Implementadas
- ✅ JWT válido requerido
- ✅ `role_code = 'admin'` en JWT
- ✅ Validación de estados permitidos
- ✅ Verificación de existencia de orden
- ✅ Sanitización de inputs
- ✅ Manejo de errores SQL

---

## 📱 Integración Frontend

### Service API
```javascript
// /frontend/src/services/ordersAdmin.api.js
export const ordersAdminApi = {
  getAll: (params) => apiClient.get('/admin/pedidos', { params }),
  getById: (id) => apiClient.get(`/admin/pedidos/${id}`),
  updateOrderStatus: (id, data) => apiClient.put(`/api/admin/orders/${id}/status`, data),
  updateStatus: (id, data) => apiClient.patch(`/admin/pedidos/${id}/estado`, data),
  addTracking: (id, data) => apiClient.post(`/admin/pedidos/${id}/seguimiento`, data),
  getStats: (params) => apiClient.get('/admin/pedidos/stats', { params }),
  exportOrders: (params, format = 'csv') =>
    apiClient.get('/admin/pedidos/export', { params: { ...params, format }, responseType: 'blob' }),
};
```

`frontend/src/services/orders.api.js` ahora re-exporta este cliente para mantener compatibilidad con hooks/UX legacy.

### Ejemplo de Uso en React
```jsx
const [orders, setOrders] = useState([]);

useEffect(() => {
  async function fetchOrders() {
    const response = await ordersAdminApi.getAll({
      estado_pago: 'pagado',
      limit: 20,
    });
    setOrders(response.data.data);
  }
  fetchOrders();
}, []);
```

---

## 📈 Próximos Pasos Sugeridos

### Corto Plazo
- [ ] Testing manual con órdenes reales
- [ ] Implementar filtros UI completos en AdminOrdersPageV2 (chips, búsqueda avanzada)
- [ ] Extender exportación a XLSX/JSON o limitar UI a CSV para evitar descargas inconsistentes

### Mediano Plazo
- [ ] Historial/auditoría de cambios
- [ ] Notificaciones automáticas al cliente
- [ ] Integración con APIs de couriers (tracking automático)
- [ ] Bulk actions (actualizar múltiples órdenes)
- [ ] Documentar payload aceptado por `ordersAdminApi.updateOrderStatus` para mantener front/back sincronizados

### Largo Plazo
- [ ] Dashboard de métricas en tiempo real
- [ ] Reportes de ventas por período
- [ ] Integración con sistema de inventario
- [ ] Webhooks para eventos de orden

---

## 🎯 Estado del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| Model | ✅ Completo | 7 métodos, filtros avanzados |
| Controller | ✅ Completo | 6 endpoints, validaciones |
| Routes | ✅ Completo | Protegidas con verifyAdmin |
| Documentación | ✅ Completo | 570+ líneas, ejemplos cURL |
| Testing Manual | ⏳ Pendiente | Requiere BD con datos |
| Frontend | ✅ Integrado | `ordersAdminApi`, Drawer, CustomersPage y hooks sincronizados |

---

## 🔗 Archivos Relacionados

- **Documentación completa:** `/docs/misDOCS/ADMIN_ORDERS.md`
- **Model:** `/backend/src/models/orderAdminModel.js`
- **Controller:** `/backend/src/controllers/orderAdminController.js`
- **Routes:** `/backend/routes/adminRoutes.js`
- **DDL consolidada:** `/backend/database/schema/DDL.sql`
- **Middleware:** `/backend/src/middleware/verifyAdmin.js`
- **Constantes couriers:** `/shared/constants/shipping-companies.js`
- **Cliente Frontend:** `/frontend/src/services/ordersAdmin.api.js`
- **Compatibilidad legacy:** `/frontend/src/services/orders.api.js`

---

**Implementado:** 17 de noviembre de 2024  
**Versión:** 1.0.0  
**Stack:** Node.js + Express + PostgreSQL
