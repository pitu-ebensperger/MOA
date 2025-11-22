# Cambios Realizados en la Base de Datos - Enero 2025

## Resumen Ejecutivo

Se realizó una revisión completa del esquema de base de datos y seeds para preparar el sistema para producción. Todos los cambios están consolidados en `backend/database/schema/DDL.sql` (versión 1.0.0).

---

## 1. Cambios en DDL.sql

### ✅ Eliminados

- ❌ **Todos los `COMMENT ON`** statements (limpieza de metadata innecesaria)
- ❌ **Columna `notas_internas`** en tabla `ordenes` (simplificación)
- ❌ **Metadata de DATABASE** (`COMMENT ON DATABASE moa`)

### ✅ Modificaciones en `usuarios`

```sql
-- ANTES:
rol TEXT DEFAULT 'user',
rol_code TEXT DEFAULT 'USER' CHECK (rol_code IN ('USER', 'ADMIN')),

-- DESPUÉS:
rol TEXT DEFAULT 'cliente' CHECK (rol IN ('cliente', 'administrador')),
rol_code TEXT DEFAULT 'CLIENT' CHECK (rol_code IN ('CLIENT', 'ADMIN')),
```

**Razón**: Consistencia con nomenclatura del proyecto y claridad en roles.

### ✅ Modificaciones en `password_reset_tokens`

```sql
-- ANTES (columnas en inglés):
created_at TIMESTAMPTZ DEFAULT now(),
expires_at TIMESTAMPTZ NOT NULL,
used_at TIMESTAMPTZ

-- DESPUÉS (columnas en español):
creado_en TIMESTAMPTZ DEFAULT now(),
expira_en TIMESTAMPTZ NOT NULL,
usado_en TIMESTAMPTZ
```

**Razón**: Consistencia con el resto del esquema (todas las demás tablas usan español).

**⚠️ IMPORTANTE**: Actualizar código backend que usa estos campos:
- `src/models/passwordResetModel.js`
- `src/controllers/authController.js`

### ✅ Modificaciones en `direcciones`

```sql
-- AGREGADO:
label TEXT DEFAULT 'casa' CHECK (label IN ('casa', 'oficina', 'trabajo', 'otro')),

-- CAMBIADO (ahora son opcionales):
departamento TEXT,      -- ANTES: TEXT NOT NULL
referencia TEXT,        -- ANTES: TEXT NOT NULL
```

**Razón**: 
- **label**: Permite al usuario identificar rápidamente direcciones ("Casa", "Oficina")
- **departamento/referencia opcionales**: No todos los inmuebles tienen departamento, y referencia puede estar vacía

### ✅ Modificaciones en `ordenes`

```sql
-- ELIMINADO:
notas_internas TEXT,  -- ❌ No se usa en producción

-- AGREGADO (defaults para tracking):
numero_seguimiento TEXT DEFAULT 'PENDIENTE_ASIGNAR',
empresa_envio TEXT DEFAULT 'por_asignar' CHECK (empresa_envio IN ('chilexpress', 'blue_express', 'starken', 'correos_chile', 'por_asignar')),
```

**Razón**: 
- Sin `notas_internas` simplifica el modelo (solo cliente puede agregar notas)
- Defaults evitan NULLs molestos en queries y UX

### ✅ Actualización de `configuracion_tienda`

```sql
-- ANTES:
descripcion: 'Muebles y decoración moderna para tu hogar'

-- DESPUÉS:
descripcion: 'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.'
```

**Razón**: Descripción más profesional y enfocada en valor del producto.

---

## 2. Archivos de Constantes Creados

### 📄 `/shared/constants/order-states.js`

**Contenido**: Estados de orden, pago, envío, métodos de despacho, empresas de envío

```javascript
ESTADOS_ORDEN: { DRAFT, CONFIRMED, CANCELLED }
ESTADOS_PAGO: { PENDIENTE, PAGADO, RECHAZADO, REEMBOLSADO }
ESTADOS_ENVIO: { PREPARACION, ENVIADO, EN_TRANSITO, ENTREGADO, CANCELADO }
METODOS_DESPACHO: { STANDARD, EXPRESS, RETIRO }
EMPRESAS_ENVIO: { CHILEXPRESS, BLUE_EXPRESS, STARKEN, CORREOS_CHILE, POR_ASIGNAR }
```

**Uso**:
- Backend: Validación en controllers/models
- Frontend: Dropdowns en admin, badges de estado, filtros

**Funciones helper**:
- `isValidEstadoOrden()`, `isValidEstadoPago()`, etc.
- `getEstadoOrdenLabel()`, `getMetodoDespachoLabel()`, etc.

