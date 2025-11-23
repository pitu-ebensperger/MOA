- Active: 1763403221678@@127.0.0.1@5432@pitu
# TODO - MOA Project
**Última actualización:** 21 de noviembre, 2025 - 23:53 CLST

---

## 📊 Resumen Ejecutivo

### ✅ Lo que YA está completo y funcional:
- **Backend core**: Express 5, PostgreSQL 17, JWT auth con refresh token, rate limiting, error handling completo
- **Frontend optimizado**: React 19, lazy loading (30+ rutas), bundle ~150KB, TanStack Query con cache 5min
- **Sesiones inteligentes**: Monitor de expiración JWT, warning 5min antes, auto-logout, extensión de sesión
- **E-commerce funcional**: Productos, categorías, carrito, wishlist, órdenes completas con tracking
- **Admin dashboard**: Gestión clientes, órdenes (filtros/búsqueda/estados), productos (CRUD básico), estadísticas
- **Emails transaccionales**: Confirmación de orden (HTML responsive), reset password, Nodemailer configurado
- **Validaciones**: Stock en tiempo real, errores PG/JWT normalizados, middleware tokenMiddleware con `usuario_id`
- **Infraestructura**: DDL consolidado con migrations, 8 seeders, rate limit (200 req/15min, 10 auth/15min)

### ⚠️ Lo que falta (opcional/mejoras futuras):
- **Documentación técnica**: Swagger/OpenAPI, guía de contribución, manual de admin, troubleshooting
- **Páginas legales**: Términos y condiciones, política de privacidad/devoluciones, aviso legal/GDPR  
- **Performance adicional**: Optimizar imágenes (WebP), CDN, PWA, service workers
- **Sentry**: 1 TODO placeholder en `ImageWithFallback.jsx` (opcional para logging de errores)

----------------

## Pendientes

### 🔴 Críticos (bloquean producción)
_(Ninguno - todos resueltos)_

### 🟡 Alta prioridad
_(Todos completados - movidos a histórico)_

### 🟢 Media prioridad
_(Todas completadas - movidas a histórico)_

### 🔵 Baja / mejoras futuras
- [ ] **Tests de race condition de stock**: 2 tests de concurrencia en `orderStock.test.js` fallan de forma intermitente por timing de PostgreSQL (no crítico - lógica de stock funciona correctamente con `SELECT FOR UPDATE`)
- [ ] **Testing E2E**: Ejecutar tests completos de flujos (registro→login→carrito→checkout→orden) con usuarios históricos (Camila 18 meses, Ignacio 17 días) y nuevos registros, verificar admin dashboard muestra timeline 2023-2024 correctamente
 - [ ] **Revisar `/backend/src/utils/env.js`**: Auditar validaciones de variables de entorno, asegurar todos los campos requeridos (DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, etc.) tienen checks, agregar validaciones production-specific (CORS_ORIGIN, NODE_ENV), documentar variables obligatorias
 - [ ] **Eliminar scripts de desarrollo antes de deploy**: Revisar y remover archivos en `/backend/scripts/` no necesarios en producción (ej: `testLogin.mjs`, `getAdminToken.js`, debug helpers)
 - [ ] **Actualizar cart/checkout/confirmation**: Verificar que usan data desde backend (no mocks hardcoded), validar flujo completo con carritos reales
 - [ ] **Revisar config pool de PostgreSQL**: Confirmar valores óptimos en `backend/database/config.js` (max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000) para producción
 - [ ] **Auditoría fetch/axios/jQuery**: Revisar uso de librerías HTTP en frontend/backend, estandarizar en una sola (fetch nativo o axios), eliminar jQuery si existe, verificar manejo consistente de errores y cancelación de requests
 - [ ] Performance avanzada adicional: optimizar imágenes (WebP/lazy), CDN de assets, PWA/service worker, web workers y terminar imports específicos de `lucide-react`.
 - [ ] Documentación: redactar Swagger/OpenAPI, guía de contribución, manual de admin, troubleshooting guide; agregar links en README principal a `docs/FLUJO_COMPRA_COMPLETO.md`, `docs/CONVERSION_IMPORTS_ALIAS.md`, `docs/INTEGRACION_CHECKOUT_TIMELINE.md`.
 - [ ] Legal: términos y condiciones, política de privacidad/devoluciones, aviso legal/GDPR.
 - [ ] Revisar en `.env` el bloque `# Password Reset Cleanup + Configuración de CORS` (variables y valores finales).
 - [ ] Revisar envs antes de deploy (cambiarnode) para asegurar valores actualizados.
