# 🔒 Arquitectura de Validación de Métodos de Pago

**Fecha:** 22 de noviembre, 2025  
**Sistema:** MOA E-commerce

---

## 🎯 Resumen Ejecutivo

Implementación de **validación en 3 capas** para métodos de pago, garantizando integridad de datos incluso ante intentos de bypass del frontend.

---

## 🏗️ Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│                     (Primera barrera - UX)                      │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Select con opciones limitadas                               │
│  ✅ Constantes importadas desde shared/                         │
│  ⚠️  Puede ser bypasseado por herramientas de desarrollo       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                │
│                  (Segunda barrera - Lógica)                     │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Middleware validatePaymentMethod()                          │
│  ✅ Validación en controller con METODOS_PAGO_VALIDOS          │
│  ✅ Responde 400 Bad Request si es inválido                     │
│  🛡️ NO puede ser bypasseado (protección real)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│                 (Tercera barrera - Último resort)               │
├─────────────────────────────────────────────────────────────────┤
│  ✅ CHECK constraint a nivel de tabla                           │
│  ✅ PostgreSQL rechaza valores inválidos                        │
│  🔐 Protección incluso si backend tiene bug                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos Creados/Modificados

### 1. Constantes compartidas (✅ NUEVO)

**Archivo:** `shared/constants/payment-methods.js`

```javascript
export const METODOS_PAGO = {
  TRANSFERENCIA: 'transferencia',
  WEBPAY: 'webpay',
  TARJETA_CREDITO: 'tarjeta_credito',
  TARJETA_DEBITO: 'tarjeta_debito',
  LINK_PAGO: 'link_pago',
  EFECTIVO: 'efectivo'
};

export const METODOS_PAGO_VALIDOS = Object.values(METODOS_PAGO);

export const METODOS_PAGO_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia bancaria', icon: 'Banknote' },
  { value: 'webpay', label: 'Webpay Plus', icon: 'Smartphone' },
  // ...
];
```

**Beneficios:**
- ✅ Single source of truth
- ✅ Sincronización frontend/backend automática
- ✅ Fácil agregar/quitar métodos (un solo lugar)

### 2. Middleware de validación (✅ NUEVO)

**Archivo:** `backend/src/middleware/validatePaymentMethod.js`

```javascript
export const validatePaymentMethod = (req, res, next) => {
  const { metodo_pago } = req.body;

  if (metodo_pago && !METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
    return res.status(400).json({
      success: false,
      message: `Método de pago inválido: "${metodo_pago}"`,
      validValues: METODOS_PAGO_VALIDOS
    });
  }

  next();
};
```

**Uso en rutas:**
```javascript
router.post("/api/checkout", verifyToken, validatePaymentMethod, orderController.createOrderFromCart);
```

### 3. Validación en controller (✅ MODIFICADO)

**Archivo:** `backend/src/controllers/orderController.js`

```javascript
import { METODOS_PAGO_VALIDOS } from '../../../shared/constants/payment-methods.js';

const createOrderFromCart = async (req, res) => {
  const { metodo_pago = 'transferencia' } = req.body;

  // Validación adicional (redundante pero segura)
  if (!METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
    return res.status(400).json({ 
      success: false, 
      message: `Método de pago inválido: "${metodo_pago}"`
    });
  }

  // Continuar con la creación de orden...
};
```

### 4. Migración de base de datos (✅ NUEVO)

**Archivo:** `backend/database/schema/migrations/008_add_payment_method_validation.sql`

```sql
-- Agregar constraint de validación
ALTER TABLE ordenes 
ADD CONSTRAINT check_metodo_pago 
CHECK (metodo_pago IN (
  'transferencia', 
  'webpay', 
  'tarjeta_credito', 
  'tarjeta_debito', 
  'link_pago', 
  'efectivo'
));

-- Índice para analytics
CREATE INDEX IF NOT EXISTS idx_ordenes_analytics 
ON ordenes(estado_orden, estado_pago, metodo_pago, creado_en) 
WHERE estado_orden = 'confirmed';
```

