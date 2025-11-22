# Auditoría de TODOs - Noviembre 2025

## 📊 Resumen Ejecutivo

**Total TODOs encontrados:** 7  
**Ubicación:** Frontend únicamente  
**Backend:** Sin TODOs pendientes

---

## ✅ Verificaciones Completadas

### 1. Campo `public_id` en DDL

**Estado:** ✅ **Implementado correctamente**

**Hallazgo:**
- Campo `public_id` existe en tablas `usuarios` y `productos` (DDL líneas 20, 85)
- Generación implementada con `nanoid()` en:
  - `backend/src/models/usersModel.js` línea 6, 81
  - `backend/src/models/productsModel.js` línea 263
- Usado correctamente en queries de todos los modelos y controllers

**Propósito:**
```javascript
// public_id permite exponer identificadores seguros sin revelar IDs secuenciales
// Ejemplo: /api/products/a1B2c3D4e5 (public_id) vs /api/products/123 (producto_id)
```

**Recomendación:** Mantener campo. Ya está correctamente implementado.

---

### 2. TODOs en `adminController.js`

**Estado:** ✅ **Resueltos**

**Resultado:** No se encontraron TODOs en líneas 851/876 ni en todo el archivo.  
**Acción:** Actualizar TODO.md para reflejar que ya están resueltos.

---

## 📝 TODOs Restantes (Frontend)

### Categoría 1: Admin Productos CRUD (5 TODOs)

#### 1.1 `AdminProductsPage.jsx` - Duplicate (Línea 103)
```javascript
// TODO: Implement duplicate product functionality
```
**Prioridad:** Media  
**Acción sugerida:** Ya documentado en TODO.md alta prioridad (implementar modales CRUD)

#### 1.2 `AdminProductsPage.jsx` - Delete (Línea 109)
```javascript
// TODO: Implement delete product functionality
```
**Prioridad:** Alta  
**Acción sugerida:** Conectar con API DELETE `/admin/productos/:id` existente

#### 1.3 `ProductsAdminPage.jsx` - View Detail (Línea 42)
```javascript
// TODO: Navigate to product detail page
```
**Prioridad:** Baja  
**Acción sugerida:** Implementar ruta `/admin/products/:id` o abrir drawer detail

#### 1.4 `ProductsAdminPage.jsx` - Edit (Línea 47)
```javascript
// TODO: Open edit modal or navigate to edit page
```
**Prioridad:** Alta  
**Acción sugerida:** Implementar modal/drawer edit con formulario completo

#### 1.5 `ProductsAdminPage.jsx` - Delete API (Línea 57)
```javascript
// TODO: Implement delete API call
```
**Prioridad:** Alta  
**Acción sugerida:** Usar `productsAdminApi.delete(id)` con confirmación

---

### Categoría 2: Observabilidad (1 TODO)

#### 2.1 `ImageWithFallback.jsx` - Sentry (Línea 47)
```javascript
// TODO: Sentry.captureMessage(`Image load error: ${src}`);
```
**Prioridad:** Media  
**Acción sugerida:** Integrar Sentry SDK cuando se configure monitoring producción

**Implementación futura:**
```javascript
import * as Sentry from '@sentry/react';

// En handleError:
if (import.meta.env.PROD) {
  Sentry.captureMessage(`Image load error: ${src}`, 'warning');
}
```

---

### Categoría 3: Refactorización (1 TODO)

#### 3.1 `api-paths.js` - Alias Temporal (Línea 51)
```javascript
uiDemo: "/admin", // TODO: quitar alias temporal cuando UI demo tenga ruta propia
```
**Prioridad:** Baja  
**Acción sugerida:** Remover cuando StyleGuide tenga ruta dedicada (ej: `/style-guide`)

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Alta Prioridad (Próxima Sprint)
1. ✅ Implementar modales CRUD productos (cubre TODOs 1.2, 1.4, 1.5)
2. ✅ Integrar Sentry SDK (cubre TODO 2.1 + 21 placeholders más)

### Fase 2: Media Prioridad
3. ✅ Implementar duplicate product (TODO 1.1)
4. ✅ Agregar view detail page (TODO 1.3)

### Fase 3: Refactorización
5. ✅ Limpiar alias temporal api-paths (TODO 3.1)

---

## 📚 Documentación de Referencia

- **Producto CRUD:** Ya documentado en `TODO.md` línea 36-37
- **Sentry Integration:** Pendiente de crear guía (ver `PRODUCTION_ENV_CHECKLIST.md`)
- **Admin Routes:** Revisar `backend/routes/adminRoutes.js` para APIs disponibles

---

## 🔍 Herramientas de Búsqueda Usadas

```bash
# Backend TODOs
grep -r "// TODO" backend/src/**

# Frontend TODOs
grep -r "// TODO" frontend/src/**

# public_id usage
grep -r "public_id" backend/src/**
grep -r "public_id" backend/database/schema/DDL.sql
```

---

**Fecha:** 21 noviembre 2025  
**Auditor:** GitHub Copilot  
**Estado:** 7 TODOs restantes (0 críticos, 5 alta prioridad, 2 media/baja)
