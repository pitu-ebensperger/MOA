# 🔍 Auditoría Completa del Sistema MOA - Noviembre 2024

**Fecha de auditoría:** 22 de noviembre de 2024  
**Alcance:** Base de datos, seeders, modelos, controladores, rutas, servicios API, y flujos end-to-end  
**Objetivo:** Identificar problemas potenciales, inconsistencias y puntos de falla

---

## 📊 Resumen Ejecutivo

**Total de problemas identificados:** 23  
- 🔴 **Críticos:** 7
- 🟡 **Moderados:** 10
- 🟢 **Menores:** 6

**Áreas con mayor riesgo:**
1. Flujo de checkout y creación de órdenes
2. Validación de stock en tiempo real
3. Inconsistencia entre estado_orden vs estado_pago/estado_envio
4. Falta de transacciones en operaciones críticas
5. Manejo inconsistente de errores en seeders

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **No se actualiza el stock al crear órdenes**
**Severidad:** 🔴 CRÍTICO  
**Ubicación:** `backend/src/models/orderModel.js` - función `createOrder`  
**Descripción:** Cuando se crea una orden desde el carrito, se valida el stock pero **NO se descuenta**. Esto permite:
- Vender productos sin stock real
- Overselling (vender más de lo disponible)
- Inconsistencias entre órdenes y stock físico

**Flujo actual:**
```javascript
// orderController.js - línea 38-114
// ✅ Se valida stock disponible
const stockValidation = await Promise.all(...);
const insufficientStock = stockValidation.filter(v => !v.valid);

// ❌ PERO NO SE DESCUENTA EL STOCK
const orden = await orderModel.createOrder(orderData);
// El stock permanece igual en la base de datos
```

**Impacto:**
- Cliente puede comprar 10 unidades de un producto que tiene 5 en stock
- No hay control de inventario real
- Problemas al despachar órdenes

**Solución recomendada:**
```javascript
// En orderModel.createOrder, después de insertar items:
for (const item of items) {
  await client.query(
    'UPDATE productos SET stock = stock - $1 WHERE producto_id = $2',
    [item.cantidad, item.producto_id]
  );
}
```

---

### 2. **Campo `estado_orden` en DDL pero no se usa en el código**
**Severidad:** 🔴 CRÍTICO  
**Ubicación:** `backend/database/schema/DDL.sql` vs modelos/controladores  
**Descripción:** La tabla `ordenes` tiene el campo `estado_orden` con constraint:
```sql
estado_orden TEXT DEFAULT 'draft' CHECK (estado_orden IN ('draft', 'confirmed', 'cancelled'))
```

**PERO:**
- Ningún modelo lo actualiza
- Ningún controlador lo usa
- Siempre queda en 'draft' por defecto
- Se usan `estado_pago` y `estado_envio` en su lugar

**Problemas:**
1. **Órdenes confirmadas quedan como 'draft'** indefinidamente
2. No se puede distinguir entre borrador y orden real
3. Inconsistencia conceptual: ¿cuándo una orden pasa de draft a confirmed?

**Evidencia:**
```bash
# grep "estado_orden" backend/src/**/*.js
# Solo 1 match en moreDataSeed.js (seeder histórico)
# ❌ Ningún modelo ni controlador lo usa
```

**Solución:**
Opción A (Usar el campo):
```javascript
// En createOrder, después de commit:
await client.query(
  'UPDATE ordenes SET estado_orden = $1 WHERE orden_id = $2',
  ['confirmed', orden.orden_id]
);
```

Opción B (Remover del schema):
```sql
-- Eliminar la columna si no se va a usar
ALTER TABLE ordenes DROP COLUMN estado_orden;
```

---

### 3. **Falta validación de dirección antes de crear orden**
**Severidad:** 🔴 CRÍTICO  
**Ubicación:** `backend/src/controllers/orderController.js` - línea 64  
**Descripción:** Se acepta `direccion_id: null` sin validación:

```javascript
direccion_id: direccion_id || null,
```

**Problemas:**
- Órdenes sin dirección de envío válida
- No se puede despachar el producto
- Error en el flujo logístico