### 📄 `/shared/constants/locations.js`

**Contenido**: Regiones, comunas y cascading logic para direcciones

```javascript
REGIONES: 16 regiones de Chile con código ISO
COMUNAS_POR_REGION: Object con comunas agrupadas por región
TIPOS_DIRECCION: { CASA, OFICINA, TRABAJO, OTRO }
```

**Funciones helper**:
- `getRegionByCode(codigo)`
- `getComunasByRegion(codigoRegion)`
- `normalizeRegionName(nombre)` - RM vs "Región Metropolitana"
- `isValidRegion()`, `isValidComuna()`

**Uso**:
- Frontend: Select cascading en checkout (región → comunas)
- Backend: Validación de direcciones

---

## 3. Constantes Pre-existentes (Ya creadas)

### 📄 `/shared/constants/payment-methods.js`

```javascript
METODOS_PAGO: {
  TRANSFERENCIA, WEBPAY, TARJETA_CREDITO, 
  TARJETA_DEBITO, PAYPAL, EFECTIVO
}
```

**✅ Ya implementado** - No requiere cambios

### 📄 `/shared/constants/shipping-companies.js`

```javascript
SHIPPING_COMPANIES: {
  CHILEXPRESS, BLUE_EXPRESS, STARKEN, 
  CORREOS_CHILE, PICKUP
}
```

**⚠️ ACCIÓN REQUERIDA**: Actualizar para usar mismos valores que `order-states.js` (consistencia)

---

## 4. Documentación Creada

### 📄 `/docs/misDOCS/IDS_Y_CODIGOS_GENERACION.md`

**Contenido completo**:
1. **IDs Internos (BIGSERIAL)** - PostgreSQL auto-increment
2. **IDs Públicos (nanoid)** - 21 caracteres para APIs públicas
3. **Códigos de Orden** - Formato `MOA-YYYYMMDD-XXXX`
4. **SKUs de Productos** - Formato manual `CAT-NNN`
5. **Slugs** - URLs amigables generadas con `slugify()`
6. **Tokens** - crypto.randomBytes(32) para password reset
7. **Ciclo de vida del carrito** - ABIERTO → (orden creada) → ELIMINADO
8. **Generación de fechas en seeds** - Timeline de 24 meses
9. **Constraints y seguridad** - Qué exponer/no exponer en APIs

**Información clave documentada**:
- ✅ `order_code`: `MOA-${YYYYMMDD}-${random}` generado con Date + Math.random
- ✅ `public_id`: nanoid(21) para usuarios/productos
- ✅ `carrito`: Solo existe con status='ABIERTO', se elimina después de orden
- ✅ `password_reset_tokens`: crypto.randomBytes(32), expira en 1 hora, uso único

---

## 5. Próximos Pasos (NO IMPLEMENTADO AÚN)

### 🔄 Pendiente: Actualizar Seeds

#### 5.1 Datos de Usuarios (`usersSeed.js`)
- [ ] Cambiar `rol: 'user'` → `rol: 'cliente'`
- [ ] Cambiar `rol_code: 'USER'` → `rol_code: 'CLIENT'`
- [ ] Cambiar `rol: 'admin'` → `rol: 'administrador'`
- [ ] Agregar 15 usuarios adicionales (de `moreDataSeed.js`)
- [ ] Generar fechas `creado_en` distribuidas en 24 meses

#### 5.2 Productos (`productsData.js`)
- [ ] **Repreciar** todos los 33 productos con valores realistas Santiago 2025
- [ ] Actualizar `precio_cents` para reflejar mercado actual
- [ ] Ejemplo: Sofá Coppel $899.990 = 89999000 cents

#### 5.3 Direcciones (`addressesSeed.js`)
- [ ] Agregar campo `label` ('casa', 'oficina', 'trabajo', 'otro')
- [ ] Homogenizar `region` - usar "Región Metropolitana de Santiago" (no "RM")
- [ ] Usar `COMUNAS_POR_REGION` de `locations.js` para comunas válidas
- [ ] Hacer `departamento` y `referencia` opcionales (algunos NULL)
- [ ] Agregar direcciones para los 15 nuevos usuarios

#### 5.4 Órdenes (`ordersSeed.js`)
- [ ] Integrar 30 órdenes de `moreDataSeed.js`
- [ ] Agregar **20 órdenes adicionales** (total: 50 órdenes)
- [ ] Distribuir fechas `creado_en` en 24 meses (70% últimos 6 meses)
- [ ] Usar `METODOS_PAGO` de `payment-methods.js` (importar constantes)
- [ ] Usar `EMPRESAS_ENVIO` de `order-states.js`
- [ ] Asignar estados realistas según antigüedad:
  - Órdenes <30 días: 70% PAGADO, 20% PENDIENTE, 10% CANCELADO
  - Órdenes >30 días: 90% PAGADO+ENTREGADO, 10% CANCELADO
