# Auditoría de Limpieza - MOA Project
**Fecha:** 22 de noviembre, 2025

---

## 🔍 Problemas Detectados

### 1. ❌ CRÍTICO: .gitignore ignora TODO y docs
**Problema:** El `.gitignore` anterior tenía:
```gitignore
docs/*.md
docs/**/*.md
TODO.md
```
Esto ELIMINABA del repo toda la documentación importante.

**Solución aplicada:** ✅
- Removidas las líneas que ignoran docs
- Solo se ignoran drafts: `docs/drafts/` y `*.draft.md`
- TODO.md ahora visible en git

---

### 2. 🔧 Archivos trackeados incorrectamente
**Problema:** `frontend/.vscode/tasks.json` estaba en git

**Solución aplicada:** ✅
```bash
git rm -r --cached frontend/.vscode
```

**Actualización .gitignore:** ✅
```gitignore
.vscode/
**/.vscode/
```

---

### 3. 📊 Componentes DataTable duplicados

#### Inventario actual:
| Archivo | Líneas | Uso | Estado |
|---------|--------|-----|--------|
| `DataTable.jsx` | 210 | 2 imports (OrdersAdminPageV2, OrdersTable) | ⚠️ Deprecar |
| `DataTableV2.jsx` | 309 | 3 imports (AdminCategories, AdminProducts) | ⚠️ Deprecar |
| `UnifiedDataTable.jsx` | **637** | 1 import | ✅ **MANTENER** |
| `VirtualizedTable.jsx` | 131 | No usado directamente | ℹ️ Feature en Unified |
| `TableToolbar.jsx` | 6.2K | Usado en múltiples | ✅ Mantener |
| `UnifiedTableToolbar.jsx` | 20K | 0 usos | ⚠️ Evaluar |

#### Recomendación:
**`UnifiedDataTable.jsx` es el componente consolidado que combina:**
- TanStack Table v8
- Virtualización opcional (características de VirtualizedTable)
- Todas las features de DataTableV2
- Diseño MOA consistente

**Plan de migración:**
1. Migrar `AdminCategoriesPage.jsx` de DataTableV2 → UnifiedDataTable
2. Migrar `AdminProductsPage.jsx` de DataTableV2 → UnifiedDataTable
3. Migrar `OrdersAdminPageV2.jsx` de TanstackDataTable → UnifiedDataTable
4. Migrar `OrdersTable.jsx` de TanstackDataTable → UnifiedDataTable
5. Eliminar `DataTable.jsx` y `DataTableV2.jsx`
6. Actualizar exports en `index.js`

---

### 4. 📁 Archivos con sufijos de versión

#### Encontrados:
- `DataTableV2.jsx` → Debería ser reemplazado por UnifiedDataTable
- `OrdersAdminPageV2.jsx` → El nombre sugiere que hay/hubo una v1

#### Verificación:
```bash
# Buscar si existe OrdersAdminPage.jsx (v1)
find . -name "OrdersAdminPage.jsx" -not -name "*V2*"
```

**Resultado:** ✅ No existe v1, el V2 es la única versión activa

**Acción:** 
- Mantener `OrdersAdminPageV2.jsx` por ahora (es la versión activa)
- Considerar renombrar a `OrdersAdminPage.jsx` en el futuro

---

### 5. 🗂️ Estructura de carpetas

#### Estado actual:
```
frontend/src/
├── app/                    ✅ Claro
├── components/             ✅ Organizado
│   ├── data-display/       ✅ Pero con duplicados
│   ├── error/              ✅
│   ├── layout/             ✅
│   ├── shadcn/ui/          ⚠️ Mezcla shadcn + custom
│   └── ui/                 ⚠️ Mezcla custom + radix
├── config/                 ✅
├── context/                ⚠️ Archivos con nombres duplicados
├── hooks/                  ✅
├── modules/                ✅ Organizado por feature
├── routes/                 ✅
├── services/               ✅
├── styles/                 ✅
└── utils/                  ✅
```

#### Problemas en `/context`:
```bash
# Encontrar archivos con nombres similares
ls -1 context/ | grep -i auth
```

Resultado:
- `AuthContext.jsx` (PascalCase)
- `auth-context.js` (kebab-case)
- `AuthOptimized.jsx`

**Acción:** Verificar si son duplicados o versiones diferentes

---

### 6. 🎯 Convenciones de nombres inconsistentes

#### Patrón detectado:
- Algunos: `kebab-case.js` (auth-context.js, cart-context.js)
- Otros: `PascalCase.jsx` (AuthContext.jsx, CartContext.jsx)

