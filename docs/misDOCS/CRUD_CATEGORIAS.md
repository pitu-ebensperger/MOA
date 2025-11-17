# CRUD de Categorías - Backend

**Fecha:** 17 de Noviembre, 2025  
**Estado:** ✅ Implementado

---

## 📋 RESUMEN

Se ha implementado el CRUD completo de categorías en el backend con autenticación y autorización.

### Archivos Creados/Modificados:

**NUEVOS:**
- ✅ `/backend/src/models/categoriesModel.js` - Modelo con todos los métodos CRUD
- ✅ `/backend/src/middleware/adminMiddleware.js` - Middleware para verificar permisos de admin

**MODIFICADOS:**
- ✅ `/backend/src/controllers/categoriesController.js` - Agregados 5 nuevos controladores
- ✅ `/backend/routes/categoriesRoutes.js` - Agregadas rutas admin
- ✅ `/backend/src/controllers/authController.js` - JWT ahora incluye role_code
- ✅ `/backend/src/middleware/tokenMiddleware.js` - Extrae role_code del JWT

---

## 🔌 ENDPOINTS DISPONIBLES

### Rutas Públicas:

#### 1. Listar Categorías
```http
GET /categorias
```
**Respuesta:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Muebles",
    "slug": "muebles",
    "description": "Muebles para el hogar",
    "coverImage": "https://..."
  }
]
```

#### 2. Obtener Categoría por ID
```http
GET /categorias/:id
```
**Respuesta:** `200 OK`
```json
{
  "id": 1,
  "name": "Muebles",
  "slug": "muebles",
  "description": "Muebles para el hogar",
  "coverImage": "https://..."
}
```

---

### Rutas Admin (Requieren Autenticación + Permisos):

#### 3. Crear Categoría
```http
POST /admin/categorias
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Decoración",
  "slug": "decoracion",
  "descripcion": "Artículos decorativos",
  "cover_image": "https://..."
}
```

**Validaciones:**
- ✅ `nombre` y `slug` son obligatorios
- ✅ Slug debe ser único
- ✅ Slug solo puede contener: `a-z`, `0-9`, `-`

**Respuesta:** `201 Created`
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": 5,
    "name": "Decoración",
    "slug": "decoracion",
    "description": "Artículos decorativos",
    "coverImage": "https://..."
  }
}
```

#### 4. Actualizar Categoría
```http
PUT /admin/categorias/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Decoración y Accesorios",
  "descripcion": "Artículos decorativos y accesorios"
}
```

**Validaciones:**
- ✅ Verifica que la categoría exista
- ✅ Si se actualiza el slug, valida que no exista
- ✅ Slug solo puede contener: `a-z`, `0-9`, `-`

**Respuesta:** `200 OK`
```json
{
  "success": true,
  "message": "Categoría actualizada exitosamente",
  "data": {
    "id": 5,
    "name": "Decoración y Accesorios",
    "slug": "decoracion",
    "description": "Artículos decorativos y accesorios",
    "coverImage": "https://..."
  }
}
```

#### 5. Eliminar Categoría
```http
DELETE /admin/categorias/:id
Authorization: Bearer {token}
```

**Validaciones:**
- ✅ Verifica que la categoría exista
- ✅ Verifica que NO tenga productos asociados

**Respuesta Exitosa:** `200 OK`
```json
{
  "success": true,
  "message": "Categoría eliminada exitosamente"
}
```

**Error si tiene productos:** `400 Bad Request`
```json
{
  "success": false,
  "message": "No se puede eliminar la categoría porque tiene 15 producto(s) asociado(s)"
}
```

#### 6. Contar Productos de Categoría
```http
GET /admin/categorias/:id/productos/count
Authorization: Bearer {token}
```

**Respuesta:** `200 OK`
```json
{
  "success": true,
  "data": {
    "categoria_id": 1,
    "producto_count": 15
  }
}
```

---

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

### Flujo de Autenticación:

1. **Login:** Usuario hace login en `/login`
   - Backend verifica credenciales
   - Genera JWT con: `id`, `email`, `role_code`, `rol`
   - Retorna token

2. **Requests Protegidas:**
   - Cliente incluye: `Authorization: Bearer {token}`
   - Middleware `verifyToken` valida el token
   - Extrae datos del usuario y los pone en `req.user`
   - Middleware `verifyAdmin` verifica `req.user.role_code === 'admin'`

### Middleware verifyAdmin:

```javascript
// backend/src/middleware/adminMiddleware.js
export const verifyAdmin = (req, res, next) => {
  // Verifica que req.user exista (autenticado)
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  // Verifica que sea admin
  const isAdmin = 
    req.user.role_code === 'admin' || 
    req.user.rol === 'admin';

  if (!isAdmin) {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }

  next();
};
```

