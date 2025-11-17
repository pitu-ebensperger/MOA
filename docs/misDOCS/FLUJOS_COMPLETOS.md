# Análisis de Flujos Completos - MOA

**Fecha:** 17 de Noviembre, 2025  
**Estado:** Revisión completa de backend y frontend

---

## ✅ FLUJOS COMPLETOS

### 1. Autenticación
**Backend:**
- ✅ `POST /registro` - Registro de usuario (usersRoutes)
- ✅ `POST /login` - Login con JWT (authRoutes)
- ✅ `GET /auth/perfil` - Obtener perfil autenticado (authRoutes)
- ✅ `GET /usuario` - Alias para perfil (authRoutes)
- ✅ Middleware `verifyToken` - Verificación de JWT
- ✅ Middleware `checkLoginCredentials` - Validación de login
- ✅ Middleware `checkRegisterCredentials` - Validación de registro

**Frontend:**
- ✅ `RegisterPage.jsx` - Página de registro
- ✅ `LoginPage.jsx` - Página de login
- ✅ `auth.api.js` - API client con login, register, profile
- ✅ `AuthContext.jsx` - Context para estado de autenticación
- ✅ Token almacenado en localStorage

**Estado:** ✅ COMPLETO

---

### 2. Productos
**Backend:**
- ✅ `GET /productos` - Listar todos los productos (productsRoutes)
- ✅ `GET /producto/:slug` - Detalle de producto por slug (productsRoutes)
- ❌ `POST /admin/productos` - Crear producto (NO EXISTE)
- ❌ `PUT /admin/productos/:id` - Actualizar producto (NO EXISTE)
- ❌ `DELETE /admin/productos/:id` - Eliminar producto (NO EXISTE)

**Frontend:**
- ✅ `products.api.js` - API con list, getById, create, update, remove
- ✅ `ProductsPage.jsx` - Listado de productos
- ✅ `ProductDetailPage.jsx` - Detalle de producto
- ✅ `AdminProductsPage.jsx` - Gestión admin (MOCK)
- ⚠️ Frontend tiene API completa pero backend solo tiene GET

**Estado:** ⚠️ **FALTA CRUD DE ADMIN EN BACKEND**

**Acción requerida:**
```javascript
// Crear en backend/routes/adminRoutes.js o productsRoutes.js
router.post('/admin/productos', verifyToken, verifyAdmin, createProduct);
router.put('/admin/productos/:id', verifyToken, verifyAdmin, updateProduct);
router.delete('/admin/productos/:id', verifyToken, verifyAdmin, deleteProduct);
```

---

### 3. Categorías
**Backend:**
- ✅ `GET /categorias` - Listar categorías (categoriesRoutes)
- ❌ CRUD de categorías para admin (NO EXISTE)

**Frontend:**
- ✅ `products.api.js` - Incluye listCategories
- ✅ `CategoriesContext.jsx` - Context para categorías
- ✅ Uso en navegación y filtros

**Estado:** ⚠️ **SOLO LECTURA, FALTA CRUD ADMIN**

**Acción requerida:**
```javascript
// Crear endpoints admin para categorías
router.post('/admin/categorias', verifyToken, verifyAdmin, createCategory);
router.put('/admin/categorias/:id', verifyToken, verifyAdmin, updateCategory);
router.delete('/admin/categorias/:id', verifyToken, verifyAdmin, deleteCategory);
```

---

### 4. Carrito
**Backend:**
- ✅ `GET /cart` - Obtener carrito (cartRoutes)
- ✅ `POST /cart/add` - Agregar item (cartRoutes)
- ✅ `DELETE /cart/remove/:productId` - Quitar item (cartRoutes)
- ✅ `DELETE /cart/clear` - Vaciar carrito (cartRoutes)
- ✅ `cartController.js` - Controladores completos
- ✅ `cartModel.js` - Modelo con auto-creación, ON CONFLICT para incremento

**Frontend:**
- ✅ `cart-context.js` - Context con strict typing
- ✅ `CartContext.jsx` - Provider
- ✅ Componentes de carrito en `/modules/cart`
- ❌ `cart.api.js` - NO EXISTE (usa fetch directo)

**Estado:** ⚠️ **FALTA API SERVICE EN FRONTEND**

**Acción requerida:**
```javascript
// Crear frontend/src/services/cart.api.js
export const cartApi = {
  get: async () => { /* ... */ },
  add: async (productId, quantity) => { /* ... */ },
  remove: async (productId) => { /* ... */ },
  clear: async () => { /* ... */ }
};
```

---

### 5. Wishlist
**Backend:**
- ✅ `GET /wishlist` - Obtener wishlist (wishlistRoutes)
- ✅ `POST /wishlist/add` - Agregar item (wishlistRoutes)
- ✅ `DELETE /wishlist/remove/:productId` - Quitar item (wishlistRoutes)
- ✅ `wishlistController.js` - Acepta producto_id o productId
- ✅ `wishlistModel.js` - Auto-crea wishlist, ON CONFLICT DO NOTHING

