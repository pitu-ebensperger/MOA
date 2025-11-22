# Generación de IDs y Códigos - MOA E-commerce

## Tipos de IDs y su Generación

### 1. IDs Internos (BIGSERIAL)

**Tablas afectadas**: `usuarios`, `productos`, `ordenes`, `direcciones`, `carritos`, `categorias`, etc.

```sql
usuario_id BIGSERIAL PRIMARY KEY
producto_id BIGSERIAL PRIMARY KEY
orden_id BIGSERIAL PRIMARY KEY
```

**Generación**: PostgreSQL auto-incrementa automáticamente usando secuencias
- Comienza en 1
- Incrementa en 1 con cada INSERT
- Tipo BIGINT (hasta 9,223,372,036,854,775,807)
- **NO se expone al frontend** por seguridad

**Uso**: Referencias internas entre tablas (foreign keys)

---

### 2. IDs Públicos (nanoid)

**Tablas afectadas**: `usuarios.public_id`, `productos.public_id`

```javascript
// Backend: src/utils/nanoid.js
import { nanoid } from 'nanoid';

const publicId = nanoid(21); // "V1StGXR8_Z5jdHi6B-myT"
```

**Características**:
- 21 caracteres alfanuméricos
- URL-safe (se pueden usar en rutas)
- Probabilidad de colisión: ~1 millón de años generando 1000 IDs/hora
- **Se expone en APIs públicas** (reemplaza usuario_id en rutas)

**Uso**: 
- `GET /api/productos/:publicId`
- `GET /api/perfil/:publicId`

---

### 3. Códigos de Orden (order_code)

**Tabla**: `ordenes.order_code`

**Formato**: `MOA-YYYYMMDD-XXXX`

**Generación**:
```javascript
// Backend: src/controllers/orderController.js
function generateOrderCode() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  
  return `MOA-${year}${month}${day}-${random}`;
}

// Ejemplos:
// MOA-20250115-4729
// MOA-20250116-8341
// MOA-20250117-2056
```

**Características**:
- **Legible por humanos** (fácil de leer por teléfono/email)
- **Ordenable cronológicamente** (por la fecha)
- **4 dígitos aleatorios** evitan colisiones en el mismo día
- **Constraint UNIQUE** en base de datos garantiza unicidad
- **Máximo 10,000 órdenes/día** sin colisiones (en la práctica, mucho más por el random)

**Uso**:
- Se muestra en confirmación de orden
- Se usa en búsquedas de admin
- Se envía en emails de confirmación
- Se puede usar para tracking público

---

### 4. SKUs de Productos

**Tabla**: `productos.sku`

**Formato Manual**: Creado en seeds/admin

```javascript
// Ejemplos reales del proyecto:
'SOF-001' // Sofá Coppel
'SIL-001' // Silla Nórdica
'MES-001' // Mesa Extensible
'LAM-001' // Lámpara de Pie
```

**Formato Sugerido**: `CAT-NNN`
- `CAT`: 3 letras de categoría (SOF, SIL, MES, LAM, EST, CAM, etc.)
- `NNN`: Número secuencial de 3 dígitos

**Características**:
- **UNIQUE constraint** en base de datos
- **Creado manualmente** por admin al agregar producto
- Se puede usar para búsqueda rápida
- Se muestra en factura/orden

---

### 5. Slugs (URLs amigables)

**Tablas**: `productos.slug`, `categorias.slug`

**Generación**:
```javascript
// Backend: src/utils/slugify.js
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Espacios → guiones
    .replace(/[^\w\-]+/g, '')   // Remover caracteres especiales
    .replace(/\-\-+/g, '-')     // Múltiples guiones → uno
    .replace(/^-+/, '')         // Remover guiones del inicio
    .replace(/-+$/, '');        // Remover guiones del final
}

// Ejemplos:
slugify("Sofá Coppel") // "sofa-coppel"
slugify("Mesa Extensible Roble") // "mesa-extensible-roble"
slugify("Sillas & Sillones") // "sillas-sillones"
```

**Uso**:
- `GET /api/productos/slug/:slug`
- `GET /categorias/:slug`
- URLs amigables: `/productos/sofa-coppel`

---

### 6. Tokens (password_reset_tokens)

**Tabla**: `password_reset_tokens.token`

**Generación**:
```javascript
// Backend: src/controllers/authController.js
import crypto from 'crypto';

const resetToken = crypto.randomBytes(32).toString('hex');
// "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"
```

**Características**:
- 64 caracteres hexadecimales
- Criptográficamente seguro (crypto.randomBytes)
- **Única vez** (usado_en se marca después del primer uso)
- **Expira en 1 hora** (expira_en)
- **UNIQUE constraint** en base de datos

**Flujo**:
1. Usuario solicita reset → token generado y guardado en BD
2. Email enviado con link: `https://moa.cl/reset-password?token=XXXX`
3. Usuario hace clic → backend valida token (existe, no usado, no expirado)
4. Usuario cambia contraseña → token marcado como `usado_en = NOW()`

