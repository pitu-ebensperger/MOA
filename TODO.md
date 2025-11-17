# TODO - MOA Project

**Última actualización:** 17 de noviembre, 2025

---

## ✅ COMPLETADOS RECIENTEMENTE

- ~~Reemplazar todos los imports del frontend por el alias `@/`~~ ✅ COMPLETADO (17 nov 2025)
  - 145 archivos actualizados, ~800+ imports convertidos
  - Documentado en `docs/CONVERSION_IMPORTS_ALIAS.md`
  - Compilación exitosa sin errores
  - Sistema completo de checkout funcionando
  - Modelos, controladores y rutas de órdenes creados

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
  
- Incluir y combinar DDL de direcciones/pagos en esquema consolidado (DDL.sql principal)
  - Evitar tener dos archivos SQL separados
  - Facilitar setup inicial de base de datos

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
- Corregir warnings de linting en `CheckoutPage.jsx`:
  - **Reemplazar:** 26 clases CSS `bg-[var(--color-primary3)]` → `bg-(--color-primary3)`
  - **Eliminar o usar:** Variables no usadas
    - `paymentMethods` (línea 48)
    - `setSelectedPaymentId` (línea 52)
    - `paymentMethod` (línea 295)
    - `setPaymentMethod` (línea 295)

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

---

## ✅ CHECKLIST PRE-DEPLOY

Antes de llevar a producción, verificar:

- [ ] DDL ejecutado en base de datos
- [ ] Flujo de compra probado end-to-end
- [ ] Pasarela de pago integrada y probada
- [ ] Emails de confirmación configurados
- [ ] Variables de entorno configuradas (DB, API keys, etc.)
- [ ] Build de producción exitoso (`npm run build`)
- [ ] HTTPS configurado
- [ ] Backup de base de datos configurado
- [ ] Monitoreo de errores (Sentry, etc.)
- [ ] Documentación de deployment actualizada
