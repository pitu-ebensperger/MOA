-- Active: 1763403221678@@127.0.0.1@5432@pitu
# TODO - MOA Project

**Última actualización:** 17 de noviembre, 2025

---

## ✅ COMPLETADOS RECIENTEMENTE

- ~~Reemplazar todos los imports del frontend por el alias `@/`~~ ✅ 

- ~~Añadir validaciones PropTypes para los componentes clave de perfil y checkout ✅ COMPLETADO (hoy)~~

- ~~Checkout actualizado (hoy)~~
  - ~~ `CheckoutPage.jsx` reemplaza el badge `bg-[var(--color-primary3)]` por `bg-(--color-primary3)` y usa el selector de `paymentMethods` del contexto (`formatPaymentMethod`/`selectedPaymentId`) en lugar de estados y `paymentOptions` no usados.~~

- ~~Renovamos la navegación admin y wishlist (hoy)~~
  - `AdminSidebar.jsx` y `Navbar.jsx` usan rutas reales (`API_PATHS`) y el menú de perfil lleva a la pestaña correcta `/perfil?tab=orders`.
  - Los botones “Agregar al carro” de `Profile -> Card.jsx` invocan `addToCart`/login en lugar de ser decorativos, y `ProfilePage.jsx` puede inicializar la pestaña correcta según `location.state.initialTab`.
  - `OrdersPage.jsx` y `ordersApi.updateStatus` permiten cambiar estados de pedido contra mocks o API real y refrescan la vista; `CustomersPage.jsx` gestiona creación, edición, cambios de estado y desactivación directamente desde el panel.

---

## 🔴 CRÍTICOS (Bloqueantes para producción)

### Base de Datos
- **[BLOQUEANTE]** Ejecutar script DDL de direcciones y pagos:
  ```bash
  cd backend/database/schema
  psql -d moa -f DDL_DIRECCIONES_PAGOS.sql
  ```
  - **Impacto:** Sin esto, el flujo de checkout NO funcionará
  - **Agrega:** Columnas necesarias a tabla `ordenes`
  - **Crea:** Tablas `direcciones` y `metodos_pago` con triggers
  - **Documentado en:** `docs/FLUJO_COMPRA_COMPLETO.md`
  
- TODO: definir el sistema de identificadores (si no se usará `uuid-ossp`, eliminar esa extensión del schema y normalizar `public_id`)

- ~~Incluir y combinar DDL de direcciones/pagos en esquema consolidado (DDL.sql principal)~~ ✅
  - Se agregaron las tablas y triggers a `backend/database/schema/DDL.sql` (direcciones y metodos_pago)
  - Se creó migración `002_addresses_payments.sql` y `003_sync_addresses_payments_constraints.sql` para entornos ya existentes
  - Ahora el setup inicial y las migraciones crean todo lo necesario de una sola vez

### Testing
- **[BLOQUEANTE]** Probar flujo de compra end-to-end:
  1. Iniciar backend: `cd backend && node index.js`
  2. Iniciar frontend: `cd frontend && npm run dev`
  3. Realizar compra completa: carrito → checkout → orden creada
  4. Verificar en BD que orden se creó correctamente con todos los campos
  5. Ver orden en perfil de usuario con OrderStatusTimeline
  6. Verificar cálculos de costos (envío, subtotal, total)

---

## 🟡 ALTA PRIORIDAD

### Pasarela de Pago
- Integrar pasarela de pago real (actualmente simulado):
  - **Opciones:** Transbank WebPay Plus (recomendado para Chile), Flow, o Stripe
  - **Archivo:** `backend/src/controllers/orderController.js`
  - **Método:** `processPayment()` - reemplazar simulación con integración real
  - **Agregar:** Webhooks para confirmaciones de pago asíncronas
  - **Almacenar:** Tokens de pago en tabla `metodos_pago` (nunca números completos)
  - **Estados:** Manejar estados pendiente → procesando → pagado/fallido

### Confirmación de Orden
- Crear página de confirmación de orden (OrderConfirmationPage.jsx):
  - **Ruta:** `/order-confirmation/:orderCode`
  - **Mostrar:** Después del checkout exitoso
  - **Incluir:** 
    - Código de orden (MOA-YYYYMMDD-XXXX)
    - Fecha estimada de entrega
    - Resumen de productos
    - Información de envío
    - Total pagado
  - **Botones:** "Ver tracking", "Volver a inicio", "Descargar comprobante"
  - **Email:** Preparar template de confirmación