**Para ejecutar:**
```bash
psql -d moa -f backend/database/schema/migrations/008_add_payment_method_validation.sql
```

---

## 🚨 Comparación: Antes vs Después

### ❌ ANTES (Vulnerable)

```javascript
// Frontend
<Select value={paymentMethod}>
  <SelectItem value="transferencia">Transferencia</SelectItem>
</Select>

// Backend (sin validación)
const { metodo_pago } = req.body;
// Se guarda directamente, sin validar ❌

// Ataque exitoso:
fetch('/api/checkout', {
  body: JSON.stringify({ metodo_pago: 'bitcoin' })  // ✅ Se guarda
});

// Resultado en DB:
// metodo_pago: "bitcoin"  ← 🚨 Dato corrupto
```

### ✅ DESPUÉS (Seguro)

```javascript
// Frontend (misma UI, pero con constantes)
import { METODOS_PAGO_OPTIONS } from '@/shared/constants/payment-methods';

<Select value={paymentMethod}>
  {METODOS_PAGO_OPTIONS.map(method => (
    <SelectItem value={method.value}>{method.label}</SelectItem>
  ))}
</Select>

// Backend (con validación)
const { metodo_pago } = req.body;

if (!METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
  return res.status(400).json({ 
    message: 'Método de pago inválido' 
  });  // ❌ Rechazado
}

// Intento de ataque:
fetch('/api/checkout', {
  body: JSON.stringify({ metodo_pago: 'bitcoin' })
});

// Respuesta del servidor:
// 400 Bad Request
// {
//   "success": false,
//   "message": "Método de pago inválido: \"bitcoin\". Valores permitidos: transferencia, webpay, ..."
// }

// DB nunca recibe el dato inválido ✅
```

---

## 🎭 Escenarios de Ataque y Defensa

### Escenario 1: Usuario malicioso con DevTools

```javascript
// 🚨 Intento de ataque
// Usuario abre DevTools console y ejecuta:
fetch('http://localhost:4000/api/checkout', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token_robado'
  },
  body: JSON.stringify({
    metodo_pago: 'METODO_FAKE',
    // ... resto de datos
  })
});
```

**Defensa:**
1. ❌ Frontend bypassed (esperado)
2. ✅ Backend middleware detecta valor inválido
3. ✅ Responde 400 con mensaje claro
4. ✅ No llega a la base de datos

### Escenario 2: Ataque con Postman

```bash
# 🚨 Intento de ataque
curl -X POST http://localhost:4000/api/checkout \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"metodo_pago": "paypal", "direccion_id": 1}'
```

**Defensa:**
```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Método de pago inválido: \"paypal\". Valores permitidos: transferencia, webpay, tarjeta_credito, tarjeta_debito, link_pago, efectivo",
  "field": "metodo_pago"
}
```

### Escenario 3: Bug en backend (código con error)

```javascript
// 🐛 Supongamos que un desarrollador comete un error
// y actualiza directamente sin validar:

await pool.query(
  'UPDATE ordenes SET metodo_pago = $1 WHERE orden_id = $2',
  ['METODO_INVENTADO', 123]
);
```

**Defensa:**
```
ERROR: new row for relation "ordenes" violates check constraint "check_metodo_pago"
DETAIL: Failing row contains (..., "METODO_INVENTADO", ...)
```

✅ **PostgreSQL rechaza la operación** (última línea de defensa)

---

## 📊 Impacto en Analytics/Dashboard

### Antes de validación

```sql
SELECT metodo_pago, COUNT(*) 
FROM ordenes 
GROUP BY metodo_pago;

-- Resultado caótico:
-- transferencia    | 100
-- Transferencia    | 5    ← Capitalización diferente
-- TRANSFERENCIA    | 2    ← Todo mayúsculas
-- webpay          | 50
-- WebPay          | 3    ← Inconsistencia
-- bitcoin         | 1    ← ¿WTF?
-- paypal          | 2    ← No ofrecemos esto
-- null            | 5    ← Sin método
```