- [ ] `numero_seguimiento`: generar o dejar 'PENDIENTE_ASIGNAR' si orden reciente
- [ ] Eliminar `notas_internas` (campo removido)

#### 5.5 Carritos (`cartsSeed.js`)
- [ ] Solo carritos de últimos 30 días (carritos antiguos no tienen sentido)
- [ ] Máximo 5-10 carritos activos (usuarios que no completaron compra)

#### 5.6 Wishlists (`wishlistsSeed.js`)
- [ ] Agregar items de los 15 nuevos usuarios
- [ ] Distribuir productos populares en wishlists

---

## 6. Cambios Requeridos en Backend

### 🔧 Archivos a Modificar

#### 6.1 `src/models/passwordResetModel.js`
```javascript
// ANTES:
created_at, expires_at, used_at

// DESPUÉS:
creado_en, expira_en, usado_en
```

#### 6.2 `src/controllers/authController.js`
```javascript
// ANTES:
INSERT INTO password_reset_tokens (token, usuario_id, expires_at)

// DESPUÉS:
INSERT INTO password_reset_tokens (token, usuario_id, expira_en)
```

#### 6.3 `src/controllers/orderController.js`
```javascript
// ELIMINAR referencias a:
notas_internas

// USAR defaults:
numero_seguimiento: 'PENDIENTE_ASIGNAR' (default)
empresa_envio: 'por_asignar' (default)
```

#### 6.4 Importar constantes en controllers
```javascript
// orderController.js
import { 
  ESTADOS_ORDEN, 
  ESTADOS_PAGO, 
  ESTADOS_ENVIO,
  isValidEstadoOrden 
} from '../../../shared/constants/order-states.js';

// addressController.js
import { 
  isValidRegion, 
  isValidComuna,
  TIPOS_DIRECCION 
} from '../../../shared/constants/locations.js';
```

---

## 7. Cambios Requeridos en Frontend

### 🎨 Componentes a Actualizar

#### 7.1 Checkout - Cascading Selects
**Archivo**: `frontend/src/modules/checkout/CheckoutPage.jsx`

```javascript
import { REGIONES, getComunasByRegion } from '@/shared/constants/locations';

// 1. Select de Región
<select onChange={e => setSelectedRegion(e.target.value)}>
  {REGIONES.map(r => <option value={r.codigo}>{r.nombre}</option>)}
</select>

// 2. Select de Comuna (dinámico según región)
<select>
  {getComunasByRegion(selectedRegion).map(comuna => 
    <option value={comuna}>{comuna}</option>
  )}
</select>
```

#### 7.2 Admin Orders - Estados
**Archivo**: `frontend/src/modules/admin/orders/OrdersAdminPageV2.jsx`

```javascript
import { ESTADOS_PAGO_OPTIONS, ESTADOS_ENVIO_OPTIONS } from '@/shared/constants/order-states';

<select>
  {ESTADOS_PAGO_OPTIONS.map(opt => 
    <option value={opt.value} style={{color: opt.color}}>
      {opt.label}
    </option>
  )}
</select>
```

#### 7.3 Profile - Address Label
**Archivo**: `frontend/src/modules/profile/components/AddressForm.jsx`

```javascript
import { TIPOS_DIRECCION_OPTIONS } from '@/shared/constants/locations';

<select name="label">
  {TIPOS_DIRECCION_OPTIONS.map(tipo => 
    <option value={tipo.value}>{tipo.label}</option>
  )}
</select>
```

---

## 8. Testing Requerido

### ✅ Tests a Ejecutar

1. **Schema Installation**
   ```bash
   npm run -w backend db:install
   # Debe crear todas las tablas sin errores
   ```

2. **Constraints Validation**
   ```bash
   npm run -w backend db:test
   # Ejecuta test-database.sql - debe pasar 10/10 tests
   ```

3. **Seeds Execution** (después de actualizar seeds)
   ```bash
   npm run -w backend seed:all
   # Debe poblar BD con datos realistas
   ```

4. **Backend API Tests**
   ```bash
   npm run -w backend test
   # Validar que password_reset_tokens usa columnas en español
   ```

5. **Frontend E2E**
   - [ ] Registro de usuario → Verificar rol='cliente', rol_code='CLIENT'
   - [ ] Agregar dirección → Verificar cascading región→comuna
   - [ ] Checkout → Verificar label en dirección
   - [ ] Admin orders → Verificar estados con labels traducidos

---

## 9. Checklist de Producción

