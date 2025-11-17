# 📊 Documentación de Endpoints y Migración Frontend-Backend

**Proyecto:** MOA  
**Fecha:** Noviembre 15, 2025  
**Estado:** Transición de mocks a backend real

---

## 🎯 Conceptos Clave

### ¿Qué es un "stub"?

Un **stub** es una implementación temporal/placeholder de un endpoint que devuelve una respuesta mínima mientras aún no se desarrolla la lógica real.

**Código HTTP 501 (Not Implemented)**: indica que el servidor reconoce la ruta pero todavía no tiene **implementación funcional** (es decir, no consulta la base de datos, no procesa datos reales, solo responde "esto aún no está listo").

**Ejemplo de stub:**
```javascript
router.get("/productos", (req, res) => {
  res.status(501).json({ message: "Listado de productos no implementado" });
});
```

Esto permite que el frontend pueda hacer `fetch("/productos")` sin error 404, pero recibe un 501 avisando que falta implementar la lógica real (consultas SQL, filtros, paginación, etc.).

### ¿Qué significa "Protegido"?

Un endpoint **protegido** requiere que el usuario esté **autenticado** (tenga un token JWT válido). El backend verifica el token antes de procesar la petición.

**Cómo funciona:**
1. Frontend envía token en header: `Authorization: Bearer TOKEN_AQUI`
2. Backend usa middleware `verifyToken` para validar
3. Si token es válido → procesa la petición
4. Si token es inválido/faltante → responde **401 Unauthorized**

**Ejemplo de ruta protegida:**
```javascript
router.get("/auth/perfil", verifyToken, getUser);
// ☝️ verifyToken valida el token antes de llamar getUser
```

**Rutas públicas vs protegidas:**
- 🔓 **Públicas**: `/login`, `/registro`, `/categorias`, `/productos` → cualquiera puede acceder
- 🔒 **Protegidas**: `/auth/perfil`, `/admin/pedidos`, `/:userId/cart` → requieren token válido

---

## 📋 Tabla Completa de Endpoints

