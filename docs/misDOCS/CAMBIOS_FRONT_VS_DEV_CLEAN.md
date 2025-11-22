# Comparativa: rama `front` vs `dev-clean`

**Fecha:** 21 de noviembre, 2025  
**Propósito:** Análisis comparativo detallado para merge sin conflictos

---

## 🔑 Cómo usar este documento

| Momento | Qué hacer | Dónde buscar |
|---------|-----------|--------------|
| **Antes del merge** | Lee "Features exclusivas" para saber qué esperar | Sección [Features exclusivas por rama](#features-exclusivas-por-rama) |
| **Durante conflictos** | Busca el archivo en tablas comparativas | Secciones [Componentes UI](#componentes-ui) y [Backend](#backend-controllers-y-rutas) |
| **Resolución rápida** | Sección "Conflictos esperados" tiene ejemplos literales | Sección [Conflictos esperados con resolución](#conflictos-esperados-con-resolución) |
| **Verificación** | Checklist con ✅ para marcar progreso | Sección [Checklist paso a paso](#checklist-paso-a-paso-para-merge) |
| **Tabla resumen** | Vista rápida de TODO lo que cambia | Sección [Tabla de archivos modificados](#tabla-de-archivos-modificados---resumen) |


---

## 📊 Leyenda

| Símbolo | Significado |
|---------|-------------|
| 🟣 **SOLO en `front`** | Feature/cambio exclusivo de esta rama - **MANTENER** |
| 🟡 **SOLO en `dev-clean`** | Feature que no está en `front` - **INTEGRAR** |
| 🚨 **AMBAS RAMAS (diferente)** | Mismo archivo modificado diferente - **RESOLVER** |
| ✅🟰 **AMBAS RAMAS (igual)** | Mismo cambio en ambas - **OK, sin conflicto** |
| 💡 **RECOMENDACIÓN** | Sugerencia de qué versión usar |

---

## Índice Comparativo
1. [Features exclusivas por rama](#features-exclusivas-por-rama)
2. [Archivos modificados en ambas](#archivos-modificados-en-ambas)
3. [Componentes UI](#componentes-ui)
4. [Backend - Controllers y rutas](#backend-controllers-y-rutas)
5. [Configuración](#configuración)
6. [Base de datos](#base-de-datos)

---

## eatures exclusivas por rama

### 🟣 **SOLO en `front`** - Mantener en merge

| Feature | Archivos | Estado | Acción |
|---------|----------|--------|--------|
| **Sistema expiración JWT** | `useSessionMonitor.js`<br>`SessionExpirationDialog.jsx`<br>`authController.refreshToken()` | ✅ Completo | **MANTENER** - Mejora seguridad |
| **Auto-reload HMR** | `vite.config.js` (server.hmr)<br>`App.jsx` (LazyLoadError) | ✅ Completo | **MANTENER** - Fix error común dev |
| **Tooltip variantes MOA** | `Tooltip.jsx` (dark/neutral/light) | ✅ Completo | **MANTENER** - Coherencia visual |
| **Tabs gradientes** | `Tabs.jsx` (estilos gradient) | ✅ Completo | **MANTENER** - Mejor diseño |
| **Email confirmación orden** | `emailService.sendOrderConfirmationEmail()` | ✅ Completo | **MANTENER** - Feature crítico |
| **Validación stock tiempo real** | `orderController.createOrderFromCart()` | ✅ Completo | **MANTENER** - Previene overselling |
| **Admin Products handlers** | `ProductsAdminPage.jsx` (líneas 49-56) | ⚠️ Parcial | **MANTENER** - Base para CRUD |

---

### 🟡 **SOLO en `dev-clean`** - Integrar en merge

| Feature | Descripción | Prioridad | Acción |
|---------|-------------|-----------|--------|
| ??? | *Verificar con `dev-clean`* | - | **INTEGRAR** según necesidad |

> **TODO:** Listar features exclusivas de `dev-clean` después de comparar ramas

---

## Componentes UI - Comparativa detallada

### ⚠️ `frontend/src/components/ui/Tabs.jsx` - AMBAS RAMAS (diferente)

| Aspecto | 🟣 `front` | 🟡 `dev-clean` | 💡 Recomendación |
|---------|---------|-------------|------------------|
| **TabsList fondo** | Sin fondo (transparente + gap) | `bg-neutral-100` con padding | **USAR `front`** - Más limpio, mejor con gradients |
| **TabsList altura** | Auto (sin h-10) | `h-10` fijo | **USAR `front`** - Flexible con contenido |
| **TabsTrigger activo** | Gradient `from-primary1 to-primary2` + shadow-md | Fondo blanco + borde primary | **USAR `front`** - Más moderno y distintivo |
| **TabsTrigger inactivo** | Texto subtle + hover bg-white/70 | `text-neutral-600` + hover bg-neutral-50 | **USAR `front`** - Mejor contraste |
| **Colores** | Tokens MOA (`--text-weak`, etc) | Hardcoded neutrals | **USAR `front`** - Consistencia design system |

```jsx
// RAMA front (RECOMENDADO)
TabsList: "inline-flex items-center justify-center rounded-2xl p-1 text-(--text-weak) transition gap-1"
TabsTrigger activo: "bg-linear-to-br from-(--color-primary1) to-(--color-primary2) text-white shadow-md"

// RAMA dev-clean
TabsList: "inline-flex h-10 items-center justify-center rounded-2xl bg-neutral-100 p-1 text-neutral-500"
TabsTrigger activo: "bg-white text-primary1 shadow-sm border border-primary1/20"
```

**Decisión:** ✅ **Mantener versión `front`** - Mejor diseño visual y coherencia con tokens MOA

---

### ⚠️ `frontend/src/components/ui/Tooltip.jsx` - AMBAS RAMAS (diferente)

| Aspecto | 🟣 `front` | 🟡 `dev-clean` | 💡 Recomendación |
|---------|---------|-------------|------------------|
| **Estructura variantes** | Objeto {bg, text, arrow} | String plano className | **USAR `front`** - Más mantenible |
| **Variantes disponibles** | 4: dark, neutral, light, primary | 3: neutral, primary, soft | **USAR `front`** - Más opciones |
| **Color flecha** | Mismo color que fondo (style inline) | Hardcoded o inherit | **USAR `front`** - FIX crítico visual |
| **Offset vertical** | 16px (top/bottom) | 12px | **USAR `front`** - No tapa contenido |
| **Colores MOA** | Tokens MOA aplicados | Mix de tokens y hardcoded | **USAR `front`** - 100% coherente |
| **Exports** | TooltipDark, TooltipNeutral, TooltipLight, TooltipPrimary | TooltipNeutral, TooltipPrimary, TooltipSoft | **USAR `front`** - Nomenclatura clara |

```jsx
// RAMA front (RECOMENDADO) - Líneas 6-24
const VARIANT_CLASSES = {
  dark: { bg: "bg-[color:var(--color-dark)]", text: "text-[color:var(--color-text-on-dark)]", arrow: "var(--color-dark)" },
  neutral: { bg: "bg-[color:var(--color-neutral4)]", text: "text-[color:var(--color-text)]", arrow: "var(--color-neutral4)" },
  light: { bg: "bg-[color:var(--color-neutral1)]", text: "text-[color:var(--color-text)]", arrow: "var(--color-neutral1)" },
  primary: { bg: "bg-[color:var(--color-primary1)]", text: "text-[color:var(--color-text-on-dark)]", arrow: "var(--color-primary1)" }
};

// RAMA dev-clean
const VARIANT_CLASSES = {
  neutral: "bg-[color:var(--color-dark)] text-[color:var(--color-text-on-dark)]",
  primary: "bg-[color:var(--color-primary1)] text-[color:var(--color-lightest2)]",
  soft: "bg-[color:var(--color-neutral4)] text-[color:var(--color-text)]"
};
```

**Decisión:** ✅ **Mantener versión `front`** - Flecha correcta + más variantes + mejor estructura

---

### ⚠️ `frontend/src/app/App.jsx` - AMBAS RAMAS (diferente)

| Sección | 🟣 `front` | 🟡 `dev-clean`  | 💡 Recomendación |
|---------|---------|-------------|------------------|
| **Imports** | + `React`, + `WifiOff` | Estándar | **USAR `front`** - Necesario para useEffect |
| **SessionExpirationDialog** | ✅ Incluido (línea ~102) | ❌ No existe | **USAR `front`** - Feature crítico |
| **LazyLoadError** | Auto-reload HMR + icono WifiOff | Emoji ⚠️ estático | **USAR `front`** - Mejor UX dev |
| **LazyLoadError botón** | `rounded-full text-sm px-6` | `rounded-lg px-4` | **USAR `front`** - Más pulido |

```jsx
// RAMA front - LazyLoadError (RECOMENDADO)
const LazyLoadError = () => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (import.meta.hot) {
        console.log('[HMR] Auto-recargando...');
        window.location.reload();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <WifiOff className="h-16 w-16 text-(--color-error)" />
        <h2>Recargando módulo...</h2>
        {/* ... */}
      </div>
    </div>
  );
}

// RAMA dev-clean
const LazyLoadError = () => (
  <div className="flex min-h-[60vh] items-center justify-center p-4">
    <div className="text-center space-y-4 max-w-md">
      <div className="text-red-600 text-4xl">⚠️</div>
      <h2>Error al cargar</h2>
      {/* ... */}
    </div>
  </div>
)
```

**Decisión:** ✅ **Mantener versión `front`** - Auto-reload + SessionExpirationDialog

---

## ⚙️ Configuración - Comparativa

### ⚠️ `frontend/vite.config.js` - AMBAS RAMAS (diferente)

| Sección | 🟣 `front` | 🟡 `dev-clean`  | 💡 Recomendación |
|---------|---------|-------------|------------------|
| **server.hmr** | ✅ `{ overlay: true }` | ❌ No configurado | **USAR `front`** - Mejor debug HMR |
| **server.watch** | ✅ `{ usePolling: false, interval: 100 }` | ❌ No configurado | **USAR `front`** - Optimiza detección cambios |
| **optimizeDeps.include** | ✅ Array con deps críticas | ❌ No configurado | **USAR `front`** - Reduce errores de módulos |
| **Resto config** | Igual (proxy, plugins, build) | Igual | 🟰 **SIN CONFLICTO** |

```javascript
// RAMA front (RECOMENDADO) - Líneas 112-124
export default defineConfig(({ mode }) => {
  // ... resto config
  return {
    // ... plugins, resolve, build
    server: {
      proxy,
      hmr: { overlay: true },
      watch: { usePolling: false, interval: 100 },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    },
  };
})

// RAMA dev-clean
export default defineConfig(({ mode }) => {
  // ... resto config
  return {
    // ... plugins, resolve, build
    server: { proxy },  // Solo proxy
  };
})
```

**Decisión:** ✅ **Mantener versión `front`** - Fix HMR crítico, sin efectos secundarios

---

## 🔧 Backend - Controllers y rutas

### ⚠️ `backend/src/controllers/authController.js` - AMBAS RAMAS (diferente)

| Aspecto | 🟣 `front` | 🟡 `dev-clean` | 💡 Recomendación |
|---------|---------|-------------|------------------|
| **refreshToken()** | ✅ Endpoint completo (línea ~150) | ❌ No existe | **AGREGAR de `front`** - Feature JWT necesario |
| **JWT tiempos diferenciados** | ✅ `JWT_ADMIN_EXPIRES_IN` vs `JWT_EXPIRES_IN` | ❓ Verificar | **AGREGAR de `front`** - Seguridad mejorada |
| **loginUser/loginAdmin response** | ✅ Incluye `expiresAt` | ❓ Verificar | **AGREGAR de `front`** - Frontend necesita fecha |
| **Resto endpoints** | Sin cambios | Sin cambios | 🟰 **SIN CONFLICTO** |

```javascript
// RAMA front - AGREGAR ESTO
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new UnauthorizedError('Token requerido');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.getUserById(decoded.id);
    if (!user) throw new NotFoundError('Usuario');
    
    const newToken = jwt.sign(
      { id: user.usuario_id, email: user.email, role_code: user.rol_code },
      process.env.JWT_SECRET,
      { expiresIn: user.rol_code === 'ADMIN' ? process.env.JWT_ADMIN_EXPIRES_IN : process.env.JWT_EXPIRES_IN }
    );
    
    const expiresIn = user.rol_code === 'ADMIN' ? process.env.JWT_ADMIN_EXPIRES_IN : process.env.JWT_EXPIRES_IN;
    const expiresAt = new Date(Date.now() + ms(expiresIn));
    
    res.json({ token: newToken, expiresAt });
  } catch (error) {
    next(error);
  }
};
```

**Decisión:** ✅ **Agregar `refreshToken` de `front`** + verificar que `dev-clean` no tenga versión diferente

---

### ⚠️ `backend/routes/authRoutes.js` - AMBAS RAMAS (diferente)

| Ruta |  🟣 `front` | 🟡 `dev-clean` | 💡 Recomendación |
|------|---------|-------------|------------------|
| `POST /refresh-token` | ✅ Existe | ❌ No existe | **AGREGAR de `front`** |
| Resto rutas | Iguales | Iguales | 🟰 **SIN CONFLICTO** |

```javascript
// RAMA front - AGREGAR ESTO
router.post('/refresh-token', authController.refreshToken);
```

**Decisión:** ✅ **Agregar ruta de `front`** si no existe en `dev-clean`

---

### ⚠️ `backend/src/controllers/orderController.js` - AMBAS RAMAS (diferente)

| Aspecto | 🟣 `front` | 🟡 `dev-clean` | 💡 Recomendación |
|---------|---------|-------------|------------------|
| **createOrderFromCart()** | ✅ Validación stock tiempo real | ❓ Verificar | **MANTENER `front`** - Previene overselling |
| **createOrderFromCart()** | ✅ Llama `emailService.sendOrderConfirmationEmail()` | ❓ Verificar | **MANTENER `front`** - Email confirmación |
| Resto endpoints | Sin cambios críticos | Sin cambios | ⚠️ **REVISAR diff manual** |

**Decisión:** ⚠️ **Comparar manualmente** - Ambas ramas pueden tener cambios diferentes

---

### ✅ `backend/src/services/emailService.js` - SOLO en `front`

| Feature | Descripción | Acción |
|---------|-------------|--------|
| `sendOrderConfirmationEmail()` | Template HTML responsive completo | **MANTENER** - Feature crítico |

**Decisión:** ✅ **Mantener de `front`** si no existe en `dev-clean`

---

## 💾 Base de datos - Comparativa

### 🟰 `backend/database/schema/DDL.sql` - AMBAS RAMAS (verificar iguales)

| Elemento | 🟣 `front` | 🟡 `dev-clean`  | 💡 Recomendación |
|----------|---------|-------------|------------------|
| **password_reset_tokens** | ✅ Líneas 31-47 completo | ❓ Verificar existe | Si falta en `dev-clean`: **AGREGAR** |
| **estado_orden columna** | ✅ Línea 153 en tabla ordenes | ❓ Verificar existe | Si falta en `dev-clean`: **AGREGAR** |
| **idx_ordenes_estado_creado** | ✅ Línea 169 | ❓ Verificar existe | Si falta en `dev-clean`: **AGREGAR** |
| **Resto tablas** | Base original | Base original | 🟰 **Deberían ser iguales** |

```sql
-- VERIFICAR QUE dev-clean TENGA ESTO:

-- 1. Tabla password_reset_tokens (líneas 31-47)
CREATE TABLE password_reset_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- 2. Columna estado_orden (línea 153)
-- En tabla ordenes:
estado_orden TEXT DEFAULT 'draft' CHECK (estado_orden IN ('draft', 'confirmed', 'cancelled'))

-- 3. Índice estado_orden (línea 169)
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_creado ON ordenes(estado_orden, creado_en);
```

**Decisión:** ⚠️ **VERIFICAR línea por línea** - Si `dev-clean` no tiene estos elementos, agregarlos

---

### 📁 Archivos de migración

| Archivo |  🟣 `front` | 🟡 `dev-clean` | 💡 Recomendación |
|---------|---------|-------------|------------------|
| `password_reset.sql` | ✅ Existe (referencia) | ❓ | **MANTENER** - Solo documentación |
| `migrations/001_add_estado_orden.sql` | ✅ Existe (referencia) | ❓ | **MANTENER** - Solo documentación |

> Estos archivos son **solo para referencia**, el DDL.sql ya los incluye integrados

---

## 🚀 Performance - Estado en ambas ramas

### 🟰 Optimizaciones base (deberían estar en ambas)

| Optimización | Estado esperado | Acción si falta |
|--------------|-----------------|-----------------|
| React.lazy() en 30+ rutas | 🟰 Ambas ramas | Sin acción |
| Code splitting (manualChunks) | 🟰 Ambas ramas | Sin acción |
| React Query staleTime 5min | 🟰 Ambas ramas | Sin acción |
| VirtualizedTable admin | 🟰 Ambas ramas | Sin acción |
| Bundle inicial ~150KB | 🟰 Ambas ramas | Sin acción |

> Estas optimizaciones se implementaron antes del fork de ramas

---

## 🗑️ Archivos eliminados/movidos

### ❌ Eliminados en `front`

| Archivo | Razón | Verificar en `dev-clean` |
|---------|-------|--------------------------|
| `frontend/src/modules/admin/pages/AdminTestPage.jsx` | Playground dev no necesario | Si existe: **ELIMINAR** |
| Ruta `/admin/test` en `App.jsx` | Evitar rutas test en producción | Si existe: **ELIMINAR** |

---

## 📋 Resumen ejecutivo del merge

### Decisiones clave por tipo de cambio

| Tipo | Decisión general | Excepción |
|------|------------------|-----------|
| **UI Components** | Mantener versión `front` | Si `dev-clean` tiene mejora crítica |
| **Backend JWT/Auth** | Agregar features `front` | Preservar lógica de `dev-clean` |
| **Configuración** | Combinar ambas | `front` tiene más optimizaciones |
| **Base de datos** | Verificar DDL consolidado | Agregar lo que falte |
| **Performance** | Ya en ambas | Sin acción |

---

## 🔍 Checklist paso a paso para merge

### PASO 1: Preparación (antes de mergear)

```bash
# 1. Crear rama de backup
git checkout front
git branch front-backup

# 2. Revisar cambios en dev-clean
git checkout dev-clean
git log --oneline front..dev-clean  # Ver commits únicos de dev-clean

# 3. Volver a front para merge
git checkout front
```

### PASO 2: Variables de entorno

```bash
# Verificar que .env tenga:
JWT_ADMIN_EXPIRES_IN=7d        # ← De front
JWT_EXPIRES_IN=24h             # ← De front
SMTP_* (todas las de email)    # ← De front
```

### PASO 3: Merge con estrategia

```bash
# Merge favoreciendo front en conflictos UI
git merge dev-clean

# Resolver conflictos según tabla de decisiones arriba
```

### PASO 4: Archivos críticos - Resolución manual

#### 4.1 `frontend/src/app/App.jsx`
- ✅ Mantener: SessionExpirationDialog de `front`
- ✅ Mantener: LazyLoadError auto-reload de `front`
- ⚠️ Verificar: Rutas de `dev-clean` no perdidas

#### 4.2 `frontend/src/components/ui/Tabs.jsx`
- ✅ Mantener: Versión completa de `front`
- ❌ Descartar: Versión `dev-clean`

#### 4.3 `frontend/src/components/ui/Tooltip.jsx`
- 🟣  Mantener: Versión completa de `front`
-     Descartar: Versión `dev-clean`

#### 4.4 `frontend/vite.config.js`
- 🟣 Mantener: server.hmr + server.watch + optimizeDeps de `front`
- 🟡🟣 Combinar: Resto de config de ambas ramas

#### 4.5 `backend/src/controllers/authController.js`
- 🟣 Agregar: refreshToken() de `front`
- 🟣 Agregar: JWT tiempos diferenciados de `front`
- ⚠️ Preservar: Lógica de login/register de `dev-clean` si difiere

#### 4.6 `backend/routes/authRoutes.js`
- 🟣 Agregar: `router.post('/refresh-token', ...)` de `front`

#### 4.7 `backend/database/schema/DDL.sql`
- ⚠️ Comparar: Línea por línea ambas versiones
- ✅ Asegurar: password_reset_tokens (líneas 31-47)
- ✅ Asegurar: estado_orden (línea 153 + índice 169)

### PASO 5: Verificación post-merge

```bash
# 1. Instalar dependencias
npm install
cd frontend && npm install
cd ../backend && npm install

# 2. Verificar builds
cd frontend && npm run build
cd ../backend && npm run build  # si aplica

# 3. Verificar linters
cd frontend && npm run lint
cd ../backend && npm run lint  # si aplica
```

### PASO 6: Testing funcional

- [ ] ✅ **Login/Logout/Refresh token** funciona
- [ ] ✅ **Tabs dashboard** se ven con gradientes correctos
- [ ] ✅ **Tooltips** muestran flecha del mismo color
- [ ] ✅ **HMR** no muestra error "Failed to fetch module"
- [ ] ✅ **Flujo compra** completo hasta email confirmación
- [ ] ✅ **Admin products** handlers funcionan

### PASO 7: Base de datos

```bash
# Si BD limpia:
psql -d moa_db -f backend/database/schema/DDL.sql

# Verificar tablas críticas:
psql -d moa_db -c "\d password_reset_tokens"
psql -d moa_db -c "\d+ ordenes" | grep estado_orden
```

---

## ⚠️ Conflictos esperados - Resolución rápida

### Conflicto 1: `App.jsx` - SessionExpirationDialog

```jsx
// No existe en dev-clean

// RESOLUCIÓN: Mantener versión de front
```

### Conflicto 2: `Tabs.jsx` - Estilos

```jsx
className="inline-flex h-10 items-center justify-center rounded-2xl bg-neutral-100 p-1 text-neutral-500 transition"

// RESOLUCIÓN: Mantener versión de front (sin h-10, sin bg, con gap)
```

### Conflicto 3: `authController.js` - refreshToken

```javascript
// No existe en dev-clean
module.exports = { login, register, /* ... */ };

// RESOLUCIÓN: Mantener versión de front (agregar refreshToken)
```

---

## 📊 Tabla de archivos modificados - Resumen

| Archivo | front | dev-clean | Acción |
|---------|-------|-----------|--------|
| `frontend/src/app/App.jsx` | 🟣 SessionExp + HMR | ❓ | 🟣 Mantener `front` + revisar rutas `dev-clean` |
| `frontend/src/components/ui/Tabs.jsx` | ✅ Gradientes | ❓ | ✅ Mantener `front` completo |
| `frontend/src/components/ui/Tooltip.jsx` | ✅ 4 variantes | ❓ | ✅ Mantener `front` completo |
| `frontend/vite.config.js` | ✅ HMR config | ❓ | ✅ Mantener `front` + combinar |
| `backend/src/controllers/authController.js` | ✅ refreshToken | ❓ | ✅ Agregar de `front` |
| `backend/routes/authRoutes.js` | ✅ Ruta refresh | ❓ | ✅ Agregar de `front` |
| `backend/database/schema/DDL.sql` | ✅ Completo | ❓ | ⚠️ Verificar línea por línea |
| `frontend/src/hooks/useSessionMonitor.js` | ✅ Nuevo | ❌ | ✅ Agregar de `front` |
| `frontend/src/components/auth/SessionExpirationDialog.jsx` | ✅ Nuevo | ❌ | ✅ Agregar de `front` |
| `backend/src/services/emailService.js` | ✅ Email orden | ❓ | ✅ Verificar/Mantener `front` |

---

## 🎯 Objetivo final del merge

Al finalizar el merge deberías tener:

✅ **De `front`:**
- Sistema JWT refresh token completo
- UI mejorada (Tabs gradientes, Tooltips colores MOA)
- HMR optimizado sin errores de módulos
- Email confirmación de orden
- Validación stock tiempo real

✅ **De `dev-clean`:**
- (Listar features después de revisar rama)
- Mantener lógica/features que no estén en `front`

✅ **Combinado:**
- DDL.sql consolidado con TODO
- Base de código sin duplicaciones
- Performance optimizada
- Tests funcionando

---

**Última actualización:** 21 de noviembre, 2025

> 💡 **Tip:** Imprime esta tabla y marca con ✅ cada paso completado durante el merge
