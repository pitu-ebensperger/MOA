# CRUD Productos - Backend

## Descripción

Sistema completo de gestión de productos para MOA marketplace, con operaciones CRUD, gestión de stock, filtros avanzados y búsqueda.

## Estructura de Archivos

```
backend/
├── src/
│   ├── models/
│   │   └── productsModel.js        # Modelo con operaciones de base de datos
│   └── controllers/
│       └── productsController.js   # Controlador con lógica de negocio
└── routes/
    └── productsRoutes.js          # Rutas públicas y de admin
```

## API Endpoints

### Rutas Públicas

#### GET `/api/productos`
Obtener productos con filtros y paginación.

**Query Parameters:**
- `page` (int): Número de página (default: 1)
- `limit` (int): Elementos por página (default: 20, max: 100)
- `search` (string): Búsqueda en nombre, descripción y SKU
- `categoryId` (int): Filtrar por categoría
- `status` (string): Filtrar por estado (activo, inactivo, descontinuado)
- `minPrice` (int): Precio mínimo en centavos
- `maxPrice` (int): Precio máximo en centavos
- `onlyLowStock` (boolean): Solo productos con stock bajo
- `sortBy` (string): Campo de ordenamiento (nombre, precio_cents, stock, created_at, updated_at)
- `sortOrder` (string): Orden (ASC, DESC)

**Ejemplo:**
```bash
GET /api/productos?page=1&limit=10&search=mesa&categoryId=1&sortBy=precio_cents&sortOrder=ASC
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "publicId": "abc123",
      "categoryId": 1,
      "categoryName": "Mesas",
      "name": "Mesa de Comedor",
      "slug": "mesa-de-comedor",
      "sku": "TBL-001",
      "priceCents": 150000,
      "compareAtPriceCents": 180000,
      "stock": 10,
      "status": "activo",
      "description": "Mesa de comedor elegante...",
      "shortDescription": "Mesa elegante para 6 personas",
      "imageUrl": "https://example.com/image.jpg",
      "gallery": ["url1", "url2"],
      "badge": ["nuevo", "oferta"],
      "tags": ["comedor", "madera"],
      "color": "Negro",
      "material": "Madera de roble",
      "dimensions": {"width": 180, "height": 75, "depth": 90},
      "weight": 45.5,
      "specs": {"material": "roble", "finish": "lacado"},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "search": "mesa",
    "categoryId": 1,
    "status": null,
    "minPrice": null,
    "maxPrice": null,
    "onlyLowStock": false
  }
}
```

#### GET `/api/productos/search`
Búsqueda de productos (limitada a productos activos).

**Query Parameters:**
- `q` (string, required): Término de búsqueda (mínimo 2 caracteres)
- `category` (int): Filtrar por categoría
- `minPrice` (int): Precio mínimo
- `maxPrice` (int): Precio máximo
- `page` (int): Página
- `limit` (int): Límite (max 50 para búsqueda pública)
- `sortBy` (string): Campo de ordenamiento
- `sortOrder` (string): Orden

#### GET `/api/producto/:slug`
Obtener producto por slug (vista pública).

#### GET `/api/productos/:id`
Obtener producto por ID o public_id.

### Rutas de Admin (Requieren autenticación)

#### POST `/api/admin/productos`
Crear nuevo producto.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "categoria_id": 1,
  "nombre": "Mesa de Comedor Elegante",
  "slug": "mesa-comedor-elegante",
  "sku": "TBL-002",
  "precio_cents": 150000,
  "compare_at_price_cents": 180000,
  "stock": 5,
  "status": "activo",
  "descripcion": "Mesa de comedor elegante de madera...",
  "descripcion_corta": "Mesa elegante para 6 personas",
  "img_url": "https://example.com/image.jpg",
  "gallery": ["url1", "url2"],
  "badge": ["nuevo"],
  "tags": ["comedor", "madera"],
  "color": "Negro",
  "material": "Madera de roble",
  "dimensions": {"width": 180, "height": 75, "depth": 90},
  "weight": 45.5,
  "specs": {"material": "roble", "finish": "lacado"}
}
```

**Campos Requeridos:**
- `categoria_id` (int): ID de categoría existente
- `nombre` (string): Nombre del producto
- `slug` (string): URL slug único
- `sku` (string): SKU único
- `precio_cents` (int): Precio en centavos

#### PUT `/api/admin/productos/:id`
Actualizar producto existente.

**Body:** Los mismos campos que crear, todos opcionales.

#### DELETE `/api/admin/productos/:id`
Eliminar producto (soft delete por defecto).

**Query Parameters:**
- `permanent` (boolean): true para eliminación permanente

#### PATCH `/api/admin/productos/:id/stock`
Actualizar stock del producto.

**Body:**
```json
{
  "quantity": 10,
  "operation": "set"  // "set", "add", o "subtract"
}
```

#### GET `/api/admin/productos/stock/low`
Obtener productos con stock bajo.

**Query Parameters:**
- `threshold` (int): Umbral de stock bajo (default: 5)

#### GET `/api/admin/productos/stats`
Obtener estadísticas de productos.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 120,
    "inactive": 25,
    "lowStock": 8,
    "outOfStock": 3,
    "averagePriceCents": 95000,
    "totalStock": 1250
  }
}
```