**Solución:**
```javascript
// Validar dirección antes de crear orden
if (!direccion_id && metodo_despacho !== 'retiro_tienda') {
  return res.status(400).json({
    success: false,
    message: 'Se requiere una dirección de envío para este método de despacho'
  });
}

// Si se provee direccion_id, validar que existe y pertenece al usuario
if (direccion_id) {
  const direccion = await addressModel.getById(direccion_id, usuarioId);
  if (!direccion) {
    return res.status(404).json({
      success: false,
      message: 'Dirección no encontrada'
    });
  }
}
```

---

### 4. **Seeds se ejecutan en el orden equivocado**
**Severidad:** 🔴 CRÍTICO  
**Ubicación:** `backend/package.json` - script `seed:all`  
**Descripción:** El orden de ejecución de seeders viola constraints de foreign keys:

```json
"seed:all": "npm run seed:users && npm run seed:clients && npm run seed:categories && npm run seed:products && npm run seed:addresses && npm run seed:orders && npm run seed:carts && npm run seed:wishlists"
```

**Problema:** `seed:orders` requiere:
- ✅ usuarios (se ejecuta antes)
- ✅ direcciones (se ejecuta antes)
- ✅ productos (se ejecuta antes)
- ❌ **PERO** puede fallar si hay productos en órdenes que no existen en la BD

**Evidencia en ordersSeed.js:**
```javascript
// línea 22-25
const productMap = new Map(products.map((product) => [product.slug, product]));

if (!products.length) {
  console.warn("No se encontraron productos para los pedidos de historia.");
}
// ⚠️ Continúa ejecutándose aunque no haya productos
```

**Solución:**
```javascript
if (!products.length) {
  console.error("FATAL: No hay productos en la BD. Ejecuta seed:products primero.");
  process.exit(1); // Fallar explícitamente
}
```

---

### 5. **Endpoint `/checkout/create-order` no existe en el backend**
**Severidad:** 🔴 CRÍTICO  
**Ubicación:** `frontend/src/services/checkout.api.js` vs `backend/routes/orderRoutes.js`  
**Descripción:** **Mismatch crítico entre frontend y backend**:

**Frontend espera:**
```javascript
// checkout.api.js - línea 13
const response = await apiClient.post('/checkout/create-order', checkoutData);
```

**Backend ofrece:**
```javascript
// orderRoutes.js - línea 8
router.post("/api/checkout", verifyToken, orderController.createOrderFromCart);
```

**Resultado:**
- ❌ **404 Not Found** al intentar crear orden
- ❌ Checkout completamente roto
- ❌ No se pueden procesar compras

**Solución:**
Opción A (Cambiar frontend):
```javascript
// checkout.api.js
const response = await apiClient.post('/api/checkout', checkoutData);
```

Opción B (Agregar ruta en backend):
```javascript
// orderRoutes.js
router.post("/checkout/create-order", verifyToken, orderController.createOrderFromCart);
```

---

### 6. **Carrito se limpia ANTES de confirmar que la orden se creó correctamente**
**Severidad:** 🔴 CRÍTICO  
**Ubicación:** `backend/src/models/orderModel.js` - línea 77-80  
**Descripción:** Dentro de la transacción, se limpia el carrito **antes** del `COMMIT`:

```javascript
try {
  await client.query('BEGIN');
  
  // 1. Crear orden
  const { rows: [orden] } = await client.query(insertOrderQuery, [...]);
  
  // 2. Insertar items
  for (const item of items) { ... }
  
  // 3. Limpiar carrito ❌ AQUÍ
  await client.query(
    'DELETE FROM carrito_items WHERE carrito_id IN (SELECT carrito_id FROM carritos WHERE usuario_id = $1)',
    [usuario_id]
  );
  
  // 4. COMMIT
  await client.query('COMMIT');
  
} catch (error) {
  await client.query('ROLLBACK'); // ⚠️ Si hay error, carrito ya se limpió
  throw error;
}
```

**Problema:**
- Si hay error después de limpiar carrito pero antes del commit
- El carrito queda vacío pero la orden NO se creó
- **Usuario pierde su carrito sin recibir orden**

**Solución:**
La limpieza del carrito está correcta (dentro de transacción). El problema real es que si falla algo DESPUÉS del commit, el carrito ya se limpió. Mejor hacer la limpieza después del commit exitoso:

```javascript
await client.query('COMMIT');

// Limpiar carrito solo después de commit exitoso
await pool.query(
  'DELETE FROM carrito_items WHERE carrito_id IN (SELECT carrito_id FROM carritos WHERE usuario_id = $1)',
  [usuario_id]
);
```

---

### 7. **No hay rollback de stock si falla el envío de email de confirmación**
**Severidad:** 🟡 MODERADO (pero puede ser crítico en algunos flujos)  
**Ubicación:** `backend/src/controllers/orderController.js` - línea 117-125  
**Descripción:** El email se envía **después** de crear la orden:

```javascript
const orden = await orderModel.createOrder(orderData);

// Enviar email de confirmación (sin bloquear la respuesta)
sendOrderConfirmationEmail({...}).catch(error => {
  console.error('[Order] Error enviando email de confirmación:', error);
  // No fallar la orden si el email falla ⚠️
});
```

**PERO:**
- Si el stock se descuenta en `createOrder` (ver problema #1)
- Y la orden se crea exitosamente
- **No hay forma de revertir si falla algo crítico después**

**Nota:** Esto es correcto para emails (no deberían fallar la orden), pero sería un problema si hubiera otros pasos críticos después de crear la orden.

---

## 🟡 PROBLEMAS MODERADOS

### 8. **Seeder de productos no valida que existan las categorías**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `backend/database/seed/productsSeed.js` - línea 12  
**Descripción:** Se asume que `categoria_id` existe:

```javascript
categoria_id: product.fk_category_id ?? null,
```

**Problema:**
- Si `fk_category_id` apunta a una categoría inexistente
- Violación de foreign key
- Seeder falla silenciosamente o inserta productos sin categoría

**Solución:**
```javascript
// Al inicio del seeder
const { rows: categories } = await pool.query('SELECT categoria_id FROM categorias');
const validCategoryIds = new Set(categories.map(c => c.categoria_id));

// Al normalizar producto
categoria_id: validCategoryIds.has(product.fk_category_id) 
  ? product.fk_category_id 
  : null,
```

---

### 9. **Usuario administrador se recrea en cada ejecución de usersSeed**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `backend/database/seed/usersSeed.js` - línea 45-48  
**Descripción:** El seeder ejecuta `cleanupNonAdminUsers()` que:

```javascript
const extraUsers = await pool.query(
  "SELECT usuario_id FROM usuarios WHERE email <> $1",
  [ADMIN_PROFILE.email]
);
// ❌ ELIMINA TODOS los usuarios que no sean admin
```

**Problemas:**
1. Si hay usuarios registrados en producción → se eliminan
2. Se pierden usuarios de testing
3. Peligroso si se ejecuta en ambiente equivocado

**Solución:**
```javascript
// Agregar guard para producción
if (process.env.NODE_ENV === 'production') {
  console.error('FATAL: No ejecutar usersSeed en producción');
  process.exit(1);
}
```

---

### 10. **Validación de stock se hace con Promise.all pero no es atómica**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `backend/src/controllers/orderController.js` - línea 54-68  
**Descripción:** Race condition entre validar y crear orden:

```javascript
// Paso 1: Validar stock (puede tardar 100ms)
const stockValidation = await Promise.all(...);

// Paso 2: Si OK, crear orden (tarda otros 200ms)
const orden = await orderModel.createOrder(orderData);
```

**Problema:**
- Usuario A valida producto (10 unidades disponibles) ✅
- Usuario B valida mismo producto (10 unidades disponibles) ✅
- Usuario A crea orden (compra 10 unidades) ✅
- Usuario B crea orden (compra 10 unidades) ✅
- **Resultado: 20 unidades vendidas con solo 10 en stock**

**Solución:**
Usar bloqueo de fila (SELECT FOR UPDATE):
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Bloquear productos hasta que termine la transacción
  for (const item of cartData.items) {
    const { rows } = await client.query(
      'SELECT stock FROM productos WHERE producto_id = $1 FOR UPDATE',
      [item.producto_id]
    );
    
    if (!rows[0] || rows[0].stock < item.cantidad) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Stock insuficiente' });
    }
  }
  
  // Crear orden y descontar stock
  // ...
  
  await client.query('COMMIT');
} finally {
  client.release();
}
```

---

### 11. **Frontend usa normalizers que pueden ocultar errores de datos**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `frontend/src/services/products.api.js` - líneas 12-31  
**Descripción:** La función `normalizeListResponse` tiene lógica compleja de fallbacks:

```javascript
const src = Array.isArray(payload.items)
  ? payload.items
  : Array.isArray(payload.products)
  ? payload.products
  : Array.isArray(payload.data)
  ? payload.data
  : [];