### Admin - Gestión de Estados
- Implementar gestión completa de estados de orden en admin:
  - **Componente:** Actualizar `OrdersDrawer.jsx`
  - **Permitir cambiar:**
    - `estado_envio`: preparacion → empaquetado → enviado → en_transito → entregado
    - `estado_pago`: pendiente → procesando → pagado/fallido
  - **Agregar campos:**
    - Número de seguimiento (tracking number)
    - Empresa de courier (dropdown: Chilexpress, Blue Express, Starken)
    - Notas internas para admin
  - **Endpoint:** PUT `/api/admin/orders/:id/status`

### Linting
- ✅ Se reemplazaron las clases `bg-[var(--color-primary3)]` por `bg-(--color-primary3)` y ahora el selector de métodos de pago reutiliza `paymentMethods`/`setSelectedPaymentId` desde el contexto, eliminando las referencias a estados no usados.
- 📝 Próximos pasos recomendados
  1. Migrar las constantes/exportaciones compartidas de `AddressContext.jsx` y `PaymentContext.jsx` a archivos separados para mantener compatibilidad con fast refresh.
  2. Normalizar los `useMemo`/`useEffect` en `CustomersPage.jsx` e incluir `handleOpenEditDialog`/`handleStatusChange` y la lista de dependencias adecuada para evitar warnings de exhaustividad.
  3. Ajustar `UserInfoSection.jsx` para que el efecto que depende de `user` incluya al usuario en su arreglo de dependencias o reestructure el hook para evitar advertencias.

### Checkout context
- Rebuild the payment context by destructuring the tuple from `createStrictContext`, exporting the strict hook, and wrapping `App` (or `AddressProvider`) with the now-correct `PaymentProvider` so `usePaymentMethods` is usable in the checkout flow.
- Define a real `paymentMethod` state in `CheckoutPage` (or reuse `selectedPaymentId`) before rendering the `<Select>` at line 295, and align it with `paymentOptions` so the form no longer references an undefined variable.

### Autenticación
- TODO: Añadir validaciones completas a los formularios de los procesos de auth (login, registro, olvidé mi contraseña y cambio de contraseña) para evitar payloads inválidos, mostrar feedback de campos obligatorios, y extender tanto en frontend como en backend el manejo de errores relacionado con credenciales y formatos.

### Perfil
- Revisar `frontend/src/modules/profile/components/UserInfoSection.jsx` y documentar mejoras o inconsistencias detectadas en la sección de información personal para priorizar los ajustes necesarios.

### Manejo de errores y páginas
- Auditar y documentar el middleware `errorHandler` en `backend/src/utils/error.utils.js` y su registro al final de `backend/index.js`, incluyendo el orden de routers (`home`, `auth`, `wishlist`, `cart`, etc.) para asegurarse de que `AppError`, `ValidationError` y los manejadores de errores de PostgreSQL/JWT (más el caso `entity.parse.failed`) devuelven siempre respuestas consistentes.
- Revisar `homeController.js` (`backend/src/controllers/homeController.js`) para confirmar que la respuesta al landing no expone productos inactivos, limita la cantidad de filas devueltas y valida los campos que el frontend consume (categorías destacadas, productos, secciones editoriales).
  - El helper `buildErrorResponse` centraliza `success: false`, `message` y `timestamp`, `handlePgError` y `handleJwtError` traducen códigos 23505/23503/22P02 y errores de tokens, y `errorHandler` cubre rutas desconocidas y errores no operacionales con 500.
- Añadir/actualizar pruebas en `backend/__tests__/routes.test.js` para garantizar respuestas 4xx/5xx sobre las rutas principales y capturar `AppError`/`ValidationError`/PG/JWT.
  - Los tests ejercen login, carrito, wishlist, categorías, productos, admin y pagos sin token y con payload inválidos, además de rutas generadoras de 5xx, JSON malformado, `entity.parse.failed` y errores de JWT.
- Crear o actualizar la experiencia de usuario cuando ocurren errores críticos en el frontend (`ServerErrorPage.jsx`, `ErrorBoundary` o fallback en `App.jsx`) manteniendo `NotFoundPage.jsx` como la ruta `*` actual, y documentar qué errores aterrizan en cada vista.
  - `ErrorBoundary` rodea toda `App` y ofrece fallback con recarga, reporte y detalles técnicos (solo en DEV).
  - Las rutas `/error/500`, `/error/502`, `/error/503`, `/error/504` usan `ServerErrorPage` para mostrar títulos/recursos distintos y manejan fallback offline/`errorCode=0`; `App.jsx` mantiene `NotFoundPage` en la ruta `*` para rutas no declaradas.