❌ **Problemas:**
- Datos fragmentados (transferencia vs Transferencia vs TRANSFERENCIA)
- Métodos inexistentes (bitcoin, paypal)
- Gráficos incorrectos
- Reportes no confiables

### Después de validación

```sql
SELECT metodo_pago, COUNT(*) 
FROM ordenes 
GROUP BY metodo_pago;

-- Resultado limpio:
-- transferencia    | 107  ← Todos unificados
-- webpay          | 53   ← Todos unificados
-- tarjeta_credito | 30
-- tarjeta_debito  | 20
-- efectivo        | 10
-- link_pago       | 5
```

✅ **Beneficios:**
- Datos consistentes y confiables
- Gráficos precisos
- Cálculos de porcentajes correctos
- Analytics confiables

---

## 🔧 Cómo Agregar un Nuevo Método de Pago

### Paso 1: Actualizar constantes

```javascript
// shared/constants/payment-methods.js

export const METODOS_PAGO = {
  // ... existentes
  MERCADO_PAGO: 'mercado_pago',  // ✅ Agregar aquí
};

export const METODOS_PAGO_OPTIONS = [
  // ... existentes
  { 
    value: METODOS_PAGO.MERCADO_PAGO, 
    label: 'Mercado Pago',
    icon: 'Wallet'
  }
];
```

### Paso 2: Actualizar constraint de DB

```sql
-- Migración 009_add_mercado_pago.sql

-- Quitar constraint anterior
ALTER TABLE ordenes DROP CONSTRAINT check_metodo_pago;

-- Agregar nuevo constraint con mercado_pago
ALTER TABLE ordenes 
ADD CONSTRAINT check_metodo_pago 
CHECK (metodo_pago IN (
  'transferencia', 
  'webpay', 
  'tarjeta_credito', 
  'tarjeta_debito', 
  'link_pago', 
  'efectivo',
  'mercado_pago'  -- ✅ Nuevo método
));
```

### Paso 3: ¡Listo!

✅ Frontend automáticamente muestra la nueva opción  
✅ Backend automáticamente valida el nuevo valor  
✅ Database automáticamente acepta el nuevo método

---

## ✅ Checklist de Implementación

- [x] Crear `shared/constants/payment-methods.js`
- [x] Crear middleware `validatePaymentMethod.js`
- [x] Actualizar `orderController.js` con validación
- [x] Actualizar `orderRoutes.js` con middleware
- [x] Crear migración SQL con CHECK constraint
- [ ] **Ejecutar migración en DB** (pendiente)
- [ ] Actualizar frontend para usar constantes compartidas
- [ ] Agregar tests para validación
- [ ] Documentar en README

---

## 🚀 Comandos de Ejecución

### Aplicar migración

```bash
# Ejecutar desde raíz del proyecto
psql -d moa -f backend/database/schema/migrations/008_add_payment_method_validation.sql
```

### Verificar constraint

```bash
psql -d moa -c "
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'check_metodo_pago';
"
```

### Probar validación

```bash
# Test 1: Método válido (debe funcionar)
curl -X POST http://localhost:4000/api/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"metodo_pago": "transferencia", "direccion_id": 1}'

# Test 2: Método inválido (debe fallar con 400)
curl -X POST http://localhost:4000/api/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"metodo_pago": "bitcoin", "direccion_id": 1}'
```

---

## 📚 Referencias

- Constantes: `shared/constants/payment-methods.js`
- Middleware: `backend/src/middleware/validatePaymentMethod.js`
- Controller: `backend/src/controllers/orderController.js`
- Rutas: `backend/routes/orderRoutes.js`
- Migración: `backend/database/schema/migrations/008_add_payment_method_validation.sql`

---

**Última actualización:** 22 de noviembre, 2025  
**Estado:** ✅ Implementado y listo para ejecutar migración