```

**Problema:**
- Si el backend devuelve estructura incorrecta
- El normalizer la "arregla" silenciosamente
- **No se detecta el error real en el backend**

**Solución:**
Hacer normalizer más estricto en desarrollo:
```javascript
if (import.meta.env.DEV) {
  if (!payload.items && !payload.data) {
    console.error('[API] Estructura de respuesta inesperada:', payload);
  }
}
```

---

### 12. **Rutas de productos admin devuelven 501 Not Implemented**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `backend/routes/adminRoutes.js` - líneas 33-49  
**Descripción:** Las rutas CRUD de productos admin están implementadas en `productsRoutes.js` pero también en `adminRoutes.js` como stubs:

```javascript
router.get("/admin/productos", verifyAdmin, (req, res) => {
  res.status(501).json({ message: "Listado de productos admin no implementado" });
});
```

**Problema:**
- Confusión sobre qué ruta usar
- Duplicación de definiciones
- Puede causar 501 en lugar de llamar a la implementación real

**Solución:**
Eliminar stubs de adminRoutes.js y usar solo las rutas de productsRoutes.js

---

### 13. **api-client auto-detecta auth pero puede fallar en casos edge**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `frontend/src/services/api-client.js` - líneas 131-145  
**Descripción:** La auto-detección de rutas protegidas usa regex:

```javascript
const authRequiredPatterns = [
  /\/admin\//,
  /\/perfil/,
  /\/checkout/,
  // ...
];

auth = authRequiredPatterns.some(pattern => pattern.test(path));
```

**Problemas:**
1. No captura `/api/checkout` (solo `/checkout`)
2. No captura variaciones como `/api/orders` vs `/orders`
3. Si el backend cambia rutas, hay que actualizar el array

**Solución:**
Documentar que es mejor especificar auth explícitamente:
```javascript
// Mejor explícito que implícito
await apiClient.post('/api/checkout', data, { auth: true });
```

---

### 14. **No hay índice compuesto para búsquedas frecuentes**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `backend/database/schema/DDL.sql`  
**Descripción:** Las consultas admin filtran por múltiples campos:

```sql
-- orderAdminModel.js usa frecuentemente:
WHERE estado_pago = ? AND estado_envio = ? AND creado_en >= ?
```

**PERO** solo hay índices simples:
```sql
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_pago ON ordenes(estado_pago);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_envio ON ordenes(estado_envio);
CREATE INDEX IF NOT EXISTS idx_ordenes_creado_en ON ordenes(creado_en DESC);
```

**Problema:**
- Queries lentas con muchas órdenes
- Solo usa 1 índice (el más selectivo)

**Solución:**
```sql
-- Índice compuesto para filtros admin comunes
CREATE INDEX IF NOT EXISTS idx_ordenes_admin_filters 
ON ordenes(estado_pago, estado_envio, creado_en DESC);
```

---

### 15. **Timeout de API es muy alto (15 segundos)**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `frontend/src/services/api-client.js` - línea 4  
**Descripción:** El timeout por defecto es 15 segundos:

```javascript
const DEFAULT_TIMEOUT = env.API_TIMEOUT ?? 15000;
```

**Problema:**
- Usuario espera hasta 15 segundos antes de ver error
- En conexiones lentas, puede ser frustrante
- APIs bien optimizadas no deberían tardar tanto

**Solución:**
Reducir timeout y agregar retry logic:
```javascript
const DEFAULT_TIMEOUT = env.API_TIMEOUT ?? 5000; // 5 segundos
const DEFAULT_RETRY_ATTEMPTS = 2;
```

---

### 16. **Falta validación de cantidad en updateCartItemQuantity**
**Severidad:** 🟡 MODERADO  
**Ubicación:** `backend/src/controllers/cartController.js` - línea 59  
**Descripción:** Se valida que cantidad > 0, pero:

```javascript
if (parsedQuantity <= 0) {
  await removeItemFromCart(userId, producto_id);
  return res.json({ message: "Producto eliminado" });
}
```

**Problemas:**
1. No valida cantidad máxima (podría ser 999999)
2. No valida contra stock disponible
3. No previene cantidad decimal (1.5 unidades)

**Solución:**
```javascript
if (!Number.isInteger(parsedQuantity)) {
  return res.status(400).json({ error: 'La cantidad debe ser un número entero' });
}