**Frontend:**
- ✅ `WishlistTab.jsx` - Usa rutas correctas (corregido previamente)
- ✅ `wishlist-context.js` - Context definido
- ✅ `WishlistContext.jsx` - Provider
- ❌ `wishlist.api.js` - NO EXISTE (usa fetch directo)

**Estado:** ⚠️ **FALTA API SERVICE EN FRONTEND**

**Acción requerida:**
```javascript
// Crear frontend/src/services/wishlist.api.js
export const wishlistApi = {
  get: async () => { /* ... */ },
  add: async (productId) => { /* ... */ },
  remove: async (productId) => { /* ... */ }
};
```

---

### 6. Pedidos (Orders)
**Backend:**
- ✅ `POST /api/checkout` - Crear orden desde carrito (orderRoutes)
- ✅ `GET /api/orders` - Listar órdenes del usuario (orderRoutes)
- ✅ `GET /api/orders/:id` - Detalle de orden (orderRoutes)
- ✅ `POST /api/orders/:id/payment` - Procesar pago (orderRoutes)
- ✅ `DELETE /api/orders/:id` - Cancelar orden (orderRoutes)
- ✅ `orderController.js` - Controladores completos con validaciones
- ✅ `orderModel.js` - Modelo con transacciones, generación de código
- ❌ `GET /api/orders/user/:userId` - Ruta específica por userId (NO EXISTE pero GET /api/orders funciona)
- ⚠️ `GET /admin/pedidos` - Stub 501 (adminRoutes)
- ⚠️ `GET /admin/pedidos/:id` - Stub 501 (adminRoutes)

**Frontend:**
- ✅ `orders.api.js` - API completa (usa mocks o remote)
- ✅ `OrdersTab.jsx` - Historial de pedidos en perfil
- ✅ `checkout.api.js` - API para checkout
- ✅ Módulo checkout en `/modules/cart`

**Estado:** ⚠️ **FALTA IMPLEMENTAR ADMIN ORDERS**

**Acción requerida:**
```javascript
// Implementar en backend/routes/adminRoutes.js
router.get('/admin/pedidos', verifyToken, verifyAdmin, orderController.getAllOrders);
router.get('/admin/pedidos/:id', verifyToken, verifyAdmin, orderController.getOrderByIdAdmin);
router.patch('/admin/pedidos/:id/estado', verifyToken, verifyAdmin, orderController.updateOrderStatus);
```

---

### 7. Direcciones
**Backend:**
- ✅ `GET /api/direcciones` - Listar direcciones (addressRoutes)
- ✅ `GET /api/direcciones/:id` - Detalle de dirección (addressRoutes)
- ✅ `POST /api/direcciones` - Crear dirección (addressRoutes)
- ✅ `PATCH /api/direcciones/:id` - Actualizar dirección (addressRoutes)
- ✅ `PATCH /api/direcciones/:id/predeterminada` - Set default (addressRoutes)
- ✅ `DELETE /api/direcciones/:id` - Eliminar dirección (addressRoutes)
- ✅ `addressController.js` - Validaciones completas
- ✅ `addressModel.js` - CRUD completo con auto-default

**Frontend:**
- ✅ `address.api.js` - API completa
- ✅ `AddressesSection.jsx` - Componente para gestionar direcciones
- ✅ `AddressesTab.jsx` - Tab en perfil

**Estado:** ✅ COMPLETO

---

### 8. Usuarios/Perfil
**Backend:**
- ✅ `GET /usuario/:id` - Obtener usuario por ID (usersRoutes)
- ✅ `PATCH /usuario/:id` - Actualizar usuario (usersRoutes)
- ✅ `usersController.js` - getUserById, updateUser
- ✅ `usersModel.js` - findUserModel, createUserModel, updateUserModel

**Frontend:**
- ✅ `users.api.js` - getUserById, updateUser, getAllUsers
- ✅ `ProfilePage.jsx` - Layout con tabs
- ✅ `UserInfoTab.jsx` - Edición de datos personales
- ✅ `OrdersTab.jsx` - Historial de pedidos
- ✅ `WishlistTab.jsx` - Lista de deseos
- ✅ `AddressesTab.jsx` - Direcciones

**Estado:** ✅ COMPLETO

---

### 9. Configuración de Tienda
**Backend:**
- ✅ `GET /api/config` - Obtener configuración (público) (configRoutes)
- ✅ `PUT /api/config` - Actualizar configuración (admin) (configRoutes)
- ✅ `POST /api/config/init` - Inicializar configuración (admin) (configRoutes)
- ✅ `configController.js` - Validaciones (email, URLs)
- ✅ `configModel.js` - getConfig, updateConfig, initializeConfig
- ⚠️ `DDL_CONFIGURACION.sql` - Pendiente de ejecución

**Frontend:**
- ✅ `config.api.js` - getStoreConfig, updateStoreConfig, initializeStoreConfig
- ✅ `StoreSettingsPage.jsx` - Formulario de edición
- ✅ `AdminSettingsPage.jsx` - Tabs de configuración
- ✅ `Footer.jsx` - Consume config dinámica

**Estado:** ⚠️ **FALTA EJECUTAR DDL EN BD**