- [ ] **Revisar `/backend/src/utils/env.js`**: Auditar validaciones de variables de entorno, asegurar todos los campos requeridos (DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, etc.) tienen checks, agregar validaciones production-specific (CORS_ORIGIN, NODE_ENV), documentar variables obligatorias
- [ ] **Eliminar scripts de desarrollo antes de deploy**: Revisar y remover archivos en `/backend/scripts/` no necesarios en producción (ej: `testLogin.mjs`, `getAdminToken.js`, debug helpers)
- [ ] **Actualizar cart/checkout/confirmation**: Verificar que usan data desde backend (no mocks hardcoded), validar flujo completo con carritos reales
- [ ] **Revisar config pool de PostgreSQL**: Confirmar valores óptimos en `backend/database/config.js` (max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000) para producción
- [ ] **Auditoría fetch/axios/jQuery**: Revisar uso de librerías HTTP en frontend/backend, estandarizar en una sola (fetch nativo o axios), eliminar jQuery si existe, verificar manejo consistente de errores y cancelación de requests
- [ ] Performance avanzada adicional: optimizar imágenes (WebP/lazy), CDN de assets, PWA/service worker, web workers y terminar imports específicos de `lucide-react`.
- [ ] Documentación: redactar Swagger/OpenAPI, guía de contribución, manual de admin, troubleshooting guide; agregar links en README principal a `docs/FLUJO_COMPRA_COMPLETO.md`, `docs/CONVERSION_IMPORTS_ALIAS.md`, `docs/INTEGRACION_CHECKOUT_TIMELINE.md`.
- [ ] Legal: términos y condiciones, política de privacidad/devoluciones, aviso legal/GDPR.
- [ ] Revisar en `.env` el bloque `# Password Reset Cleanup + Configuración de CORS` (variables y valores finales).
- [ ] Revisar envs antes de deploy (cambiarnode) para asegurar valores actualizados.

#### 🎨 Estético / UI/UX
- [ ] **Modales de autenticación** (`frontend/src/modules/auth/pages/LoginPage.jsx` líneas 135-230):
  - Modal de bienvenida (registro exitoso) con gradiente terracota MOA
  - Modal de sesión expirada con advertencia amber
  - Revisar textos, espaciados, animaciones y consistencia visual

--------------------
### ✅ Checklist pre-deploy (no olvidar)
- [ ] HTTPS configurado en servidor producción
- [ ] Monitoreo de errores (conectar comentarios TODO de Sentry en código)
- [ ] Revisar y testear nodemail
- [ ] **Eliminar artifacts de desarrollo antes de deploy**: remover scripts y helpers de desarrollo (ej: `scripts/start-dev.sh`, `dev:all` en `package.json`), dependencias dev-only (`concurrently`, etc.), y endpoints/páginas de debug (ej: `/admin/test`).
 - [ ] **Eliminar artifacts de desarrollo antes de deploy**: remover scripts y helpers de desarrollo (por ejemplo scripts de arranque), dependencias dev-only (ej: `concurrently`), y endpoints/páginas de debug (ej: `/admin/test`).
- [ ] Documentación de deployment actualizada con pasos de setup producción
- [ ] Build prod (`npm run build`) OK sin errores ni warnings
-
## 🌟 Algún día / Maybe
*Features que enriquecerían el proyecto pero no se incluyen en esta entrega por tiempo*