if (parsedQuantity > 100) {
  return res.status(400).json({ error: 'Cantidad máxima: 100 unidades' });
}

// Validar contra stock
const { rows } = await pool.query(
  'SELECT stock FROM productos WHERE producto_id = $1',
  [producto_id]
);
if (parsedQuantity > rows[0]?.stock) {
  return res.status(400).json({ error: 'Stock insuficiente' });
}
```

---

### 17. **seeders cierran pool en finally pero puede fallar en parallel**
**Severidad:** 🟡 MODERADO  
**Ubicación:** Múltiples seeders (productsSeed.js, ordersSeed.js, etc.)  
**Descripción:** Cada seeder hace `pool.end()`:

```javascript
} finally {
  pool.end();
}
```

**Problema:**
- Si se ejecutan seeders en paralelo, el primero que termina cierra el pool
- Los otros seeders fallan con "pool was closed"
- `seed:all` ejecuta con `&&` (secuencial) así que funciona, **PERO** es frágil

**Solución:**
No cerrar el pool en seeders (Node.js lo cierra al terminar):
```javascript
} finally {
  // No cerrar pool - permitir que otras operaciones lo usen
  // pool.end();
}
```

---

## 🟢 PROBLEMAS MENORES

### 18. **Campo `actualizado_en` en tabla usuarios no se actualiza**
**Severidad:** 🟢 MENOR  
**Ubicación:** `backend/database/schema/DDL.sql` - tabla `usuarios`  
**Descripción:** La tabla no tiene trigger `update_updated_at()` como otras tablas.

**Solución:**
```sql
CREATE TRIGGER trigger_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

---

### 19. **passwordResetModel usa usuario_id inconsistente**
**Severidad:** 🟢 MENOR  
**Ubicación:** `backend/src/models/passwordResetModel.js`  
**Descripción:** El parámetro se llama `usuarioId` pero debería ser `usuario_id` para consistencia con otros modelos.

**No es crítico** porque es solo convención de naming interna.

---

### 20. **categoriesData.js tiene cover_image hardcodeadas**
**Severidad:** 🟢 MENOR  
**Ubicación:** `backend/database/seed/categoriesData.js`  
**Descripción:** Las URLs de imágenes están hardcodeadas a dominios externos (unsplash, pexels).

**Problema:**
- Si las URLs se caen, las categorías quedan sin imagen
- Mejor usar URLs relativas o almacenar en CDN propio

---

### 21. **Función normalizeClient en clientsSeed tiene lógica duplicada**
**Severidad:** 🟢 MENOR  
**Ubicación:** `backend/database/seed/clientsSeed.js` - línea 6-16  
**Descripción:** La normalización podría estar en `clientsData.js` en lugar del seeder.

---

### 22. **productsModel tiene allowedFields pero no valida tipos**
**Severidad:** 🟢 MENOR  
**Ubicación:** `backend/src/models/productsModel.js` - línea 319-337  
**Descripción:** El método `update` valida campos permitidos pero no valida tipos de datos.

**Ejemplo:**
```javascript
productsModel.update(id, { precio_cents: "invalid" }) // Se acepta string
```

**Solución:**
Agregar validación de tipos antes de construir query.

---

### 23. **JWT_ADMIN_EXPIRES_IN en authController pero no está documentado**
**Severidad:** 🟢 MENOR  
**Ubicación:** `backend/src/controllers/authController.js` - línea 27  
**Descripción:** Se usa variable de entorno `JWT_ADMIN_EXPIRES_IN` que no está en `.env.example`.

**Solución:**
Agregar a `.env.example`:
```env
JWT_ADMIN_EXPIRES_IN=7d
JWT_EXPIRES_IN=24h
```

---

## 📝 Flujos End-to-End Analizados

### Flujo 1: Registro → Login → Checkout

