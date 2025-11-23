# Plan de Reorganización Estructural - MOA
**Fecha:** 22 de noviembre, 2025  
**Estado:** Propuesta pendiente de aprobación

---

## ✅ Limpieza Completada (FASE 1)

### Corregido:
- [x] `.gitignore` ya no ignora `docs/` ni `TODO.md`
- [x] Removido `frontend/.vscode/` de git tracking
- [x] Eliminados 19 archivos duplicados con " 2" en el nombre
- [x] Documentación de auditoría creada (`CLEANUP_AUDIT.md`)

### Commits:
- `38a607a` - fix(config): corregir .gitignore para preservar docs y TODO
- `8a9b39a` - chore: mover StyleGuide a branch dev-tools

---

## 🎯 Estado Actual del Proyecto

### Métricas:
```
📊 Total archivos código: 349 (.js/.jsx)
📊 Total tests:           11
📊 Total documentación:   73 (.md)
```

### Estructura Backend: ✅ BIEN ORGANIZADA
```
backend/src/
├── controllers/   (13 controllers)
├── middleware/    (autenticación, errores)
├── models/        (10 models)
├── services/      (email, observability)
└── utils/         (error, validation, env)
```

### Estructura Frontend: ⚠️ REQUIERE ATENCIÓN
```
frontend/src/
├── app/           ✅ Claro (App.jsx, main.jsx)
├── components/    ⚠️ Ver problemas abajo
├── context/       ⚠️ Naming mixto
├── hooks/         ✅ Bien organizado
├── modules/       ✅ Feature-based (11 módulos)
├── routes/        ✅ Configuración de rutas
├── services/      ✅ API clients
├── styles/        ✅ CSS organizados
└── utils/         ✅ Helpers
```

---

## 🔍 Problemas Identificados

### 1. ⚠️ Componentes DataTable Duplicados

#### Estado actual:
| Componente | Líneas | Usado por | Decisión |
|------------|--------|-----------|----------|
| `DataTable.jsx` | 210 | OrdersAdminPageV2, OrdersTable | 🗑️ DEPRECAR |
| `DataTableV2.jsx` | 309 | AdminCategoriesPage, AdminProductsPage | 🗑️ DEPRECAR |
| **`UnifiedDataTable.jsx`** | **637** | CustomersPage | ✅ **MANTENER** |
| `VirtualizedTable.jsx` | 131 | (feature en Unified) | 🗑️ DEPRECAR |

**Impacto:** 4 componentes haciendo lo mismo → **migrar a 1 solo**

---

### 2. 🎨 Estructura `/components` desordenada

#### Problema:
```
components/
├── data-display/        # 12 archivos (4 DataTables!)
├── error/               # 2 archivos ✅
├── layout/              # 3 archivos ✅
├── shadcn/ui/           # 2 archivos shadcn específicos
└── ui/                  # 23 archivos (mezcla shadcn + custom)
    ├── radix/           # 3 componentes Radix
    ├── Button.jsx       # Custom MOA
    ├── button.jsx       # Shadcn?
    └── ...
```

#### Propuesta de reorganización:
```
components/
├── core/                # Componentes base (Button, Input, Badge, etc.)
│   ├── Button.jsx
│   ├── Input.jsx
│   └── ...
├── data/                # Tablas, visualizaciones
│   ├── UnifiedDataTable.jsx
│   ├── TableToolbar.jsx
│   └── ...
├── layout/              # Header, Footer, Sidebar
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ...
├── feedback/            # Errores, loading, toasts
│   ├── ErrorBoundary.jsx
│   ├── Spinner.jsx
│   └── ...
└── radix/               # Wrappers de Radix UI
    ├── Dialog.jsx
    ├── DropdownMenu.jsx
    └── ...
```

**Beneficio:** 
- Estructura más clara
- Fácil encontrar componentes
- Elimina confusión shadcn vs custom

---

### 3. 🏷️ Naming inconsistente en `/context`