---

## Estado del Carrito (Lifecycle)

**Tabla**: `carritos.status`

**Valores posibles**: `'ABIERTO'` (único valor usado actualmente)

**Ciclo de vida**:

```
1. Usuario agrega primer producto
   └─> Se crea carrito con status='ABIERTO'
   
2. Usuario agrega/elimina productos
   └─> El mismo carrito se actualiza (updated_at)
   
3. Usuario completa la compra
   └─> El carrito se ELIMINA (ON DELETE CASCADE)
   └─> Orden se crea con los items del carrito
   
4. Usuario abandona el carrito por 30 días
   └─> Cron job elimina carritos antiguos
   └─> Query: DELETE FROM carritos WHERE updated_at < NOW() - INTERVAL '30 days'
```

**Reglas**:
- **1 carrito por usuario** (UNIQUE constraint en usuario_id)
- **No hay estado "COMPLETADO"** - se elimina después de orden exitosa
- **Carrito_items se eliminan automáticamente** (ON DELETE CASCADE)
- **No se guardan carritos históricos** - solo el carrito activo

**Relación con órdenes**:
```javascript
// orderController.js - createOrderFromCart()
async function createOrderFromCart(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Crear orden con items del carrito
    const orden = await orderModel.createOrder(cartItems, ...);
    
    // 2. Decrementar stock de productos
    await productModel.decrementStock(cartItems);
    
    // 3. ELIMINAR el carrito
    await cartModel.deleteCart(usuario_id);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
  }
}
```

---

## Generación de Fechas en Seeds

**Timeline**: 24 meses hacia atrás desde HOY

```javascript
// Función helper para generar fechas realistas
function randomDate(startMonthsAgo, endMonthsAgo) {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(now.getMonth() - startMonthsAgo);
  
  const end = new Date(now);
  end.setMonth(now.getMonth() - endMonthsAgo);
  
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Ejemplos de uso:
const userCreatedDate = randomDate(24, 0);  // Usuario registrado hace 0-24 meses
const orderDate = randomDate(12, 0);        // Orden hecha hace 0-12 meses
const oldOrderDate = randomDate(24, 12);    // Orden antigua (12-24 meses atrás)
```

**Distribución sugerida**:
- **Usuarios**: 0-24 meses (spread uniforme)
- **Órdenes recientes**: 0-6 meses (70% de órdenes)
- **Órdenes antiguas**: 6-24 meses (30% de órdenes)
- **Carritos**: Solo últimos 30 días
- **Wishlists**: 0-12 meses

---

## Resumen de Constraints

| Campo | Tipo | Constraint | Generación |
|-------|------|-----------|-----------|
| `usuario_id` | BIGSERIAL | PRIMARY KEY | PostgreSQL auto-increment |
| `public_id` | TEXT | UNIQUE | nanoid(21) |
| `order_code` | TEXT | UNIQUE | `MOA-YYYYMMDD-XXXX` |
| `sku` | TEXT | UNIQUE | Manual (admin) |
| `slug` | TEXT | UNIQUE | slugify(nombre) |
| `token` | VARCHAR(255) | UNIQUE | crypto.randomBytes(32) |
| `email` | TEXT | UNIQUE | Input del usuario |

---

## Seguridad

### ✅ Exponer en API pública:
- `public_id` (usuarios/productos)
- `order_code` (órdenes)
- `slug` (productos/categorías)

### ❌ NUNCA exponer:
- `usuario_id`, `producto_id`, `orden_id` (IDs internos)
- `password_hash`
- `token` en respuestas (solo se usa en reset URL)

### 🔒 Solo en rutas autenticadas:
- `usuario_id` del usuario logueado (JWT payload)
- Datos personales (email, teléfono, direcciones)
- Detalles de órdenes propias

---

## Implementación en Frontend

```javascript
// ✅ CORRECTO: Usar public_id
fetch(`/api/productos/${publicId}`)

// ❌ INCORRECTO: Usar ID interno
fetch(`/api/productos/${productoId}`) // Expone ID secuencial

// ✅ CORRECTO: Buscar orden por código
fetch(`/api/ordenes/codigo/${orderCode}`)

// ✅ CORRECTO: Rutas amigables
window.location.href = `/productos/${slug}`
```

---

## Migración de IDs Antiguos

Si encuentras código legacy usando IDs internos:

```javascript
// ANTES (inseguro):
GET /api/usuarios/123
GET /api/productos/456

// DESPUÉS (seguro):
GET /api/usuarios/V1StGXR8_Z5jdHi6B-myT
GET /api/productos/A2dF5gH8_K1mN4pQ-xYz9
```

**Pasos**:
1. Agregar columna `public_id` si no existe
2. Generar IDs para registros existentes: `UPDATE usuarios SET public_id = nanoid() WHERE public_id IS NULL`
3. Actualizar endpoints del backend
4. Actualizar llamadas en frontend
5. Remover endpoints antiguos después de testing