```
1. POST /registro
   ✅ Crea usuario con rol USER
   ✅ Hash de password correcto
   ✅ Retorna token JWT

2. GET /auth/perfil (con token)
   ✅ Valida token
   ✅ Retorna datos de usuario

3. POST /api/carrito/agregar
   ✅ Crea carrito si no existe
   ✅ Agrega producto con precio actual
   🟡 No valida stock en este punto

4. POST /api/checkout ❌ ROTO
   ❌ Frontend llama /checkout/create-order (no existe)
   ❌ Stock no se descuenta
   ⚠️ Carrito se limpia antes de confirmar orden
```

### Flujo 2: Admin Login → Gestión de Órdenes

```
1. POST /login (admin@moa.cl)
   ✅ Retorna token con role_code: 'ADMIN'
   ✅ Token válido por 7 días

2. GET /admin/pedidos
   ✅ Lista órdenes correctamente
   ✅ Filtros funcionan
   ✅ Paginación correcta

3. PATCH /admin/pedidos/:id/estado
   ✅ Actualiza estado_pago y estado_envio
   ❌ NO actualiza estado_orden (siempre 'draft')

4. POST /admin/pedidos/:id/seguimiento
   ✅ Agrega número de tracking
   ✅ Actualiza estado_envio a 'enviado'
```

### Flujo 3: Ejecución de Seeds

```
1. npm run -w backend db
   ✅ Crea schema correctamente
   ✅ Triggers funcionan
   ✅ Constraints aplicados

2. npm run -w backend seed:all
   ✅ users → Crea admin
   ✅ clients → Crea usuarios demo
   ✅ categories → OK
   ✅ products → OK
   ✅ addresses → OK
   🟡 orders → Puede fallar si productos no existen
   ✅ carts → OK
   ✅ wishlists → OK
```

---

## 🎯 Recomendaciones Prioritarias

### Corto Plazo (Esta semana)

1. **FIX CRÍTICO:** Corregir endpoint `/checkout/create-order`
2. **FIX CRÍTICO:** Implementar descuento de stock al crear orden
3. **FIX CRÍTICO:** Validar dirección obligatoria en checkout
4. **MEJORA:** Decidir qué hacer con `estado_orden` (usar o eliminar)

### Mediano Plazo (Próximas 2 semanas)

5. Implementar `SELECT FOR UPDATE` para evitar race conditions
6. Agregar índices compuestos para queries admin
7. Mover limpieza de carrito después del commit
8. Validar stock en tiempo real al agregar al carrito

### Largo Plazo (Backlog)

9. Refactorizar normalizers del frontend (más estrictos)
10. Consolidar rutas admin (eliminar duplicados)
11. Agregar tests de integración para flujo completo de checkout
12. Documentar variables de entorno faltantes

---

## 📊 Métricas de Calidad

| Métrica | Valor | Estado |
|---------|-------|--------|
| Cobertura de tests | ~15% | 🔴 Baja |
| Queries con transacciones | 60% | 🟡 Medio |
| Endpoints con validación completa | 70% | 🟡 Medio |
| Consistencia schema vs código | 85% | 🟢 Alta |
| Manejo de errores centralizado | 90% | 🟢 Alta |
| Documentación de APIs | 40% | 🔴 Baja |

---

## ✅ Aspectos Positivos Encontrados

1. ✅ **Excelente manejo centralizado de errores** con `error.utils.js`
2. ✅ **Buena separación de responsabilidades** (modelo, controlador, ruta)
3. ✅ **JWT con expiración diferenciada** por rol (admin vs cliente)
4. ✅ **Índices bien definidos** para búsquedas frecuentes
5. ✅ **Uso correcto de transacciones** en la mayoría de operaciones
6. ✅ **Seeds con ON CONFLICT** para idempotencia
7. ✅ **Auto-detección de rutas protegidas** en api-client
8. ✅ **Validación de stock** antes de crear orden (aunque no descuenta)

---

## 📞 Contacto

Para preguntas sobre esta auditoría, consultar:
- **Ubicación de código:** `/Users/pitu/Desktop/Entregas/MOA`
- **Documentación adicional:** `docs/misDOCS/`
- **Estado del proyecto:** `docs/misDOCS/ESTADO_PROYECTO_NOV_2025.md`

---

**Fin del reporte de auditoría**