#### Problema:
Dos patrones coexistiendo:
```
AuthContext.jsx      (408 líneas - Provider real)
auth-context.js      (25 líneas - Export de context)

CartContext.jsx      (487 líneas - Provider real)  
cart-context.js      (250 líneas - Export de context)
```

#### Patrón descubierto:
- `kebab-case.js` → Exports de `createStrictContext()` (utility)
- `PascalCase.jsx` → Providers completos con lógica

#### ✅ CONCLUSIÓN: **NO son duplicados, son complementarios**

**Acción:** Documentar este patrón en ARCHITECTURE.md

---

### 4. 📦 Archivos con sufijos de versión

#### Encontrados:
- `OrdersAdminPageV2.jsx` → No existe V1, es la única versión activa
- `DataTableV2.jsx` → Hay DataTable.jsx (versión anterior)

#### Decisión:
- **Corto plazo:** Mantener nombres actuales (funciona)
- **Largo plazo:** Renombrar después de consolidar DataTables
  - `OrdersAdminPageV2.jsx` → `OrdersAdminPage.jsx` (cuando sea única)

---

## 📋 Plan de Acción Detallado

### FASE 2: Consolidación de componentes (3-4 horas)

#### 2.1 Migrar a UnifiedDataTable
```bash
# Archivos a modificar:
1. frontend/src/modules/admin/pages/AdminCategoriesPage.jsx
   - Cambiar: DataTableV2 → UnifiedDataTable
   - Props: agregar virtualized={data.length > 100}

2. frontend/src/modules/admin/pages/AdminProductsPage.jsx
   - Cambiar: DataTableV2 → UnifiedDataTable
   - Props: agregar virtualized={data.length > 100}

3. frontend/src/modules/admin/pages/orders/OrdersAdminPageV2.jsx
   - Cambiar: TanstackDataTable → UnifiedDataTable
   - Props: ya tiene paginación manual

4. frontend/src/modules/admin/components/OrdersTable.jsx
   - Cambiar: TanstackDataTable → UnifiedDataTable
```

#### 2.2 Actualizar exports
```javascript
// frontend/src/components/data-display/index.js
export { UnifiedDataTable as DataTable } from './UnifiedDataTable.jsx';
export { UnifiedTableToolbar as TableToolbar } from './UnifiedTableToolbar.jsx';
// Deprecar exports de DataTable.jsx y DataTableV2.jsx
```

#### 2.3 Eliminar archivos obsoletos
```bash
rm frontend/src/components/data-display/DataTable.jsx
rm frontend/src/components/data-display/DataTableV2.jsx
rm frontend/src/components/data-display/VirtualizedTable.jsx
```

#### 2.4 Verificar build
```bash
npm run -w frontend build
# Debe completar sin errores
```

---

### FASE 3: Reorganización de `/components` (2-3 horas)

#### 3.1 Crear nueva estructura
```bash
mkdir -p frontend/src/components/{core,data,layout,feedback,radix}
```

#### 3.2 Mover archivos (con git mv para preservar historia)
```bash
# Core components
git mv frontend/src/components/ui/Button.jsx frontend/src/components/core/
git mv frontend/src/components/ui/Input.jsx frontend/src/components/core/
git mv frontend/src/components/ui/Badge.jsx frontend/src/components/core/
# ... (20+ archivos)

# Data components
git mv frontend/src/components/data-display/* frontend/src/components/data/

# Layout (ya existe, solo mover si necesario)
# Feedback
git mv frontend/src/components/error/* frontend/src/components/feedback/
git mv frontend/src/components/ui/Spinner.jsx frontend/src/components/feedback/

# Radix
git mv frontend/src/components/ui/radix/* frontend/src/components/radix/
```

#### 3.3 Actualizar imports (script automático)
```javascript
// scripts/update-imports.js
const fs = require('fs');
const path = require('path');

const importMappings = {
  '@/components/ui/Button': '@/components/core/Button',
  '@/components/data-display/DataTable': '@/components/data/UnifiedDataTable',
  // ... mapear todos
};

// Buscar y reemplazar en todos los archivos
```

---

### FASE 4: Estandarización de nombres (1 hora)

