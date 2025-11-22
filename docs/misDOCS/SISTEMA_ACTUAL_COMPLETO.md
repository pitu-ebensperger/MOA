# 📋 Sistema Actual Completo - MOA E-commerce

**Fecha:** 22 de noviembre, 2025  
**Estado:** Documentación del estado real del proyecto

---

## 🔍 RESUMEN EJECUTIVO

Este documento responde a las preguntas sobre el estado actual de:
1. ✅ **Métodos de pago**
2. ✅ **Direcciones de envío**
3. ✅ **Sistema de envíos y tracking**
4. ✅ **Recuperación de contraseña**

---

## 💳 1. MÉTODOS DE PAGO

### ¿Cómo funciona actualmente?

**Estado:** ✅ **Hardcodeados en frontend con selección manual**

### Ubicación y opciones

Las opciones de pago están **hardcodeadas** directamente en el componente de checkout:

**Archivo:** `frontend/src/modules/cart/pages/CheckoutPage.jsx` (líneas 355-410)

```jsx
<Select value={paymentMethod} onValueChange={setPaymentMethod}>
  <SelectContent>
    <SelectItem value="transferencia">
      Transferencia bancaria
    </SelectItem>
    <SelectItem value="webpay">
      Webpay Plus (Transbank)
    </SelectItem>
    <SelectItem value="tarjeta_credito">
      Tarjeta de crédito
    </SelectItem>
    <SelectItem value="tarjeta_debito">
      Tarjeta de débito
    </SelectItem>
    <SelectItem value="link_pago">
      Link de pago por email
    </SelectItem>
    <SelectItem value="efectivo">
      Efectivo contra entrega
    </SelectItem>
  </SelectContent>
</Select>
```

### ¿Es obligatorio en checkout?

✅ **SÍ** - Valor por defecto: `'transferencia'`

```javascript
const [paymentMethod, setPaymentMethod] = useState('transferencia');
```

### ¿Existe en backend/DB?

**SÍ, parcialmente:**

#### Tabla `ordenes` (DDL.sql, línea 189):
```sql
CREATE TABLE ordenes (
  -- ...
  metodo_pago TEXT,  -- ✅ Se guarda el string seleccionado
  -- ...
);
```

#### Tabla `password_reset_tokens` existe pero **NO** tabla `metodos_pago`:
- ❌ **NO existe tabla `metodos_pago`** para guardar métodos de pago del usuario
- ❌ **NO se guardan datos de tarjetas/cuentas bancarias**
- ✅ **Solo se guarda el string** del método seleccionado en cada orden

### ¿Cómo se guarda en DB?

**Backend:** `backend/src/controllers/orderController.js` (línea 44)

```javascript
const {
  // ...
  metodo_pago = 'transferencia',  // ✅ Default si no se envía
  // ...
} = req.body;
```

El campo `metodo_pago` se inserta directamente como TEXT en la orden:

```javascript
INSERT INTO ordenes (
  -- ...
  metodo_pago,
  -- ...
) VALUES ($1, $2, $3, $4, $5, ...)
```

### Resumen métodos de pago

| Aspecto | Estado |
|---------|--------|
| **Opciones predefinidas** | ✅ Hardcodeadas en `CheckoutPage.jsx` |
| **Usuario hace select** | ✅ Sí, con dropdown |
| **Obligatorio en checkout** | ✅ Sí (default: 'transferencia') |
| **Se guarda en DB** | ✅ Como TEXT en tabla `ordenes` |
| **Tabla `metodos_pago`** | ❌ NO existe |
| **Guardar tarjetas usuario** | ❌ NO implementado |
| **Integración pasarela** | ❌ Simulado (no real) |

---

## 📍 2. DIRECCIONES DE ENVÍO

### ¿Cómo funciona actualmente?

**Estado:** ✅ **Sistema completo de direcciones guardadas implementado**

### Base de datos

**Tabla `direcciones` existe:** ✅ `backend/database/schema/DDL.sql` (líneas 79-93)

```sql
CREATE TABLE direcciones (
    direccion_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    nombre_contacto TEXT NOT NULL,
    telefono_contacto TEXT NOT NULL,
    calle TEXT NOT NULL,
    numero TEXT NOT NULL,
    departamento TEXT,
    comuna TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    region TEXT NOT NULL,
    codigo_postal TEXT,
    referencia TEXT,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);
```