| **Endpoint** | **Método** | **Protegido** | **Fetch desde (Frontend)** | **Respuesta Esperada (Frontend)** | **Respuesta Real (Backend)** | **Estado** | **Notas/Diferencias** |
|-------------|-----------|---------------|----------------------------|-----------------------------------|------------------------------|-----------|----------------------|
| `/login` | POST | ❌ No | `auth.api.js` → `authApi.login()` | `{ token: string, user: { nombre, email, telefono, rol, role_code } }` | ✅ Igual | ✅ **Implementado** | Validado con `checkLoginCredentials` |
| `/registro` | POST | ❌ No | `auth.api.js` → `authApi.register()` | `{ message, user: {...} }` (o solo `{ token?, user }`) | ✅ Igual | ✅ **Implementado** | Validado con `checkRegisterCredentials`, código 201 |
| `/auth/perfil` | GET | ✅ Sí (token) | `auth.api.js` → `authApi.profile()` | Objeto plano: `{ nombre, email, telefono, rol, role_code }` | ✅ Igual | ✅ **Implementado** | Ahora devuelve objeto (no array) |
| `/usuario` | GET | ✅ Sí (token) | *(no usado en frontend)* | Objeto plano perfil | ✅ Igual | ✅ **Implementado** | Alias de `/auth/perfil` (más semántico) |
| `/categorias` | GET | ❌ No | `products.api.js` → `productsApi.listCategories()` | Array de `{ id, name, slug, description, coverImage }` | ✅ Igual | ✅ **Implementado** | Columnas SQL aliasadas a camelCase |
| `/productos` | GET | ❌ No | `products.api.js` → `productsApi.list(params)` | `{ items: Product[], total: number, page: { offset, limit } }` | ❌ Stub 501 | 🚧 **Stub** | Filtros esperados: `q`, `category`, `minPrice`, `maxPrice`, `page`, `limit` |
| `/producto/:id` | GET | ❌ No | `products.api.js` → `productsApi.getById(id)` | Objeto `Product` normalizado | ❌ Stub 501 | 🚧 **Stub** | Debe buscar por `producto_id` o `public_id` o `slug` |
| *`/productos`* | *POST* | *✅ Sí (admin)* | *`products.api.js` → `productsApi.create(payload)`* | *Producto creado* | *No existe* | *❌ Falta* | *Recomendado para admin CRUD* |
| *`/producto/:id`* | *PUT* | *✅ Sí (admin)* | *`products.api.js` → `productsApi.update(id, patch)`* | *Producto actualizado* | *No existe* | *❌ Falta* | *Recomendado para admin CRUD* |
| *`/producto/:id`* | *DELETE* | *✅ Sí (admin)* | *`products.api.js` → `productsApi.remove(id)`* | *`{ ok: true, removedId }`* | *No existe* | *❌ Falta* | *Opcional, para admin* |
| `/home` | GET | ❌ No | `home.api.js` → `homeApi.getLanding()` | `{ hero, categories, featuredProducts, editorialSections, testimonials, contact }` | ❌ Stub 501 | 🚧 **Stub** | Puede reusar `/categorias` y destacar productos |
| `/admin/pedidos` | GET | ✅ Sí (token) | `orders.api.js` → `ordersApi.list(params)` | `{ items: Order[], total, totalPages, page }` | ❌ Stub 501 | 🚧 **Stub** | Filtros: `status`, `q`, `page`, `limit` |
| `/admin/pedidos/:id` | GET | ✅ Sí (token) | `orders.api.js` → `ordersApi.getById(id)` | Objeto `Order` con `items, payment, shipment, address, userName, userEmail` | ❌ Stub 501 | 🚧 **Stub** | JOIN con tablas pedidos, items, usuarios, direcciones |
| *`/:userId/cart`* | *GET/POST* | *✅ Sí* | *No hay servicio dedicado aún* | *Carrito del usuario* | *No existe* | *❌ Falta* | *Recomendado: GET y POST/PATCH para agregar items* |
| *`/:userId/checkout`* | *POST* | *✅ Sí* | *No hay servicio dedicado* | *Crear pedido desde carrito* | *No existe* | *❌ Falta* | *Recomendado para finalizar compra* |
| *`/:userId/wishlist`* | *GET/POST/DELETE* | *✅ Sí* | *No hay servicio dedicado* | *Wishlist del usuario* | *No existe* | *❌ Falta* | *Opcional, según prioridad* |
| *`/contacto`* | *POST* | *❌ No* | *No hay servicio dedicado* | *Envío de mensaje de contacto* | *No existe* | *❌ Falta* | *Opcional, envío email/guardado DB* |

### **Leyenda:**
- ✅ **Implementado**: funciona con backend real
- 🚧 **Stub**: ruta existe pero responde 501 (placeholder)
- ❌ **Falta**: ni stub ni implementación
- *Cursiva*: no está en el código actual pero se sugiere

### **Recomendaciones:**
1. **Mantener**: todos los endpoints actuales son útiles
2. **Implementar prioritario**: `/productos`, `/producto/:id`, `/admin/pedidos*` (remueven dependencia de mocks)
3. **Agregar sugeridos**:
   - `POST /productos` (crear producto, admin)
   - `PUT /producto/:id` (actualizar, admin)
   - Endpoints de carrito (`/:userId/cart`)
   - Checkout (`/:userId/checkout`)
4. **Opcional bajo prioridad**: wishlist, contacto

---

## 🔄 Guía de Ejecución: Frontend vs Backend