## Modelo de Datos

### Métodos del Modelo (productsModel)

- `getAll(options)`: Obtener productos con filtros
- `getById(id)`: Obtener por ID
- `getByPublicId(publicId)`: Obtener por public_id
- `getBySlug(slug)`: Obtener por slug
- `create(productData)`: Crear producto
- `update(id, productData)`: Actualizar producto
- `softDelete(id)`: Eliminación suave
- `hardDelete(id)`: Eliminación permanente
- `slugExists(slug, excludeId)`: Verificar slug único
- `skuExists(sku, excludeId)`: Verificar SKU único
- `updateStock(id, quantity)`: Actualizar stock
- `getLowStockProducts(threshold)`: Productos stock bajo
- `getStats()`: Estadísticas

### Validaciones

1. **Campos Requeridos:** categoria_id, nombre, slug, sku, precio_cents
2. **Unicidad:** slug y sku deben ser únicos
3. **Categoría:** Debe existir en la tabla categorias
4. **Precios:** No pueden ser negativos
5. **Stock:** No puede ser negativo
6. **Status:** Solo 'activo', 'inactivo', 'descontinuado'
7. **Eliminación:** No permite eliminar productos con órdenes asociadas

### Características Especiales

1. **Public ID:** Cada producto tiene un public_id único generado con nanoid
2. **Soft Delete:** Por defecto, eliminar cambia status a 'inactivo'
3. **Stock Management:** Operaciones seguras de stock con validación
4. **Search:** Búsqueda en nombre, descripción y SKU
5. **Filtros Avanzados:** Por categoría, precio, stock, estado
6. **Paginación:** Eficiente con conteo total
7. **Ordenamiento:** Por cualquier campo válido
8. **Joins:** Incluye información de categoría en consultas

## Manejo de Errores

- **400 Bad Request:** Validaciones fallidas, datos inválidos
- **401 Unauthorized:** Token inválido o faltante
- **403 Forbidden:** No es admin
- **404 Not Found:** Producto no encontrado
- **500 Internal Server Error:** Error del servidor

## Seguridad

- Todas las rutas de admin requieren token JWT válido
- Verificación de rol de administrador
- Validación de entrada exhaustiva
- Prevención de SQL injection
- Sanitización de datos de entrada

## Ejemplos de Uso

### Crear Producto
```bash
curl -X POST http://localhost:5000/api/admin/productos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 1,
    "nombre": "Mesa Moderna",
    "slug": "mesa-moderna",
    "sku": "TBL-003",
    "precio_cents": 120000,
    "stock": 8,
    "descripcion": "Mesa moderna de diseño..."
  }'
```

### Buscar Productos
```bash
curl "http://localhost:5000/api/productos/search?q=mesa&category=1&minPrice=50000&maxPrice=200000"
```

### Actualizar Stock
```bash
curl -X PATCH http://localhost:5000/api/admin/productos/1/stock \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "operation": "add"}'
```

## Testing

Para probar las operaciones CRUD:

1. Crear producto con datos mínimos
2. Verificar que aparece en listado
3. Actualizar campos opcionales
4. Probar filtros y búsqueda
5. Gestionar stock
6. Probar eliminación suave
7. Verificar estadísticas

## Próximos Pasos

1. Implementar imágenes múltiples con upload
2. Agregar variantes de producto
3. Sistema de reviews y ratings
4. Inventario por ubicación
5. Alertas de stock bajo
6. Historial de cambios
7. Importación masiva desde CSV