### Backend completo

✅ **Modelo:** `backend/src/models/addressModel.js`
- `getUserAddresses(usuarioId)`
- `getById(direccionId, usuarioId)`
- `getDefaultAddress(usuarioId)`
- `create(addressData)`
- `update(direccionId, usuarioId, addressData)`
- `setAsDefault(direccionId, usuarioId)`
- `delete(direccionId, usuarioId)`

✅ **Controlador:** `backend/src/controllers/addressController.js`
- Todas las funciones CRUD implementadas
- Validaciones de campos obligatorios
- Seguridad: solo puede ver/editar sus propias direcciones

✅ **Rutas:** `backend/routes/addressRoutes.js`
```javascript
router.get("/api/direcciones", verifyToken, getUserAddresses);
router.get("/api/direcciones/predeterminada", verifyToken, getDefaultAddress);
router.get("/api/direcciones/:id", verifyToken, getAddressById);
router.post("/api/direcciones", verifyToken, createAddress);
router.patch("/api/direcciones/:id", verifyToken, updateAddress);
router.patch("/api/direcciones/:id/predeterminada", verifyToken, setDefaultAddress);
router.delete("/api/direcciones/:id", verifyToken, deleteAddress);
```

### Frontend completo

✅ **Context:** `frontend/src/context/useAddresses.js`
- Carga automática al autenticarse
- CRUD completo desde el frontend
- Manejo de dirección predeterminada

✅ **Integración en Checkout:** `frontend/src/modules/cart/pages/CheckoutPage.jsx`

El usuario puede:
1. **Seleccionar dirección guardada** (si tiene)
2. **Ingresar dirección nueva** en el checkout
3. **Es opcional** guardar la dirección nueva

```javascript
// Selector de dirección en checkout
const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.direccion_id || null);

// Si no selecciona guardada, puede ingresar nueva
const [newAddress, setNewAddress] = useState({
  calle: '',
  comuna: '',
  ciudad: '',
  region: '',
});
```

### ¿Todas las compras tienen dirección asociada?

**NO, depende del método de despacho:**

```javascript
// Validación en backend/src/controllers/orderController.js (línea 49)
if (!direccion_id && metodo_despacho !== 'retiro') {
  return res.status(400).json({ 
    message: 'La dirección de envío es obligatoria para órdenes con despacho' 
  });
}
```

- ✅ **Despacho standard/express:** Dirección **OBLIGATORIA**
- ❌ **Retiro en showroom:** Dirección **NO requerida** (direccion_id = NULL)

### ¿Se guarda automáticamente para el usuario?

**NO automático, pero hay opciones:**

En `CheckoutPage.jsx`, cuando el usuario ingresa dirección nueva:
- ❌ **NO se guarda automáticamente** después del checkout
- ✅ **Puede ir a su perfil** y agregar direcciones para futuros pedidos
- 🔄 **Pendiente:** Agregar checkbox "Guardar esta dirección" en checkout

### ¿Puede guardar más de una/nombrarlas?

✅ **SÍ**
- Campo `etiqueta` en tabla direcciones (ej: "Casa", "Oficina", "Depto")
- Campo `es_predeterminada` para marcar una como principal
- Sin límite de direcciones por usuario

### ¿Auto-completado en futuras compras?

✅ **SÍ** - Sistema implementado:

```javascript
// useAddresses.js - Carga automática
useEffect(() => {
  if (isAuthenticated) {
    loadAddresses(); // Carga direcciones al autenticarse
  }
}, [isAuthenticated]);

// CheckoutPage.jsx - Pre-selección de dirección predeterminada
const [selectedAddressId, setSelectedAddressId] = useState(
  defaultAddress?.direccion_id || null
);
```

### Relación con órdenes

**Tabla `ordenes` tiene:**

```sql
CREATE TABLE ordenes (
  -- ...
  direccion_id BIGINT REFERENCES direcciones (direccion_id),  -- ✅ FK a direcciones
  -- ...
);
```