#### 4.1 Renombrar archivos con sufijos
```bash
# Solo si ya no hay dependencias de versiones anteriores
git mv frontend/src/modules/admin/pages/orders/OrdersAdminPageV2.jsx \
       frontend/src/modules/admin/pages/orders/OrdersAdminPage.jsx

# Actualizar import en App.jsx
```

#### 4.2 Documentar convención de nombres
```markdown
# NAMING_CONVENTIONS.md

## Archivos
- Componentes React: `PascalCase.jsx`
- Hooks: `use*.js` (camelCase)
- Utils/helpers: `camelCase.js`
- Configs: `kebab-case.js`
- Context providers: `PascalCase.jsx`
- Context exports: `kebab-case.js`

## Carpetas
- Features: `kebab-case/` (products, admin, cart)
- Componentes: `kebab-case/` (data-display, layout)
```

---

### FASE 5: Limpieza final (30 min)

#### 5.1 Actualizar .gitignore
```gitignore
# Agregar ignorar archivos de backup explícitamente
*.backup.*
*.old.*
*_backup.*
*_old.*
* 2.*
```

#### 5.2 Eliminar node_modules y reinstalar
```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
```

#### 5.3 Verificar todo funciona
```bash
npm run -w frontend build
npm run -w backend test
npm run -w frontend test
```

---

## 🎯 Objetivos Post-Reorganización

### Métricas esperadas:
```
✅ Componentes DataTable: 1 (UnifiedDataTable)
✅ Estructura clara de /components
✅ Convenciones de nombres documentadas
✅ 0 archivos duplicados
✅ Build sin warnings
✅ Todos los tests pasan
```

### Estructura final `/components`:
```
components/
├── core/         (15-20 archivos)
├── data/         (3-5 archivos)
├── layout/       (3 archivos)
├── feedback/     (4-5 archivos)
└── radix/        (3 archivos)

Total: ~30 archivos organizados en 5 categorías claras
```

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Romper imports al reorganizar
**Mitigación:** 
- Usar `git mv` para preservar historia
- Crear script de actualización de imports
- Probar build después de cada fase

### Riesgo 2: Componentes en uso que no conocemos
**Mitigación:**
- Hacer `grep -r "ComponentName"` antes de eliminar
- Verificar con IDE "Find All References"
- Mantener backup en branch separada

### Riesgo 3: Tests fallan después de reorganizar
**Mitigación:**
- Actualizar paths en `jest.config.js`
- Actualizar `jsconfig.json` con nuevos aliases
- Ejecutar tests después de cada cambio de estructura

---

## 📝 Checklist Pre-Reorganización

- [ ] Hacer backup del proyecto completo
```bash
tar -czf ~/Desktop/MOA-backup-$(date +%Y%m%d).tar.gz --exclude='node_modules' .
```

- [ ] Crear branch para reorganización
```bash
git checkout -b refactor/component-reorganization
```

- [ ] Verificar que tests actuales pasan
```bash
npm run -w frontend test
npm run -w backend test
```

- [ ] Documentar estructura actual
```bash
tree frontend/src/components -L 2 > docs/components-before.txt
```

---

## 🚀 Siguiente Paso Inmediato

**¿Quieres proceder con FASE 2 (Consolidación DataTables)?**

Esto incluye:
1. Migrar 4 páginas a `UnifiedDataTable`
2. Eliminar 3 componentes obsoletos
3. Actualizar exports
4. Verificar build

**Tiempo estimado:** 3-4 horas  
**Riesgo:** Bajo (componentes bien testeados)  
**Beneficio:** Código más mantenible, -500 líneas de código duplicado

---

## 📚 Documentación Relacionada

- `docs/CLEANUP_AUDIT.md` - Auditoría de problemas detectados
- `docs/ARCHITECTURE.md` - (TODO) Documentar patrones de arquitectura
- `docs/NAMING_CONVENTIONS.md` - (TODO) Convenciones de nombres

---

## ✅ Aprobación

- [ ] Revisado por: ___________
- [ ] Fecha aprobación: ___________
- [ ] Iniciar FASE 2: [ ] SÍ  [ ] NO