---

## 🟢 MEDIA PRIORIDAD

### API Real de Órdenes
- Conectar seguimiento de pedidos con API real:
  - **Componente:** `MyOrdersSection.jsx` (actualmente usa mock data)
  - **Llamar:** `GET /api/orders` para obtener órdenes del usuario
  - **Implementar:** 
    - Filtros por estado (pendiente, pagado, enviado, etc.)
    - Paginación (limit, offset)
    - Búsqueda por código de orden
  - **Mostrar:** En `OrderStatusTimeline` con datos reales

### Notificaciones
- Implementar sistema de notificaciones al cambiar estados:
  - **Email:** 
    - Usar nodemailer o servicio (SendGrid, Mailgun)
    - Plantillas para cada estado
    - Enviar cuando cambia `estado_envio` o `estado_pago`
  - **WhatsApp/SMS (Opcional):**
    - Integrar Twilio
    - Enviar tracking link
  - **Push Notifications (Opcional):**
    - Web Push API
    - Notificar en browser

### Tracking de Couriers
- Integrar APIs de couriers reales:
  - **Chilexpress:** 
    - API: https://developers.chipax.com/docs/chilexpress
    - Auto-actualizar `estado_envio` basado en tracking
  - **Blue Express:**
    - API: https://www.blue.cl/integraciones
    - Sincronizar estados de envío
  - **Starken:**
    - API: https://www.starken.cl/developers
    - Tracking automático
  - **Implementar:** Webhook o cron job para actualizar estados

### UX / Interacciones suaves
- TODO: Añadir scroll suave a las listas principales (productos, órdenes y direcciones) para mejorar la navegación en pantallas largas; revisar componentes afectados (`ProductList`, `MyOrdersSection`, `AddressesSection`, etc.) y decidir si se gestiona vía CSS (`scroll-behavior: smooth`) o utilitarios JS para efectos más complejos.

### API Admin para Estados
- Implementar endpoint de actualización de estados:
  - **Archivo:** `frontend/src/modules/admin/pages/orders/OrdersPage.jsx`
  - **Actual:** Tiene `// TODO: Implementar llamada a API para actualizar estado`
  - **Crear:** 
    - Backend: PUT `/api/admin/orders/:id/status`
    - Controller: `updateOrderStatus()` en `orderController.js`
  - **Validar:** Solo admin puede cambiar estados

### TypeScript/PropTypes
- Agregar validación de tipos:
  - **Componentes prioritarios:**
    - `OrderStatusTimeline.jsx`
    - `AddressesSection.jsx`
    - `CheckoutPage.jsx`
    - `MyOrdersSection.jsx`
  - **Opciones:**
    - PropTypes (rápido, no requiere cambios grandes)
    - TypeScript (largo plazo, mejor DX)

---

## 🔵 BAJA PRIORIDAD / MEJORAS FUTURAS

### Admin - Clientes
- Completar funcionalidades en `CustomersPage.jsx`:
  - Implementar actualización de status de cliente en backend
  - Abrir formulario de edición de cliente (modal o drawer)
  - Implementar desactivación/reactivación de clientes
  - Agregar refetch cuando API real esté lista
  - Implementar búsqueda y filtros avanzados
  - Historial de compras por cliente

### Rutas y Alias
- Quitar alias temporal en `api-paths.js`:
  - **Archivo:** `frontend/src/config/api-paths.js`
  - **Buscar:** `// TODO: quitar alias temporal cuando UI demo tenga ruta propia`
  - **Acción:** Crear ruta propia para UI demo o eliminar si no se usa

### Performance
- Implementar code-splitting para mejorar carga inicial:
  - **Usar:** `React.lazy()` y `Suspense`
  - **Módulos a dividir:**
    - Páginas de admin (lazy load)
    - Páginas de productos (lazy load)
    - Páginas de perfil
  - **Objetivo:** Reducir chunk principal de 1061 KB a < 500 KB
  - **Separar:** Vendors grandes (react, lucide-react, radix-ui)

### Barrel Exports
- Crear archivos index.js para imports más limpios:
  - **Crear:**
    - `@/components/ui/index.js` → exportar Button, Badge, Card, etc.
    - `@/components/data-display/index.js` → exportar Price, DataTable, etc.
    - `@/services/index.js` → exportar todos los API clients
  - **Beneficio:** `import { Button, Badge, Card } from '@/components/ui'`