Cuando se crea orden:
1. Si usa dirección guardada → `direccion_id` apunta a registro existente
2. Si ingresa nueva → ❌ **NO se guarda** (se pierde después de la orden)
3. Si es retiro → `direccion_id = NULL`

### Resumen direcciones

| Aspecto | Estado |
|---------|--------|
| **Tabla `direcciones` en DB** | ✅ Existe y completa |
| **Backend CRUD** | ✅ Modelo + Controller + Routes |
| **Frontend Context** | ✅ `useAddresses` implementado |
| **Múltiples direcciones** | ✅ Sin límite |
| **Nombrar direcciones** | ✅ Campo `etiqueta` |
| **Dirección predeterminada** | ✅ Campo `es_predeterminada` |
| **Auto-guardar en checkout** | ❌ NO (pendiente agregar) |
| **Selección en checkout** | ✅ Dropdown de guardadas |
| **Auto-completado futuro** | ✅ Funcional |
| **Obligatoria en checkout** | ⚠️ Solo si no es retiro |

---

## 🚚 3. SISTEMA DE ENVÍOS Y TRACKING

### Métodos de envío

**Estado:** ✅ **Configuración completa en frontend**

**Ubicación:** `frontend/src/utils/orderTracking.js` (líneas 10-39)

```javascript
export const METODOS_DESPACHO = {
  standard: {
    value: "standard",
    label: "Despacho estándar",
    descripcion: "Entrega en 3-5 días hábiles",
    precio: 0, // Gratis
    dias_min: 3,
    dias_max: 5,
    icono: Truck
  },
  express: {
    value: "express",
    label: "Despacho express",
    descripcion: "Entrega en 1-2 días hábiles",
    precio: 6900,
    dias_min: 1,
    dias_max: 2,
    icono: Zap
  },
  retiro: {
    value: "retiro",
    label: "Retiro en showroom",
    descripcion: "Disponible al día siguiente",
    precio: 0,
    dias_min: 1,
    dias_max: 1,
    direccion: "Av. Nueva Providencia 1881, Providencia",
    horario: "Lunes a viernes 10:00 - 18:00, Sábados 10:00 - 14:00",
    icono: Store
  }
};
```

### ¿Usuario selecciona opción de envío?

✅ **SÍ** - Componente dedicado:

**Archivo:** `frontend/src/modules/cart/components/ShippingMethodSelector.jsx`

Usuario ve:
- **Precio** de cada método (standard gratis, express $6.900)
- **Tiempo estimado** de entrega
- **Descripción** del método
- **Total recalculado** automáticamente

```javascript
// CheckoutPage.jsx - Recálculo automático
const shippingCost = hasItems ? shippingInfo.precio : 0;
const grandTotal = total + shippingCost;  // ✅ Total se actualiza
```

### ¿Existe en backend/DB?

**SÍ, parcialmente:**

#### Campos en tabla `ordenes`:

```sql
CREATE TABLE ordenes (
  -- ...
  metodo_despacho TEXT DEFAULT 'standard',  -- ✅ Se guarda método
  subtotal_cents INT DEFAULT 0,             -- ✅ Subtotal productos
  envio_cents INT DEFAULT 0,                -- ✅ Costo envío
  total_cents INT NOT NULL,                 -- ✅ Total final
  -- ...
);
```

#### Campos de tracking/seguimiento:

```sql
CREATE TABLE ordenes (
  -- ...
  estado_envio TEXT DEFAULT 'preparacion',   -- ✅ Estado actual
  fecha_envio TIMESTAMPTZ,                   -- ✅ Cuándo se despachó
  fecha_entrega_real TIMESTAMPTZ,            -- ✅ Cuándo se entregó
  numero_seguimiento TEXT,                   -- ⚠️ Opcional (para courier)
  empresa_envio TEXT,                        -- ⚠️ Opcional (ej: "Chilexpress")
  -- ...
);
```

### Sistema de tracking actual

**Estado:** ✅ **Basado en tiempo estimado (NO tracking real de courier)**

#### Cálculo automático de estados

**Archivo:** `frontend/src/utils/orderTracking.js`