**Decisión de convención MOA:**
```
✅ Componentes React: PascalCase.jsx
✅ Utilidades/helpers: camelCase.js  
✅ Configs: camelCase.js
✅ Contexts: PascalCase.jsx (son componentes React)
```

#### Archivos a renombrar:
```
context/auth-context.js → AuthContext.jsx (si es el mismo)
context/cart-context.js → CartContext.jsx (si es el mismo)
context/categories-context.js → CategoriesContext.jsx
context/order-context.js → OrderContext.jsx
context/user-context.js → UserContext.jsx
context/wishlist-context.js → WishlistContext.jsx
```

**⚠️ IMPORTANTE:** Antes de renombrar, verificar si son duplicados o archivos diferentes.

---

### 7. 🗄️ Archivos en backend

#### Revisar:
```bash
find backend/src -name "*Controller*.js" | grep -i "admin\|order"
```

¿Existen duplicados tipo `orderController.js` + `orderAdminController.js`?

---

## 📋 Plan de Acción Propuesto

### FASE 1: Limpieza inmediata (segura) ✅ COMPLETADO
- [x] Corregir .gitignore (docs y TODO.md visibles)
- [x] Remover .vscode trackeado
- [x] Commit de cambios de .gitignore

### FASE 2: Auditoría de duplicados (requiere revisión manual)
- [ ] Comparar archivos context kebab-case vs PascalCase
- [ ] Verificar si AuthOptimized.jsx se usa o es experimental
- [ ] Listar todos los archivos *V2*, *Old, *Backup

### FASE 3: Consolidación de componentes
- [ ] Migrar todas las tablas a UnifiedDataTable
- [ ] Eliminar DataTable.jsx y DataTableV2.jsx
- [ ] Actualizar imports en todos los archivos

### FASE 4: Estandarización de nombres
- [ ] Renombrar contexts a PascalCase.jsx (después de verificar duplicados)
- [ ] Renombrar OrdersAdminPageV2 → OrdersAdminPage (opcional)
- [ ] Verificar consistencia en backend controllers

### FASE 5: Reorganización de estructura (opcional)
- [ ] Consolidar components/ui y components/shadcn/ui
- [ ] Documentar estructura final en ARCHITECTURE.md

---

## 🎯 Próximos Pasos Inmediatos

### 1. Verificar contexts duplicados
```bash
cd frontend/src/context
wc -l *.js *.jsx
diff AuthContext.jsx auth-context.js
```

### 2. Buscar más duplicados
```bash
find . -type f \( -name "*.jsx" -o -name "*.js" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -exec basename {} \; | sort | uniq -d
```

### 3. Listar archivos con sufijos sospechosos
```bash
find . -type f \( 
  -name "*Old.*" -o 
  -name "*Backup.*" -o 
  -name "*V2.*" -o 
  -name "*Copy.*" -o 
  -name "*Test.*" -o 
  -name "*Demo.*" 
\) -not -path "*/node_modules/*"
```

---

## ✅ Verificaciones Post-Limpieza

- [ ] `npm run -w frontend build` sin errores
- [ ] `npm run -w backend test` pasa todos los tests
- [ ] Git status no muestra archivos .vscode o dist/
- [ ] Todos los imports de DataTable resuelven correctamente
- [ ] TODO.md visible en git log

---

## 📊 Métricas

**Antes de limpieza:**
- Componentes DataTable: 4 archivos (DataTable, DataTableV2, Unified, Virtualized)
- Archivos .vscode trackeados: 1
- docs/*.md ignorados: SÍ ❌
- TODO.md ignorado: SÍ ❌

**Después de FASE 1:**
- Archivos .vscode trackeados: 0 ✅
- docs/*.md ignorados: NO ✅
- TODO.md ignorado: NO ✅

**Meta FASE 3:**
- Componentes DataTable: 1 (UnifiedDataTable) ✅

---

## 🚨 Warnings

⚠️ **NO ejecutar renombres masivos sin verificar primero**
⚠️ **Hacer backup antes de eliminar archivos**
⚠️ **Verificar cada duplicado manualmente antes de eliminar**

---

## 📝 Notas Adicionales

- `UnifiedDataTable` fue creado específicamente para consolidar 3 versiones anteriores
- El componente tiene 637 líneas pero incluye todas las features necesarias
- Documentación inline completa con ejemplos de uso
- Soporta virtualización opcional para grandes datasets
- Compatible con la estética MOA