### AdminTestPage
- Decidir sobre AdminTestPage.jsx:
  - **Estado actual:** Comentado en `App.jsx`
  - **Ruta propuesta:** `/admin/test`
  - **Opciones:**
    1. Crear página para testing de componentes de admin
    2. Eliminar referencias si no se necesita

### Documentación
- Registrar documentos en README principal:
  - Agregar links a:
    - `docs/FLUJO_COMPRA_COMPLETO.md` (pasos para deploy)
    - `docs/CONVERSION_IMPORTS_ALIAS.md` (guía de imports)
    - `docs/INTEGRACION_CHECKOUT_TIMELINE.md`
  - Crear sección "Documentación Técnica"

---

## 🧹 LIMPIEZA / MANTENIMIENTO

### Scripts
- Eliminar `scripts/convert-imports.js`:
  - **Razón:** Conversión de imports ya completada
  - **Antes de eliminar:** Confirmar que no se necesitará más

### Mockups
- Remover mockups antiguos:
  - **Buscar:** Referencias a "post sacada front"
  - **Verificar:** Que diseño final está implementado en todos los módulos
  - **Limpiar:** Archivos mock antiguos no usados
- Eliminar cualquier mock data o endpoints simulados (`mockOrders`, `mockProducts`, etc.) que aún se usen en el build y reemplazarlos por integraciones reales antes del deploy

### TODOs en Código
- Auditar y resolver comentarios TODO:
  - **Buscar:** `// TODO:` en todos los archivos `.js` y `.jsx`
  - **Acción:** 
    - Resolver pendientes
    - Documentar en este archivo si es tarea grande
    - Eliminar comentarios ya resueltos
  - **Archivos conocidos con TODOs:**
    - `frontend/src/modules/admin/pages/orders/OrdersPage.jsx`
    - `frontend/src/config/api-paths.js`
    - `frontend/src/modules/admin/pages/CustomersPage.jsx`

---

## 📝 NOTAS IMPORTANTES

### Orden de Implementación Recomendado
1. ✅ Ejecutar DDL (CRÍTICO)
2. ✅ Probar flujo end-to-end (CRÍTICO)
3. 🔴 Integrar pasarela de pago real
4. 🔴 Crear página de confirmación
5. 🟡 Implementar gestión de estados en admin
6. 🟡 Conectar API real de órdenes
7. 🟢 Notificaciones por email
8. 🟢 Tracking con couriers

### Referencias Útiles
- Flujo completo: `docs/FLUJO_COMPRA_COMPLETO.md`
- Imports: `docs/CONVERSION_IMPORTS_ALIAS.md`
- Checkout: `docs/INTEGRACION_CHECKOUT_TIMELINE.md`
- Backend models: `/backend/src/models/orderModel.js`
- Backend controllers: `/backend/src/controllers/orderController.js`
- Frontend checkout: `/frontend/src/modules/cart/pages/CheckoutPage.jsx`

## 🚀 PRÓXIMOS PASOS

- Actualizar la documentación de mocks (README o `docs/MOCK_DATA.md`) para dejar constancia de que `usersDb` ahora incluye direcciones, wishlists y carritos que antes vivían en `customers.js`, y qué campos (role/stats/metadata) deben existir en los consumidores.
- Recorrer el código que depende de `customersDb` (admin/orders/auth) y verificar que no quedan imports antiguos ni suposiciones sobre el shape anterior; ajustar cualquier helper o test que use `customersDb` o los campos `status`/`phone` que cambiaron.
- Ejecutor pruebas específicas como `npm run test:auth` y un smoke test de `OrdersDrawer`/`CustomersPage` localmente para confirmar que la nueva estructura de `usersDb` satisface las vistas administrativas y los mocks de auth.

---

## ✅ CHECKLIST PRE-DEPLOY

Antes de llevar a producción, verificar:

- [ ] DDL ejecutado en base de datos
- [ ] Flujo de compra probado end-to-end
- [ ] Pasarela de pago integrada y probada
- [ ] Emails de confirmación configurados
- [ ] Ajustar el tiempo de expiración del JWT en backend y documentarlo antes del deploy (IMPORTANTE)
- [ ] Variables de entorno configuradas (DB, API keys, etc.)
- [ ] Cambiar el entorno de ejecución de modo desarrollo a producción y validar la configuración resultante
- [ ] Build de producción exitoso (`npm run build`)
- [ ] HTTPS configurado
- [ ] Backup de base de datos configurado
- [ ] Monitoreo de errores (Sentry, etc.)
- [ ] Documentación de deployment actualizada