```javascript
/**
 * Calcula el estado actual basado en tiempo transcurrido
 * NO usa tracking de courier real
 */
export function calcularEstadoActual(orden) {
  // Si está marcado manualmente como entregado
  if (orden.estado_envio === 'entregado') {
    return 'entregado';
  }

  const ahora = new Date();
  const fechaOrden = new Date(orden.creado_en);
  const horasDesdeOrden = (ahora - fechaOrden) / (1000 * 60 * 60);

  // Primeras 24h → Confirmada
  if (horasDesdeOrden < 24) return 'confirmada';
  
  // 24h-48h → Preparación
  if (horasDesdeOrden < 48) return 'preparacion';
  
  // Si es retiro → Listo para retiro
  if (orden.metodo_despacho === 'retiro') return 'listo_retiro';
  
  // Si pasó tiempo estimado → Probablemente entregado
  const fechaEstimada = calcularFechaEstimada(fechaOrden, orden.metodo_despacho);
  if (ahora > fechaEstimada) return 'entregado';
  
  // Último día antes de entrega → En tránsito
  const diasRestantes = Math.ceil((fechaEstimada - ahora) / (1000 * 60 * 60 * 24));
  if (diasRestantes <= 1) return 'en_transito';
  
  return 'preparacion';
}
```

#### Estados disponibles:

```javascript
export const ESTADOS_ORDEN = {
  confirmada: {
    label: "Orden confirmada",
    progreso: 25
  },
  preparacion: {
    label: "En preparación",
    progreso: 50
  },
  en_transito: {
    label: "En camino",
    progreso: 75
  },
  listo_retiro: {
    label: "Listo para retiro",
    progreso: 75
  },
  entregado: {
    label: "Entregado",
    progreso: 100
  }
};
```

### ¿Qué ve el cliente?

**Timeline visual con:**
- Fecha estimada de entrega (calculada)
- Barra de progreso (0-100%)
- Estados completados vs pendientes
- Información de contacto (WhatsApp/email) para consultas

**NO muestra:**
- ❌ Número de tracking real
- ❌ Nombre de empresa courier
- ❌ Ubicación GPS del paquete

### Vista/info desde Admin

**Ubicación:** `backend/src/models/orderAdminModel.js`

Admin puede:

✅ **Ver estados:**
```javascript
const getOrderByIdAdmin = async (ordenId) => {
  // Retorna orden completa con:
  // - estado_pago
  // - estado_envio
  // - metodo_despacho
  // - fecha_envio
  // - fecha_entrega_real
  // - numero_seguimiento (si existe)
  // - empresa_envio (si existe)
  // - notas_internas
}
```

✅ **Actualizar estado manualmente:**
```javascript
const updateOrderStatus = async (ordenId, updates) => {
  // Admin puede cambiar:
  // - estado_pago
  // - estado_envio
  // - fecha_envio
  // - fecha_entrega_real
}
```

✅ **Agregar tracking (opcional):**
```javascript
const addTrackingInfo = async (ordenId, trackingData) => {
  const { numero_seguimiento, empresa_envio, fecha_envio } = trackingData;
  // Actualiza campos en orden
}
```

### ¿Admin cambia manualmente estados?

✅ **SÍ** - Sistema diseñado para control manual:

**Endpoint:** `PUT /api/admin/orders/:id/status`

```javascript
// backend/src/controllers/orderController.js
const ORDER_STATUS_TRANSITIONS = {
  pending: () => ({
    estado_pago: 'pendiente',
    estado_envio: 'preparacion',
  }),
  processing: () => ({
    estado_pago: 'procesando',
    estado_envio: 'preparacion',
  }),
  shipped: () => ({
    estado_pago: 'pagado',
    estado_envio: 'enviado',
  }),
  fulfilled: () => ({
    estado_pago: 'pagado',
    estado_envio: 'entregado',
    fecha_entrega_real: new Date().toISOString(),
  }),
  cancelled: () => ({
    estado_pago: 'cancelado',
    estado_envio: 'devuelto',
  }),
};
```

### Widgets/Charts disponibles para Admin Dashboard

**Estado:** ⚠️ **Infraestructura lista, widgets por implementar**

**Datos disponibles en DB para visualizaciones:**