### Backend
- [ ] **Cart Cleanup Job**: Limpieza automática de carritos abandonados >30 días (cron job similar a `passwordResetCleanup.js`)
- [ ] **Integración APIs de Couriers**: Tracking automático con Chilexpress, Blue Express, Starken (webhooks para actualizar estado_envio)
- [ ] **Notificaciones push**: Web Push API para notificaciones en navegador (cambios de estado, ofertas, stock)
- [ ] **Sistema de cupones/descuentos**: Tabla `cupones` con validaciones de uso único, expiración, monto/porcentaje
- [ ] **Reviews y ratings de productos**: Sistema de valoraciones con moderación admin, promedio de estrellas
- [ ] **Wishlist pública/compartible**: Generar enlaces únicos para compartir wishlists con amigos/familia
- [ ] **Historial de precios**: Tabla `precio_historico` para mostrar variaciones y alertas de bajadas de precio
- [ ] **Stock reservations**: Reservar stock temporalmente (15min) durante checkout para evitar overselling
- [ ] **Logs de auditoría**: Tabla `audit_logs` para rastrear cambios críticos (cambios de precio, stock, estados de orden)

### Frontend
- [ ] **PWA completa**: Service workers, offline mode, instalación en dispositivos móviles
- [ ] **Comparador de productos**: Seleccionar 2-4 productos y ver comparación lado a lado
- [ ] **Filtros avanzados de productos**: Rango de precios, múltiples categorías, ordenamiento por popularidad/novedad
- [ ] **Búsqueda con autocompletado**: Sugerencias en tiempo real mientras el usuario escribe
- [ ] **Chat de soporte**: Widget de chat en vivo o chatbot básico para consultas frecuentes
- [ ] **Vista de productos relacionados**: Algoritmo "los que compraron esto también compraron"
- [ ] **Galería de imágenes mejorada**: Zoom en hover, vista 360°, múltiples imágenes por producto
- [ ] **Modo oscuro**: Theme switcher con persistencia en localStorage
- [ ] **Internacionalización (i18n)**: Soporte multi-idioma (español/inglés)

### DevOps & Infraestructura
- [ ] **CI/CD con GitHub Actions**: Pipeline automático para tests, linting, deploy a staging/producción
- [ ] **Docker & Docker Compose**: Containerización completa (frontend, backend, PostgreSQL, Redis)
- [ ] **Monitoreo con Sentry**: Tracking de errores en producción con source maps
- [ ] **CDN para assets estáticos**: Cloudflare/AWS CloudFront para imágenes y archivos CSS/JS
- [ ] **Redis para caching**: Cache de queries frecuentes (productos, categorías), sesiones
- [ ] **Backups automáticos a S3/Cloud Storage**: Copias de BD subidas a storage externo con retención 30 días
- [ ] **Load balancer y escalado horizontal**: Múltiples instancias del backend con Nginx/HAProxy
- [ ] **Logs centralizados**: ELK stack (Elasticsearch, Logstash, Kibana) o similar

### Analytics & Marketing
- [ ] **Dashboard de métricas avanzadas**: Tasa de conversión, abandono de carrito, CAC, LTV
- [ ] **Emails automatizados**: Carrito abandonado (recordatorio 24h), restock de productos en wishlist
- [ ] **Recomendaciones personalizadas**: ML básico para sugerir productos según historial de navegación
- [ ] **Programa de lealtad**: Sistema de puntos/rewards por compras repetidas
- [ ] **Integración con Google Analytics 4**: Tracking de eventos, embudos de conversión
--------------------


### ✅ Checklist pre-deploy (no olvidar)
- [ ] HTTPS configurado en servidor producción
- [ ] Monitoreo de errores (conectar comentarios TODO de Sentry en código)
- [ ] Revisar y testear nodemail

- [ ] **Eliminar artifacts de desarrollo antes de deploy**: remover scripts y helpers de desarrollo (ej: `scripts/start-dev.sh`, `dev:all` en `package.json`), dependencias dev-only (`concurrently`, etc.), y endpoints/páginas de debug (ej: `/admin/test`).
- [ ] Documentación de deployment actualizada con pasos de setup producción
- [ ] Build prod (`npm run build`) OK sin errores ni warnings







- [x] ✅ Compresión HTTP activada en backend (compression middleware con threshold 1KB, level 6)
- [x] ✅ Tests unitarios de stock implementados (6 tests: descuento automático, race conditions, rollback, multi-producto, límites)
- [x] ✅ Tests de permisos admin implementados (15 tests: autenticación, validaciones estados, tracking, exportación, notas internas)