**Acción requerida:**
```bash
cd backend/database/schema
psql -d moa -f DDL_CONFIGURACION.sql
```

---

### 10. Admin Dashboard
**Backend:**
- ⚠️ Stubs en `adminRoutes.js` (501)
- ❌ Falta implementación real de gestión admin

**Frontend:**
- ✅ `AdminDashboardPage.jsx` - Dashboard principal
- ✅ `AdminProductsPage.jsx` - Gestión de productos (MOCK)
- ✅ `CustomersPage.jsx` - Gestión de clientes
- ✅ `AdminSettingsPage.jsx` - Configuraciones
- ✅ Módulo completo en `/modules/admin`

**Estado:** ⚠️ **FRONTEND COMPLETO, BACKEND CON STUBS**

---

## 📊 RESUMEN GENERAL

### ✅ Flujos 100% Completos (Backend + Frontend):
1. ✅ Autenticación (login, registro, JWT)
2. ✅ Direcciones (CRUD completo)
3. ✅ Usuarios/Perfil (lectura y actualización)

### ⚠️ Flujos Funcionales pero Incompletos:
4. ⚠️ Productos (falta CRUD admin en backend)
5. ⚠️ Categorías (solo lectura, falta CRUD admin)
6. ⚠️ Carrito (falta API service en frontend)
7. ⚠️ Wishlist (falta API service en frontend)
8. ⚠️ Pedidos (falta admin orders en backend)
9. ⚠️ Configuración (falta ejecutar DDL)
10. ⚠️ Admin Dashboard (backend con stubs)

---

## 🚨 ACCIONES PRIORITARIAS

### Prioridad ALTA (Bloqueadores):
1. **Ejecutar DDL de Configuración**
   ```bash
   psql -d moa -f backend/database/schema/DDL_CONFIGURACION.sql
   ```

2. **Crear API services en frontend:**
   - `frontend/src/services/cart.api.js`
   - `frontend/src/services/wishlist.api.js`

### Prioridad MEDIA (Funcionalidad Admin):
3. **Implementar CRUD de Productos en Backend:**
   - POST /admin/productos
   - PUT /admin/productos/:id
   - DELETE /admin/productos/:id

4. **Implementar CRUD de Categorías en Backend:**
   - POST /admin/categorias
   - PUT /admin/categorias/:id
   - DELETE /admin/categorias/:id

5. **Implementar Admin Orders en Backend:**
   - GET /admin/pedidos (listar todos)
   - GET /admin/pedidos/:id (detalle admin)
   - PATCH /admin/pedidos/:id/estado (cambiar estado)

### Prioridad BAJA (Mejoras):
6. **Crear middleware verifyAdmin:**
   ```javascript
   export const verifyAdmin = (req, res, next) => {
     if (req.user.role_code !== 'admin') {
       return res.status(403).json({ error: 'Acceso denegado' });
     }
     next();
   };
   ```

7. **Agregar ruta específica de orders por usuario:**
   - GET /api/orders/user/:userId (opcional, ya funciona con /api/orders)

---

## 📝 NOTAS TÉCNICAS

### Rutas Registradas en index.js:
```javascript
app.use(categoriesRouter);      // ✅
app.use(productsRouter);         // ✅
app.use(userRoutes);             // ✅
app.use(authRoutes);             // ✅
app.use("/api", addressRoutes);  // ✅
app.use(paymentRoutes);          // ✅
app.use(orderRoutes);            // ✅
app.use(configRoutes);           // ✅
app.use(wishlistRoutes);         // ✅
app.use(cartRoutes);             // ✅
// adminRoutes NO está registrado ❌
```

### Modelos Existentes:
- ✅ `usersModel.js`
- ✅ `cartModel.js`
- ✅ `wishlistModel.js`
- ✅ `addressModel.js`
- ✅ `orderModel.js`
- ✅ `configModel.js`
- ✅ `paymentModel.js`
- ❌ `productsModel.js` (NO EXISTE - queries en controller)
- ❌ `categoriesModel.js` (NO EXISTE - queries en controller)

### Controladores Existentes:
- ✅ Todos los controladores mencionados existen
- ⚠️ `productsController.js` - Solo GET (falta CRUD)
- ⚠️ `categoriesController.js` - Solo GET (falta CRUD)

---

## 🎯 CHECKLIST DE COMPLETITUD

### Backend:
- [x] Autenticación completa
- [x] Usuarios CRUD básico
- [ ] Productos CRUD admin
- [ ] Categorías CRUD admin
- [x] Carrito completo
- [x] Wishlist completo
- [x] Direcciones CRUD completo
- [x] Orders usuario completo
- [ ] Orders admin
- [x] Configuración tienda (pendiente DDL)
- [ ] Middleware verifyAdmin

### Frontend:
- [x] Todas las páginas creadas
- [x] Contexts creados
- [ ] cart.api.js
- [ ] wishlist.api.js
- [x] Resto de APIs completas

### Base de Datos:
- [x] Tablas principales
- [ ] Ejecutar DDL_CONFIGURACION.sql
- [x] Seeds básicos

---

**Última actualización:** 2025-11-17  
**Revisado por:** GitHub Copilot