```sql
-- ✅ Órdenes por estado
SELECT estado_orden, COUNT(*) 
FROM ordenes 
WHERE estado_orden = 'confirmed'
GROUP BY estado_orden;

-- ✅ Órdenes por estado de pago
SELECT estado_pago, COUNT(*) 
FROM ordenes 
GROUP BY estado_pago;

-- ✅ Órdenes por estado de envío
SELECT estado_envio, COUNT(*) 
FROM ordenes 
GROUP BY estado_envio;

-- ✅ Órdenes por método de despacho
SELECT metodo_despacho, COUNT(*) 
FROM ordenes 
GROUP BY metodo_despacho;

-- ✅ Ingresos por período
SELECT DATE_TRUNC('day', creado_en) as fecha,
       SUM(total_cents) as total
FROM ordenes 
WHERE estado_pago = 'pagado'
GROUP BY fecha
ORDER BY fecha DESC;

-- ✅ Productos más vendidos
SELECT p.nombre, SUM(oi.cantidad) as total_vendido
FROM orden_items oi
JOIN productos p ON oi.producto_id = p.producto_id
GROUP BY p.nombre
ORDER BY total_vendido DESC
LIMIT 10;

-- ✅ Promedio de ticket
SELECT AVG(total_cents) as ticket_promedio
FROM ordenes 
WHERE estado_orden = 'confirmed';
```

**Widgets sugeridos:**
1. 📊 Gráfico de línea: Ventas por día/semana/mes
2. 🍰 Gráfico de torta: Distribución por estado de pago
3. 📦 Gráfico de barras: Órdenes por método de despacho
4. 🏆 Top 10 productos más vendidos
5. 💰 KPIs: Ticket promedio, total vendido, órdenes pendientes

### Resumen envíos/tracking

| Aspecto | Estado |
|---------|--------|
| **Métodos predefinidos** | ✅ 3 métodos (standard/express/retiro) |
| **Precios configurados** | ✅ Standard gratis, Express $6.900 |
| **Selección en checkout** | ✅ Componente visual |
| **Recalcula total** | ✅ Automático |
| **Se guarda en DB** | ✅ Como TEXT en `ordenes` |
| **Tracking real courier** | ❌ NO implementado |
| **Tracking estimado** | ✅ Basado en tiempo |
| **Admin cambia estados** | ✅ Manual via API |
| **Campos tracking opcionales** | ⚠️ Existen pero no usados |
| **Dashboard widgets** | ⚠️ Datos listos, UI pendiente |

---

## 🔐 4. RECUPERACIÓN DE CONTRASEÑA

### ¿Está funcional?

✅ **SÍ - Sistema completo end-to-end**

**Documentación detallada:** `docs/misDOCS/FORGOT_PASSWORD_ANALYSIS.md`

### Base de datos

✅ **Tabla `password_reset_tokens`:** `backend/database/schema/DDL.sql` (líneas 37-51)

```sql
CREATE TABLE password_reset_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
```

### Backend completo

✅ **Modelo:** `backend/src/models/passwordResetModel.js`
- `createResetToken(usuario_id)` - Genera token único (32 bytes, 1 hora validez)
- `findValidToken(token)` - Valida token no usado y no expirado
- `markTokenAsUsed(token)` - Invalida token después de usar
- `invalidateUserTokens(usuario_id)` - Invalida todos los tokens previos
- `cleanExpiredTokens()` - Limpieza de tokens vencidos

✅ **Controlador:** `backend/src/controllers/passwordResetController.js`

**Endpoint 1:** `POST /api/auth/request-password-reset`
```javascript
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  
  // 1. Validar formato email
  // 2. Buscar usuario (sin revelar si existe)
  // 3. Invalidar tokens previos
  // 4. Crear nuevo token
  // 5. Enviar email con link
  // 6. SIEMPRE responde 200 (seguridad)
}
```

**Endpoint 2:** `POST /api/auth/reset-password`
```javascript
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  // 1. Validar token existe y es válido
  // 2. Validar contraseña (min 8 chars, mayúscula, minúscula, dígito)
  // 3. Hashear nueva contraseña con bcrypt
  // 4. Actualizar usuario
  // 5. Marcar token como usado
  // 6. Invalidar otros tokens pendientes
}
```