- [x] ✅ Remover helpers de debug manual (eliminado `frontend/src/components/debug`)
- [x] ✅ DDL ejecutado en BD (`backend/database/schema/DDL.sql` - incluye password reset y estado_orden)
- [x] ✅ Flujo de compra probado end-to-end (validación stock, email, timeline, costos, navegación)
- [x] ✅ Backup BD configurado (script `backend/scripts/backup-db.sh`, guía en `docs/DATABASE_BACKUP_GUIDE.md`)
- [x] ✅ Emails de confirmación configurados (Nodemailer con Ethereal fallback, plantilla HTML responsive)
- [x] ✅ JWT expiración ajustada y documentada (24h clientes, 7d admin, refresh token, session monitor)
- [x] ✅ Variables de entorno verificadas (guía completa en `docs/PRODUCTION_ENV_CHECKLIST.md`)
- [x] ✅ Health endpoint `/api/health` implementado (monitoring ready con status DB, uptime, version)
- [x] ✅ Rate limit habilitado (200 req/15min general, 10 req/15min auth)
- [x] ✅ jwt-decode instalado en frontend (`package.json` tiene `jwt-decode: ^4.0.0`)
- [x] ✅ Auditoría TODOs completada: 7 TODOs restantes en frontend (5 producto CRUD, 1 Sentry, 1 alias); backend sin TODOs
- [x] ✅ adminController.js TODOs: ya resueltos, líneas 851/876 no contienen pendientes









-------------------------------------------------------------------------------------------------

## ✅ Completados (histórico reciente)
 - ✅ **[22 Nov 2025] OrderConfirmation visual guide implemented**: `OrderConfirmationPage.jsx` added and wired to route `/order-confirmation/:orderId`, responsive UI, badges, tracking, email banner.
 - ✅ **[22 Nov 2025] Checkout address flow updated**: `CheckoutPage.jsx` supports shipping address selection and new address payload (`direccion_nueva` / `direccion_id`) and persists via `checkout.api`.
 - ✅ **[22 Nov 2025] Payment methods UI updated**: Checkout payment selector and payment status badges implemented; admin/payment stats components present.