---

## 🗄️ MODELO DE DATOS

### Métodos Disponibles en `categoriesModel`:

```javascript
// Lectura
getAll()                    // Todas las categorías
getById(id)                 // Por ID
getBySlug(slug)            // Por slug

// Escritura
create(categoryData)       // Crear nueva
update(id, categoryData)   // Actualizar
delete(id)                 // Eliminar

// Utilidades
slugExists(slug, excludeId) // Verificar si slug existe
countProducts(id)          // Contar productos asociados
```

---

## 📊 CÓDIGOS DE RESPUESTA

| Código | Descripción |
|--------|-------------|
| `200 OK` | Operación exitosa |
| `201 Created` | Recurso creado |
| `400 Bad Request` | Validación fallida o categoría tiene productos |
| `401 Unauthorized` | Token ausente o inválido |
| `403 Forbidden` | Usuario no es admin |
| `404 Not Found` | Categoría no encontrada |
| `500 Internal Server Error` | Error del servidor |

---

## 🧪 TESTING

### Con cURL:

**1. Login (obtener token):**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@moa.cl",
    "password": "admin123"
  }'
```

**2. Listar categorías (público):**
```bash
curl http://localhost:3000/categorias
```

**3. Crear categoría (admin):**
```bash
curl -X POST http://localhost:3000/admin/categorias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "nombre": "Textiles",
    "slug": "textiles",
    "descripcion": "Textiles para el hogar"
  }'
```

**4. Actualizar categoría (admin):**
```bash
curl -X PUT http://localhost:3000/admin/categorias/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "nombre": "Textiles y Telas"
  }'
```

**5. Eliminar categoría (admin):**
```bash
curl -X DELETE http://localhost:3000/admin/categorias/5 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. **Usuarios Existentes:**
Los usuarios existentes necesitarán hacer login nuevamente para obtener un token con el `role_code` actualizado.

### 2. **Slugs:**
- Deben ser únicos
- Solo minúsculas, números y guiones
- Se recomienda generar automáticamente desde el nombre en el frontend

### 3. **Eliminación:**
No se puede eliminar una categoría que tenga productos asociados. Primero debes:
- Reasignar los productos a otra categoría, o
- Eliminar los productos

### 4. **Validación de Imágenes:**
Actualmente `cover_image` acepta cualquier string (URL). Considera agregar:
- Validación de formato de URL
- Subida de imágenes a CDN/Storage
- Validación de tamaño/formato de imagen

---

## 🔄 INTEGRACIÓN CON FRONTEND

- `frontend/src/services/categories.api.js` encapsula los mismos endpoints públicos y admin con soporte para mocks, incluyendo creación, actualización, eliminación y conteo de productos asociados.
- `frontend/src/modules/admin/hooks/useAdminCategories.js` expone las categorías a través de `react-query`, mientras que `frontend/src/modules/admin/utils/categoriesColumns.jsx` prepara las columnas para la tabla.
- Se agregó `frontend/src/modules/admin/pages/AdminCategoriesPage.jsx`, que ofrece un listado admin con tabla, filtros mínimos, drawer para editar/crear y un sistema de alertas locales.
- La ruta `/admin/categorias` se expone en `frontend/src/app/App.jsx` y la navegación admin se actualizó en `frontend/src/modules/admin/components/EntornoAdmin.jsx` para facilitar el acceso.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear `categoriesModel.js`
- [x] Actualizar `categoriesController.js`
- [x] Crear `adminMiddleware.js`
- [x] Actualizar `categoriesRoutes.js`
- [x] Actualizar JWT para incluir `role_code`
- [x] Actualizar `verifyToken` para extraer `role_code`
- [x] Documentar endpoints
- [x] Crear `frontend/src/services/categories.api.js` y mock asociado
- [x] Añadir `useAdminCategories` y columnas reutilizables
- [x] Desarrollar `AdminCategoriesPage.jsx` con drawer y alertas
- [x] Registrar la ruta `/admin/categorias` y la entrada en la navegación del admin
- [ ] Testing manual con cURL

---

## 🐛 TROUBLESHOOTING

### Error: "Acceso denegado"
- Verifica que el token sea válido
- Verifica que el usuario tenga `role_code = 'admin'`
- Si usas usuarios antiguos, haz login nuevamente

### Error: "El slug ya existe"
- Elige un slug diferente
- Los slugs deben ser únicos en toda la tabla

### Error: "No se puede eliminar la categoría"
- La categoría tiene productos asociados
- Reasigna o elimina los productos primero
- Usa el endpoint `/admin/categorias/:id/productos/count` para verificar

---

**Última actualización:** 2025-11-17  
**Implementado por:** GitHub Copilot  
**Estado:** ✅ Completo y listo para testing