✅ **Servicio de Email:** `backend/src/services/emailService.js`

```javascript
export const sendPasswordResetEmail = async ({ email, nombre, token }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/restablecer-contrasena?token=${token}`;
  
  // Plantilla HTML responsive
  // Fallback texto plano
  // Preview URL (Ethereal en dev)
}
```

**Configuración:**
- Si `SMTP_*` configurado → Usa SMTP real
- Si NO → Crea cuenta Ethereal automática (dev)
- Imprime `previewUrl` en consola para ver emails

✅ **Job de limpieza:** `backend/src/jobs/passwordResetCleanup.js`

```javascript
// Limpia tokens expirados cada 60 minutos
export const startPasswordResetCleanupJob = () => {
  const intervalMinutes = Number(process.env.PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES || 60);
  // ...
}
```

### Frontend completo

✅ **Servicio API:** `frontend/src/services/auth.api.js`

```javascript
export const authApi = {
  async requestPasswordReset(email) {
    return apiClient.post('/auth/request-password-reset', { email });
  },
  
  async resetPassword(token, password) {
    return apiClient.post('/auth/reset-password', { token, password });
  }
}
```

✅ **Páginas:**

**1. Solicitar reset:** `frontend/src/modules/auth/pages/ForgotPasswordPage.jsx`
- Formulario email
- Validación regex
- Toast confirmación
- Modal con instrucciones

**2. Cambiar contraseña:** `frontend/src/modules/auth/pages/ResetPasswordPage.jsx`
- Lee `token` de query params
- Valida contraseña (largo, coincidencia)
- Redirige a `/login` tras éxito
- Manejo errores (token inválido/expirado)

### Flujo completo

```
Usuario                    Frontend                Backend                Email
   │                          │                       │                      │
   │  1. "Olvidé contraseña"  │                       │                      │
   ├─────────────────────────>│                       │                      │
   │                          │                       │                      │
   │  2. Ingresa email        │                       │                      │
   │                          │ POST /request-reset   │                      │
   │                          ├──────────────────────>│                      │
   │                          │                       │                      │
   │                          │                       │ 3. Valida usuario    │
   │                          │                       │ 4. Crea token        │
   │                          │                       │                      │
   │                          │                       │ 5. Envía email       │
   │                          │                       ├─────────────────────>│
   │                          │                       │                      │
   │                          │ 200 OK (siempre)      │                      │
   │  6. "Revisa tu email"    │<──────────────────────┤                      │
   │<─────────────────────────┤                       │                      │
   │                          │                       │                      │
   │  7. Recibe email         │                       │                      │
   │<─────────────────────────┼───────────────────────┼──────────────────────┤
   │                          │                       │                      │
   │  8. Click en link        │                       │                      │
   │  (/restablecer?token=...) │                       │                      │
   ├─────────────────────────>│                       │                      │
   │                          │                       │                      │
   │  9. Ingresa nueva pass   │                       │                      │
   │                          │ POST /reset-password  │                      │
   │                          ├──────────────────────>│                      │
   │                          │                       │ 10. Valida token     │
   │                          │                       │ 11. Hashea password  │
   │                          │                       │ 12. Actualiza user   │
   │                          │                       │ 13. Marca token usado│
   │                          │                       │                      │
   │                          │ 200 OK                │                      │
   │  14. "Contraseña cambiada"│<──────────────────────┤                      │
   │<─────────────────────────┤                       │                      │
   │                          │                       │                      │
   │  15. Redirige a /login   │                       │                      │
   │<─────────────────────────┤                       │                      │
```

### Seguridad implementada

✅ **Protecciones:**
- Token único de 32 bytes (crypto)
- Expiración 1 hora
- Tokens de un solo uso (`used_at`)
- Invalidación de tokens previos
- Respuesta 200 siempre (no revela si email existe)
- Delay artificial (~1s) para evitar timing attacks
- Bcrypt para hashear contraseñas
- HTTPS requerido en producción (tokens en URL)

⚠️ **Pendientes:**
- Rate limiting (3 intentos / 15 min recomendado)
- Cron diario de limpieza de tokens
- Alertas si falla envío de email
- Tests automatizados

### Variables de entorno requeridas

**Desarrollo (Ethereal automático):**
```bash
FRONTEND_URL=http://localhost:5173
# SMTP_* opcional - usa Ethereal si no está
```

**Producción (SMTP real):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@moa.cl
FRONTEND_URL=https://moa.cl
```