| **Paso** | **Con MOCKS (Frontend solo)** | **Con BACKEND (Full Stack)** |
|---------|-------------------------------|------------------------------|
| **1. Variables de entorno** | Crear `frontend/.env`:<br/>`VITE_API_URL=http://localhost:4000`<br/>`VITE_USE_MOCKS=true` | **Backend** - Crear `backend/.env`:<br/>`PORT=4000`<br/>`JWT_SECRET=tu_secreto`<br/>`JWT_EXPIRES_IN=24h`<br/>`DB_HOST=localhost`<br/>`DB_USER=tu_usuario_postgres`<br/>`DB_PASSWORD=tu_password`<br/>`DB_NAME=moa`<br/><br/>**Frontend** - Crear `frontend/.env`:<br/>`VITE_API_URL=http://localhost:4000`<br/>`VITE_USE_MOCKS=false` |
| **2. Instalar dependencias** | `npm install` (raíz)<br/>o `npm install -w frontend` | `npm install` (instala frontend + backend) |
| **3. Base de datos** | ❌ No necesaria | ✅ **Requisito:**<br/>1. PostgreSQL corriendo<br/>2. Crear DB: `npm run -w backend db:create` o manual con `psql`<br/>3. Correr esquema: `psql -U tu_usuario -d moa -f backend/database/schema/DDL.sql`<br/>4. Seedear datos: `npm run -w backend seed:categories && npm run -w backend seed:users` |
| **4. Iniciar Backend** | ❌ No necesario | `npm run -w backend dev` o `node backend/index.js`<br/>Debe mostrar: `Servidor corriendo en puerto 4000` |
| **5. Iniciar Frontend** | `npm run -w frontend dev`<br/>Abre `http://localhost:5173` | `npm run -w frontend dev`<br/>Abre `http://localhost:5173` |
| **6. Probar funcionalidad** | ✅ Auth, productos, categorías, home, pedidos funcionan con datos hardcoded (mocks) | ✅ Login/registro real contra DB<br/>✅ Categorías desde DB<br/>⚠️ Productos/home/pedidos aún 501 (stubs) |
| **7. Lint/Test** | `npm run -w frontend lint` | Igual (lint frontend)<br/>Backend: agregar tests unitarios si quieres |
| **8. Limpieza de Mocks** | ❌ No aplica (sigues usando mocks) | ✅ **Requerido una vez implementes todos los endpoints:**<br/>1. Eliminar carpeta `frontend/src/mocks/`<br/>2. Quitar imports de mocks en servicios<br/>3. Remover condicional `env.USE_MOCKS ? ... : ...`<br/>4. Opcional: eliminar `VITE_USE_MOCKS` de `.env` y código |

### **Comandos Rápidos**

**Solo Frontend (mocks):**
```bash
cd /Users/pitu/Desktop/Entregas/MOA
npm install
npm run -w frontend dev
```

**Full Stack (backend real):**
```bash
# Terminal 1: Backend
cd /Users/pitu/Desktop/Entregas/MOA
npm install
npm run -w backend dev

# Terminal 2: Frontend
npm run -w frontend dev
```

---

## ✅ Cómo Confirmar que está Tomando Datos del Backend (No Mocks)

### **Método 1: Inspeccionar Network en DevTools**
1. Abre la app en el navegador (`http://localhost:5173`)
2. Abre **DevTools** (F12 o Cmd+Opt+I)
3. Ve a la pestaña **Network**
4. Recarga la página o navega por la app
5. Busca peticiones a `http://localhost:4000/...`
6. Haz clic en una petición y ve la respuesta:
   - **Si viene del backend**: verás datos de tu DB real (ej: usuarios que creaste con seed)
   - **Si son mocks**: verás datos hardcoded que están en `frontend/src/mocks/`

**Ejemplo de verificación:**
```
GET http://localhost:4000/categorias
Response:
[
  {
    "id": 1,
    "name": "Muebles",   ← Si es tu data real de DB ✅
    "slug": "muebles",
    ...
  }
]
```

### **Método 2: Modificar un Dato en la DB y Verificar**
1. Cambia algo en la base de datos:
   ```sql
   UPDATE categorias SET nombre = 'Muebles Modernos' WHERE categoria_id = 1;
   ```
2. Recarga el frontend
3. Si ves "Muebles Modernos" → **está usando backend** ✅
4. Si sigue mostrando el nombre viejo → **está usando mocks** ❌

### **Método 3: Revisar Variable de Entorno**
```bash
# En tu terminal donde corre el frontend:
echo $VITE_USE_MOCKS  # Debe mostrar: false

# O busca en frontend/.env:
cat frontend/.env
# Debe tener: VITE_USE_MOCKS=false
```

### **Método 4: Detener Backend y Ver Qué Pasa**
1. Detén el servidor backend (Ctrl+C en la terminal del backend)
2. Intenta usar la app (ej: login, ver categorías)
3. **Si NO funciona** (error de red, 404, "Failed to fetch") → **estaba usando backend** ✅
4. **Si sigue funcionando** normal → **está usando mocks** ❌

