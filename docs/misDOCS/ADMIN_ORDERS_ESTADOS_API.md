# API Estados de Órdenes (Admin)

Fecha: 21-11-2025
Última revisión: ampliación luego de seed masivo.

## Endpoints

1. PATCH `/admin/pedidos/:id/estado`
2. PUT `/api/admin/orders/:id/status`

Ambos actualizan campos de la tabla `ordenes`. El segundo es un alias más REST completo. Internamente ambos usan `orderAdminController.updateOrderStatus`.

## Autenticación y permisos

- Requiere header `Authorization: Bearer <JWT>`.
- El JWT debe contener `role_code: 'ADMIN'` / `rol_code: 'ADMIN'`.
- Si falta token: 401 (tokenMiddleware).
- Si no es admin: 403 (verifyAdmin).

## Payload permitido

Se puede enviar uno o más de los siguientes campos. Al menos uno debe existir, sino 400.

| Campo               | Tipo        | Notas |
|---------------------|------------|-------|
| `estado_pago`       | string      | Validación estricta (ver lista). |
| `estado_envio`      | string      | Validación estricta (ver lista). |
| `notas_internas`    | string      | Texto libre, puede ser null. |
| `fecha_pago`        | ISO8601     | Marca momento pago efectivo. |
| `fecha_envio`       | ISO8601     | Fecha despacho/cuando salió. |
| `fecha_entrega_real`| ISO8601     | Fecha de entrega confirmada. |
| `numero_seguimiento`| string      | Código courier, puede combinar letras/números. |
| `empresa_envio`     | string      | Normalizada a catálogo interno (Chilexpress, Starken, Blue Express). |

### Valores permitidos

`estado_pago`:
```
pendiente | procesando | pagado | fallido | reembolsado | cancelado
```

`estado_envio`:
```
preparacion | empaquetado | enviado | en_transito | entregado | devuelto
```

### Reglas adicionales
- Si se actualiza tracking (`numero_seguimiento` / `empresa_envio`), `estado_envio` pasa a `enviado` automáticamente en `addTrackingInfo` (POST `/admin/pedidos/:id/seguimiento`). No aplica a PATCH principal salvo envío manual de campos.
- El controlador no recalcula valores monetarios; sólo actualiza columnas señaladas.
- No existe cascade sobre items; cambiar estado no afecta `orden_items`.

## Ejemplos

### 1. Actualizar estado de pago y envío
```http
PATCH /admin/pedidos/42/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado_pago": "pagado",
  "estado_envio": "preparacion"
}
```
Respuesta 200:
```json
{
  "success": true,
  "message": "Estado de orden actualizado exitosamente",
  "data": { "orden_id": 42, "estado_pago": "pagado", "estado_envio": "preparacion", ... }
}
```

### 2. Agregar tracking y marcar envío
```http
POST /admin/pedidos/42/seguimiento
Authorization: Bearer <token>
Content-Type: application/json

{
  "numero_seguimiento": "TRACK123456",
  "empresa_envio": "Chilexpress"
}
```
Respuesta 200 incluye `estado_envio: "enviado"`.

### 3. Error por valores inválidos
```http
PATCH /admin/pedidos/42/estado
Authorization: Bearer <token>
Content-Type: application/json

{ "estado_pago": "xxx" }
```
Respuesta 400:
```json
{
  "success": false,
  "message": "Estado de pago inválido. Valores permitidos: pendiente, procesando, pagado, fallido, reembolsado, cancelado"
}
```

### 4. Sin campos
```http
PATCH /admin/pedidos/42/estado
Authorization: Bearer <token>
Content-Type: application/json

{}
```
400:
```json
{ "success": false, "message": "Debe proporcionar al menos un campo para actualizar" }
```

## Status mapping UI
La UI usa un mapeo simplificado (`pending`,`processing`,`shipped`,`fulfilled`,`cancelled`). Conversión en `orders.api.js` y `ordersAdmin.api.js`:
- `estado_envio='entregado'` => `fulfilled/delivered`.
- `estado_envio='enviado'` => `shipped`.
- `estado_pago='pendiente'` => `pending`.
- `estado_pago='procesando'` o `estado_envio='preparacion'` => `processing`.
- `estado_pago='cancelado'` o `estado_envio='devuelto'` => `cancelled`.

## Tests de integración (plan)
Casos cubiertos en `adminOrderStatus.test.js`:
1. 401 sin token.
2. 403 con token cliente (no admin).
3. 400 payload vacío.
4. 400 estado_pago inválido.
5. 400 estado_envio inválido.
6. 200 actualización simple estado_pago.
7. 200 actualización combinada estado_pago + estado_envio.

Se crea orden de prueba inserción directa para aislar cada caso y no depender de seed global.

## Consideraciones futuras
- Añadir transición automática a `entregado` cuando `fecha_entrega_real` se setea.
- Validar coherencia (no permitir `estado_envio='devuelto'` si `estado_pago!='reembolsado'`).
- Emitir eventos internos (webhook o email) en ciertos cambios.