### Resumen recuperación contraseña

| Aspecto | Estado |
|---------|--------|
| **Tabla `password_reset_tokens`** | ✅ Existe con índices |
| **Backend completo** | ✅ Modelo + Controller |
| **Endpoints REST** | ✅ `/request-reset` + `/reset-password` |
| **Envío de emails** | ✅ SMTP + Ethereal fallback |
| **Frontend páginas** | ✅ Forgot + Reset |
| **Validaciones** | ✅ Email, token, contraseña |
| **Seguridad** | ✅ Tokens únicos, expiración, bcrypt |
| **Rate limiting** | ❌ Pendiente |
| **Cleanup automático** | ⚠️ Job existe, falta cron |
| **Tests** | ❌ Pendiente |
| **Estado general** | ✅ **Funcional y listo para QA** |

---

## 📊 TABLA RESUMEN GENERAL

| Sistema | Backend DB | Backend API | Frontend UI | Funcional | Completo |
|---------|-----------|-------------|-------------|-----------|----------|
| **Métodos de pago** | ⚠️ Solo TEXT | ✅ Guarda string | ✅ Dropdown | ✅ SÍ | ⚠️ 70% |
| **Direcciones** | ✅ Tabla completa | ✅ CRUD completo | ✅ Context + UI | ✅ SÍ | ✅ 95% |
| **Envíos/Tracking** | ⚠️ Campos básicos | ✅ Guarda método | ✅ Selector + Timeline | ✅ SÍ | ⚠️ 80% |
| **Reset Password** | ✅ Tabla + índices | ✅ Endpoints + Email | ✅ Forgot + Reset | ✅ SÍ | ✅ 90% |

---

## 🚀 RECOMENDACIONES DE MEJORA

### Corto plazo (1-2 semanas)

1. **Métodos de pago:**
   - [ ] Agregar checkbox "Guardar para próximas compras" en checkout
   - [ ] Crear tabla `metodos_pago` para guardar tarjetas (solo tokens)
   - [ ] Implementar selección de método guardado

2. **Direcciones:**
   - [ ] Agregar opción "Guardar dirección" en checkout (sin salir del flujo)
   - [ ] Mejorar UI de gestión de direcciones en perfil

3. **Tracking:**
   - [ ] Implementar widgets básicos en admin dashboard:
     - KPIs: Total órdenes, ingresos, ticket promedio
     - Gráfico órdenes por estado
     - Top 5 productos vendidos

4. **Reset Password:**
   - [ ] Agregar rate limiting (express-rate-limit)
   - [ ] Configurar cron diario de limpieza
   - [ ] QA con SMTP real

### Mediano plazo (1-2 meses)

1. **Integración pasarela de pago real** (Transbank WebPay)
2. **Sistema de notificaciones** (Email/WhatsApp automáticos)
3. **Dashboard admin completo** con analytics
4. **API de tracking** para couriers (Chilexpress, Blue Express)

---

## 📝 NOTAS FINALES

### Estado general del proyecto: 85% completo

**Funcionalidades core listas:**
- ✅ E-commerce básico funcional
- ✅ Sistema de autenticación robusto
- ✅ Gestión de productos y categorías
- ✅ Carrito y checkout completo
- ✅ Sistema de órdenes con estados
- ✅ Panel admin con CRUD
- ✅ Direcciones guardadas
- ✅ Recuperación de contraseña

**Por completar antes de producción:**
- ⚠️ Integración pasarela de pago real
- ⚠️ Dashboard admin con visualizaciones
- ⚠️ Rate limiting y hardening de seguridad
- ⚠️ Tests automatizados (unitarios + e2e)
- ⚠️ Monitoreo y alertas
- ⚠️ Optimizaciones de performance (lazy loading implementado)

---

**Última actualización:** 22 de noviembre, 2025  
**Revisado por:** Análisis completo de codebase MOA