### **Método 5: Agregar Console.log Temporal**
En `frontend/src/config/env.js` agrega al final:
```javascript
console.log('🔍 USE_MOCKS:', env.USE_MOCKS);
console.log('🌐 API_BASE_URL:', env.API_BASE_URL);
```

Abre la consola del navegador y verifica:
- `USE_MOCKS: false` ✅
- `API_BASE_URL: http://localhost:4000` ✅

### **Método 6: Buscar en el Código del Servicio**
Abre `frontend/src/services/products.api.js` (por ejemplo) y busca al final:
```javascript
export const productsApi = env.USE_MOCKS ? mockProductsApi : remoteProductsApi;
//                          ^^^^^^^^^^^^^^
// Si USE_MOCKS es false, usa remoteProductsApi (backend real)
```

### **🎯 Checklist Rápido:**
- [ ] `VITE_USE_MOCKS=false` en `frontend/.env`
- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 5173
- [ ] Network tab muestra peticiones a `localhost:4000`
- [ ] Datos cambian cuando modificas la DB
- [ ] App falla si detienes el backend

---

## 🧹 Limpieza de Mocks (Cleanup)

**Limpieza de mocks** = eliminar o desactivar archivos/código que simulan datos cuando ya tienes backend real implementado.

### **Qué incluye:**

#### 1. **Eliminar archivos mock** (una vez implementes endpoints):
- `frontend/src/mocks/api/home.js`
- `frontend/src/mocks/api/products.js`
- `frontend/src/mocks/database/customers.js`
- `frontend/src/mocks/database/orders.js`
- etc.

#### 2. **Eliminar ramas condicionales** en servicios:
```javascript
// ❌ Antes (con toggle):
export const productsApi = env.USE_MOCKS ? mockProductsApi : remoteProductsApi;

// ✅ Después (solo backend):
export const productsApi = remoteProductsApi;
```

#### 3. **Quitar importaciones muertas**:
```javascript
// ❌ Eliminar estas líneas una vez implementes backend:
import { mockCatalogApi } from "../mocks/api/products.js";
import { ordersDb } from "../mocks/database/orders.js";
```

#### 4. **Actualizar `env.js`** (opcional):
- Puedes dejar `USE_MOCKS` pero forzarlo a `false` en producción
- O eliminarlo completamente si ya no lo usas

#### 5. **Documentar** en `README.md`:
- Eliminar referencias a "modo mock"
- Documentar endpoints backend reales
- Actualizar variables de entorno requeridas

### **Cuándo hacerlo:**
- ✅ **Ahora**: puedes limpiar `auth.api.js` (ya no usa mocks)
- ⏳ **Después**: limpia `products.api.js`, `home.api.js`, `orders.api.js` una vez implementes sus stubs

### **Ventajas:**
- ✅ Código más limpio y mantenible
- ✅ Menos confusión sobre qué datos son reales
- ✅ Menos peso en bundle del frontend
- ✅ Evita bugs de "olvidé cambiar USE_MOCKS"

### **Pasos Detallados para Limpiar Mocks:**

#### **Paso 1: Verificar que el endpoint backend esté 100% funcional**
```bash
# Testea el endpoint antes de limpiar:
curl http://localhost:4000/categorias
# Debe devolver data real de la DB
```

#### **Paso 2: Remover condicional en el servicio**
**Ejemplo con `products.api.js`:**
```javascript
// ❌ ANTES (con toggle):
import { mockCatalogApi } from "../mocks/api/products.js";

const mockProductsApi = { ... };
const remoteProductsApi = { ... };

export const productsApi = env.USE_MOCKS ? mockProductsApi : remoteProductsApi;

// ✅ DESPUÉS (solo backend):
const remoteProductsApi = { ... };

export const productsApi = remoteProductsApi;
// Ya no importas mockCatalogApi ni defines mockProductsApi
```

#### **Paso 3: Eliminar imports de mocks**
Busca y elimina líneas como:
```javascript
import { mockCatalogApi } from "../mocks/api/products.js";
import { ordersDb } from "../mocks/database/orders.js";
import { customersDb } from "../mocks/database/customers.js";
```