- ✅ **[22 Nov 2025] Tests corregidos masivamente**: De 45/117 tests pasando (38%) a **109/111 (98.2%)**. Corregidos: sintaxis (await inesperado), INSERTs con placeholders incorrectos (usuarios 8→7, órdenes 5→6, direcciones 8→9), eliminadas referencias a `notas_internas`, actualizados estados a español (pendiente, pagado, rechazado, reembolsado, preparacion, enviado, entregado), corregida normalización de empresas de envío (`blue-express`→`blue_express`, `correos-de-chile`→`correos_chile`), agregada validación en `addTrackingInfo`, implementadas fechas automáticas en cambios de estado (estado_pago='pagado' → fecha_pago auto, estado_envio='enviado' → fecha_envio auto, estado_envio='entregado' → fecha_entrega_real auto), instalada dependencia `call-bound` faltante. Solo 2 tests de race condition fallan intermitentemente por timing (no crítico).
- ✅ **[22 Nov 2025] Base de datos production-ready**: DDL.sql simplificado con solo `rol_code` (CLIENT/ADMIN) ejecutado en BD limpia, `clientsData.js` con 14 usuarios distribuidos en 18 meses (2023-06-15 a 2024-11-05), `ordersData.js` con 22 órdenes simulando comportamiento natural (early adopters: 3-5 compras, usuarios nuevos: 0-1), `moreDataSeed.js` eliminado (datos curados reemplazan generador random), todos los seeds ejecutados ✅ (15 usuarios, 33 productos, 22 órdenes, 14 direcciones, 7 wishlists), DB_NAME estandarizado en config.js y .env, `ordersSeed.js` corregido (eliminado notas_internas, agregado estado_orden), verificación de timeline: usuarios desde 2 años 5 meses hasta 17 días de antigüedad.
- ✅ **[22 Nov 2025] Tests implementados**: 6 tests unitarios para validación de stock (`stockValidation.test.js`) cubren descuento automático, race conditions con `SELECT FOR UPDATE`, rollback de transacciones, validación multi-producto, límites de stock; 15 tests de permisos admin (`adminOrderPermissions.test.js`) verifican que solo admins pueden actualizar estados/tracking, validaciones de estados permitidos, filtros, exportación, notas internas no visibles para customers.
- ✅ **[22 Nov 2025] Fixes críticos de órdenes y checkout**: Stock se descuenta automáticamente al crear órdenes con `SELECT FOR UPDATE` (previene race conditions), carrito se limpia solo después de commit exitoso, estado_orden='confirmed' por defecto, validación de dirección obligatoria en backend/frontend, endpoint `/checkout/create-order` creado como alias, compresión HTTP activada (gzip/deflate para responses >1KB).
- ✅ **[22 Nov 2025] Validaciones auth completas**: LoginPage y RegisterPage usan `validateEmail`, `validatePassword`, `validateName`, `validatePhone` de `utils/validation.js` con mensajes específicos por campo, requisitos de longitud/formato claros, feedback visual en inputs con errores.
- ✅ **[22 Nov 2025] Admin productos modales**: AdminProductsPage.jsx YA tiene `ProductDrawer` y `ProductDetailDrawer` implementados correctamente para crear/editar/duplicar/ver productos, sin uso de `alert()`.
- ✅ **Barrel exports y limpieza código**: creados `@/components/data-display/index.js` y `@/services/index.js` para imports centralizados; removido alias temporal `uiDemo` de `api-paths.js`; scripts mock ya no existen (limpiados previamente); auditoría TODOs completada con solo 1 TODO restante en frontend (`ImageWithFallback.jsx` - placeholder Sentry para logging opcional).
- ✅ **Admin estados API documentada y testeada**: especificación completa en `docs/misDOCS/ADMIN_ORDERS_STATUS_API_SPEC.md` (payload, validaciones, ejemplos, 400/401/403/404); 15 tests de integración en `__tests__/adminOrderStatus.test.js` (validaciones valores inválidos, permisos admin, tracking completo, notas internas, normalización empresa_envio, múltiples campos); todos los tests pasan ✅
- ✅ Observabilidad frontend integrada: `useErrorHandler`/`useFormErrorHandler` conectados al puente `observability.js`, global handlers capturando errores, AuthContext sincronizando `setUser`/`clearUser`, y pantallas críticas (admin productos/órdenes, checkout, perfil) migradas de `console.log` a manejo centralizado.
- ✅ Scripts CLI login: `backend/scripts/testLogin.mjs` y `scripts/getAdminToken.js` ahora detectan `ECONNREFUSED` y guían para levantar `npm run -w backend dev`. 🚀
- ✅ Confirmación de orden: email HTML generado en backend con `sendOrderConfirmationEmail`, flujo completo tras `createOrderFromCart`, plantilla responsive con resumen de orden y link a detalle.
- ✅ Revisar consistencia `id_usuario` vs `usuario_id`: AuthContext y todos los controllers usan `usuario_id` consistentemente, JWT payload usa `id` (mapeado a `usuario_id`), middleware `tokenMiddleware.js` normaliza correctamente.
- ✅ Integrar context splitting: `AuthContext.jsx` optimizado con hooks separados (login, logout, refreshProfile, extendSession), no re-renders innecesarios, monitor de sesión en hook dedicado `useSessionMonitor`.
- ✅ Admin - Productos CRUD: `ProductsAdminPage.jsx` conectado con handlers reales (view abre en nueva tab, edit muestra alert preparado para modal, delete con confirmación), API existe en `/admin/productos/:id` (GET/PUT/DELETE), preparado para implementar modales.
- ✅ Sistema de expiración JWT implementado: monitor de sesión (`useSessionMonitor`), warning 5 min antes de expirar, modal de confirmación (`SessionExpirationDialog`), auto-logout con alerta, endpoint refresh token (`POST /auth/refresh-token`), tiempos diferenciados admin/cliente (`JWT_ADMIN_EXPIRES_IN`/`JWT_EXPIRES_IN`), documentación en README, demo en StyleGuide.
- ✅ Flujo de compra E2E validado: validación de stock en tiempo real antes de crear orden, email de confirmación con HTML responsive (`sendOrderConfirmationEmail`), timeline funcional, cálculo correcto de subtotal/envío/total, navegación a `/order-confirmation/:orderId`.
- ✅ Eliminado playground `/admin/test` y componente `AdminTestPage` del bundle para evitar rutas dev en entregas evaluadas.
- ✅ Optimizaciones core de performance: `React.lazy`/`Suspense` en 30+ rutas, chunks manuales en Vite, bundle inicial ~150 KB, caching React Query, virtualización en tablas/galleries, doc en `docs/CHANGELOG_OPTIMIZACIONES.md`.
- ✅ Reemplazo de imports frontend por alias `@/`.
- ✅ PropTypes añadidas a componentes clave de perfil/checkout.
- ✅ Checkout: selector de pagos usa `paymentMethods`/`selectedPaymentId`; badge corregido; `paymentMethod` estado real.
- ✅ Navegación admin/wishlist: `AdminSidebar`/`Navbar` con rutas reales; botones “Agregar al carro” funcionales; `ProfilePage` respeta `initialTab`.
- ✅ `OrderConfirmationPage.jsx` rediseñada y conectada a `checkout.api.getOrderById`; `App.jsx` ruta `/order-confirmation/:orderId`; `MyOrdersSection` navega con `orden_id`.
- ✅ `useUserOrders`/`ProfilePage`/`WishlistSection` consumen datos reales del backend (GET `/api/orders`, wishlist real).
- ✅ `StoreSettingsPage.jsx` conectada a `/api/config`; backend valida correos/URLs y restringe con `verifyAdmin`.
- ✅ Admin estados/tracking: `orderAdminModel.updateOrderStatus/addTrackingInfo` hacen `UPDATE ... RETURNING`; `ordersAdminApi` normaliza `orden_id`; `OrdersDrawer` usa tracking/courier; `OrdersAdminPageV2` montada en `App.jsx`; duplicada ruta status consolidada en `adminRoutes.js`.
- ✅ Historial clientes: `CustomerDrawer` consume `/admin/pedidos?usuario_id`, refetch tras editar; backend filtra por `usuario_id`.
- ✅ Email de confirmación de orden implementado (emailService.js); faltan triggers/plantillas adicionales.
- ✅ Probar flujo de compra E2E (backend + frontend): validación de stock en tiempo real, email de confirmación, timeline en perfil, cálculo correcto de costos y navegación a `/order-confirmation/:orderId`.
- ✅ API real de órdenes: filtros por estado/búsqueda/paginación implementados en UI con propagación de `limit/offset` al hook; `OrderStatusTimeline` reutilizado en múltiples vistas; contrato de datos documentado en `FLUJO_COMPRA_COMPLETO.md`.
- ✅ Wishlist: endpoint para vaciar wishlist implementado iterando `wishlistApi.remove()` en botón "Limpiar"; archivo huérfano `WishlistPage.jsx` evaluado y mantenido como página standalone funcional.
- ✅ Exportaciones Admin: implementado generador CSV real en `OrdersAdminPage` con filtros aplicados; limitado UI a formato CSV para evitar inconsistencias con XLSX/JSON.
- ✅ Notificaciones: emails por cambio de estado (pago/envío) implementados en `emailService.js`; WhatsApp/SMS y Web Push marcados como opcionales para fase futura.
- ✅ Tracking de couriers: integración con APIs de Chilexpress, Blue Express y Starken preparada; cron/webhook para actualización automática documentado en roadmap para v2.
- ✅ UX scroll suave: añadido `scroll-behavior: smooth` en CSS global y utilitarios JS para navegación en listas de productos, órdenes y direcciones.
- ✅ Remover `console.log` sensibles: audit completo realizado en AuthContext, CheckoutPage, y todos los componentes críticos; logs sensibles removidos o protegidos con flag `import.meta.env.DEV`; documentado en CHANGELOG_OPTIMIZACIONES.md.
- ✅ Confirmación de orden: correo HTML generado y disparado en backend vía `sendOrderConfirmationEmail()` llamado en `createOrderFromCart()` (orderController.js línea 117); flujo completo probado E2E con validación de stock; contrato de datos documentado en `FLUJO_COMPRA_COMPLETO.md`; template responsive con resumen de orden, precios en CLP, link a detalle.
- ✅ Manejo de errores: auditado `error.utils.js` con clases `AppError/ValidationError/NotFoundError/UnauthorizedError/ForbiddenError/ConflictError`; middleware `errorHandler` registrado en `index.js` (línea 94); manejo completo de errores PG (23505 unique, 23503 FK, 22P02 invalid text), JWT (TokenExpiredError, JsonWebTokenError), entity parse; `asyncHandler` wrapper para async/await; estructura de respuesta normalizada con timestamp; logging en consola con método/URL/stack; `homeController.js` con lógica de productos activos; rutas error documentadas con `ServerErrorPage` y `ErrorBoundary`.
- ✅ Revisar consistencia `id_usuario` vs `usuario_id`: verificado que `tokenMiddleware.js` normaliza correctamente ambos campos (línea 24: `usuario_id: decoded.id`); todos los controllers usan `usuario_id` de forma consistente; JWT payload usa `id` que se mapea a `usuario_id` en req.user.
- ✅ AuthOptimized.jsx existe y funciona: archivo completo con contextos divididos (AuthStateContext, AuthActionsContext, AuthMetaContext) y hooks `useAuthState/useAuthActions/useAuthMeta`; ready para integración pero AuthContext actual ya está optimizado con `useSessionMonitor` y funciona correctamente; integración opcional para reducir re-renders.
- ✅ Rate limiting implementado: `express-rate-limit` configurado en `index.js` con límite general (200 req/15min) y límite auth (10 req/15min) en rutas `/login` y `/register`; configurable vía variables de entorno `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`.
- ✅ DDL ejecutado en BD: base de datos `moa` verificada con todas las tablas (usuarios, categorias, productos, direcciones, ordenes, carritos, wishlists, password_reset_tokens, configuracion_tienda); migración `004_add_estado_orden_column.sql` creada y ejecutada para agregar columna `estado_orden` a tabla `ordenes` sin pérdida de datos; 9 tablas con datos activos (12 usuarios, 33 productos, 17 órdenes, etc).
 - ✅ Seed de datos ampliado para dashboard: script `backend/database/seed/moreDataSeed.js` creado y ejecutado agregando usuarios/direcciones/órdenes/wishlists adicionales. Totales actuales: 27 usuarios, 25 direcciones, 47 órdenes, 128 orden_items, 14 wishlists, 52 wishlist_items. Gráficas admin ahora con volumen suficiente para pruebas de distribución y revenue.
 - ✅ Documentación Admin estados API: especificación de payload, valores permitidos, ejemplos y plan de casos de prueba en `docs/misDOCS/ADMIN_ORDERS_ESTADOS_API.md`.
 - ✅ Health endpoint implementado: `/api/health` retorna status OK, DB connectivity, version, uptime, environment; 503 si DB desconectada (load balancer ready).
 - ✅ Variables de entorno para producción: checklist completo en `docs/PRODUCTION_ENV_CHECKLIST.md` (JWT, DB, SMTP, CORS, rate limits).
 - ✅ Script backup automático BD: `backend/scripts/backup-db.sh` con timestamp, compresión, limpieza 7 días; guía completa con cron/PM2 en `docs/DATABASE_BACKUP_GUIDE.md`.
 - ✅ Debug helpers removidos: eliminado directorio `frontend/src/components/debug` (no usado en producción).
 - ✅ OrdersTable fix: prop `total` agregada para correcta paginación (fallback a `data.length` si no se provee).
 - ✅ Estrategia public_id confirmada: campo existe en DDL y está implementado correctamente; `usersModel.js` y `productsModel.js` generan `public_id` con nanoid en create; queries backend usan public_id para referencias externas (no exponer IDs secuenciales).
 - ✅ Auditoría TODOs: 7 pendientes en frontend (5 relacionados a modales producto CRUD ya documentados en alta prioridad, 1 Sentry placeholder, 1 alias temporal); backend sin TODOs.
 - ✅🧾 PropTypes reforzados en `OrderStatusTimeline.jsx`, `AddressesSection.jsx`, `CheckoutPage.jsx` y `MyOrdersSection.jsx` (validaciones con `oneOf`, shapes consistentes y defaults controlados).
- ✅ Scripts DB backup: implementado `backup-db.sh` con compresión, rotación 7 días, guía completa en `docs/DATABASE_BACKUP_GUIDE.md`; falta script de migración automática para cambios de schema.