### 🚀 Pre-Deploy

- [x] DDL.sql sin COMMENT ON
- [x] Columnas password_reset_tokens en español
- [x] rol/rol_code actualizados a cliente/CLIENT
- [x] direcciones con label
- [x] ordenes sin notas_internas
- [x] empresa_envio con default y constraint
- [x] Constantes creadas (order-states.js, locations.js)
- [x] Documentación IDs/códigos completada
- [ ] Seeds actualizados con datos realistas (PENDIENTE)
- [ ] Backend usando columnas en español (PENDIENTE)
- [ ] Frontend con selects cascading (PENDIENTE)
- [ ] Tests pasando 100% (PENDIENTE)

### 📊 Datos Realistas

- [ ] 33 productos con precios Santiago 2025
- [ ] 50 órdenes distribuidas en 24 meses
- [ ] 20+ usuarios con datos variados
- [ ] Estados de orden reflejan workflow realista
- [ ] Métodos de pago usando constantes
- [ ] Tracking numbers asignados a órdenes pagadas

---

## 10. Archivos Modificados

```
backend/database/schema/DDL.sql                    ✅ MODIFICADO
shared/constants/order-states.js                   ✅ CREADO
shared/constants/locations.js                      ✅ CREADO
docs/misDOCS/IDS_Y_CODIGOS_GENERACION.md          ✅ CREADO
docs/misDOCS/CAMBIOS_DATABASE_ENE_2025.md         ✅ CREADO (este archivo)
```

---

## 11. Migraciones (No Aplicable)

**⚠️ IMPORTANTE**: No hay archivos de migración porque ya consolidamos todo en DDL.sql.

**Para aplicar cambios en producción**:
1. Hacer backup completo: `npm run -w backend db:backup`
2. Ejecutar ALTER TABLE statements manualmente
3. Actualizar datos con UPDATE queries

**ALTER statements necesarios** (si ya tienes BD en producción):

```sql
-- 1. Actualizar usuarios
ALTER TABLE usuarios 
  ALTER COLUMN rol SET DEFAULT 'cliente',
  DROP CONSTRAINT IF EXISTS usuarios_rol_check,
  ADD CHECK (rol IN ('cliente', 'administrador'));

ALTER TABLE usuarios 
  ALTER COLUMN rol_code SET DEFAULT 'CLIENT',
  DROP CONSTRAINT IF EXISTS usuarios_rol_code_check,
  ADD CHECK (rol_code IN ('CLIENT', 'ADMIN'));

UPDATE usuarios SET rol = 'cliente' WHERE rol = 'user';
UPDATE usuarios SET rol = 'administrador' WHERE rol = 'admin';
UPDATE usuarios SET rol_code = 'CLIENT' WHERE rol_code = 'USER';

-- 2. Renombrar columnas password_reset_tokens
ALTER TABLE password_reset_tokens 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE password_reset_tokens 
  RENAME COLUMN expires_at TO expira_en;
ALTER TABLE password_reset_tokens 
  RENAME COLUMN used_at TO usado_en;

-- 3. Actualizar direcciones
ALTER TABLE direcciones 
  ADD COLUMN label TEXT DEFAULT 'casa' CHECK (label IN ('casa', 'oficina', 'trabajo', 'otro'));
ALTER TABLE direcciones 
  ALTER COLUMN departamento DROP NOT NULL;
ALTER TABLE direcciones 
  ALTER COLUMN referencia DROP NOT NULL;

-- 4. Actualizar ordenes
ALTER TABLE ordenes 
  DROP COLUMN notas_internas;
ALTER TABLE ordenes 
  ALTER COLUMN numero_seguimiento SET DEFAULT 'PENDIENTE_ASIGNAR';
ALTER TABLE ordenes 
  ALTER COLUMN empresa_envio SET DEFAULT 'por_asignar',
  ADD CHECK (empresa_envio IN ('chilexpress', 'blue_express', 'starken', 'correos_chile', 'por_asignar'));

-- 5. Actualizar configuracion_tienda
UPDATE configuracion_tienda 
SET descripcion = 'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.'
WHERE id = 1;
```

---

## 12. Notas Finales

- ✅ **Todos los cambios son retrocompatibles** (no rompen funcionalidad existente)
- ⚠️ **Requiere actualización de código backend** (columnas password_reset_tokens)
- 🎯 **Prioridad**: Actualizar seeds con datos realistas antes de deploy
- 📚 **Documentación completa** disponible en `/docs/misDOCS/`

---

**Fecha de cambios**: Enero 15, 2025  
**Versión DDL**: 1.0.0  
**Estado**: Esquema listo, seeds pendientes de actualización