#### **Paso 4: Eliminar archivos mock (opcional pero recomendado)**
Una vez que **TODOS** los servicios usen backend:
```bash
rm -rf frontend/src/mocks/
```

#### **Paso 5: Remover `USE_MOCKS` de env.js (opcional)**
Si ya no lo usas en ningún servicio:
```javascript
// frontend/src/config/env.js
export const env = {
  API_BASE_URL: (rawEnv.VITE_API_URL ?? "http://localhost:4000").trim(),
  API_TIMEOUT: Number(rawEnv.VITE_API_TIMEOUT) || undefined,
  // ❌ Elimina esta línea si ya no la usas:
  // USE_MOCKS: String(rawEnv.VITE_USE_MOCKS ?? "true").toLowerCase() === "true",
  NODE_ENV: mode,
  IS_DEV: mode === "development",
  IS_PROD: mode === "production",
};
```

#### **Paso 6: Actualizar .env y .env.example**
```bash
# frontend/.env
VITE_API_URL=http://localhost:4000
# VITE_USE_MOCKS=false ← Ya no es necesario si removiste USE_MOCKS del código
```

#### **Paso 7: Verificar que todo funciona**
```bash
# Reinicia frontend si estaba corriendo:
npm run -w frontend dev

# Prueba todas las funcionalidades:
# - Login/registro
# - Ver categorías
# - Ver productos
# - Admin panel
```

#### **Paso 8: Commit y documentar**
```bash
git add .
git commit -m "feat: remove mocks, migrate to backend-only data flow"
```

Actualiza `README.md` indicando que ya no hay modo mock.

---

## 🔧 Cambios Realizados en Backend

### Archivos Modificados:

#### `backend/index.js`
- ✅ Montaje sin prefijos: `/categorias`, `/productos`, `/home`, `/admin/pedidos`
- ✅ Importa nuevos routers: `productsRoutes`, `homeRoutes`, `adminRoutes`

#### `backend/routes/authRoutes.js`
- ✅ Añadido `GET /auth/perfil` (principal)
- ✅ Añadido `GET /usuario` (alias más semántico)

#### `backend/src/controllers/authController.js`
- ✅ `getUser()` devuelve objeto plano (no array)
- ✅ Incluye `rol` y `role_code` en respuesta

#### `backend/src/controllers/categoriesController.js`
- ✅ Columnas SQL aliasadas a camelCase: `id, name, slug, description, coverImage`
- ✅ Devuelve array directo (no `{ data: ... }`)

### Archivos Nuevos (Stubs):

#### `backend/routes/productsRoutes.js`
- 🚧 `GET /productos` (stub 501)
- 🚧 `GET /producto/:id` (stub 501)

#### `backend/routes/homeRoutes.js`
- 🚧 `GET /home` (stub 501)

#### `backend/routes/adminRoutes.js`
- 🚧 `GET /admin/pedidos` (stub 501, protegido con token)
- 🚧 `GET /admin/pedidos/:id` (stub 501, protegido)

---

## 📝 Notas Adicionales

### Variables de Entorno Requeridas:

**Backend (.env):**
```env
PORT=4000
JWT_SECRET=tu_secreto_muy_seguro_aqui
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=moa
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:4000
VITE_USE_MOCKS=false
```

### Testing Endpoints:

**Con curl:**
```bash
# Categorías
curl http://localhost:4000/categorias

# Login
curl -X POST http://localhost:4000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}'

# Perfil (necesitas token del login)
curl http://localhost:4000/auth/perfil \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🎯 Próximos Pasos

1. ✅ **Completado**: Alineación de rutas y formatos (auth, categorías)
2. ⏳ **Pendiente**: Implementar lógica real en stubs:
   - `/productos` (lista con filtros)
   - `/producto/:id` (detalle)
   - `/home` (landing page data)
   - `/admin/pedidos*` (listado y detalle de órdenes)
3. ⏳ **Pendiente**: Limpieza de mocks en servicios ya implementados
4. ⏳ **Pendiente**: Documentar en `README.md` principal
5. ⏳ **Opcional**: Agregar endpoints CRUD admin y carrito/checkout

---

**Última actualización:** Noviembre 15, 2025
