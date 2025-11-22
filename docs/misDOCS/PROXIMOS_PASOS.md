# 🎯 PRÓXIMOS PASOS - MOA

> **Actualizado:** 21 de Noviembre, 2025

---

## 📊 Situación Actual

```
✅ Funcionalidades core:     COMPLETAS (100%)
✅ Panel administrativo:     FUNCIONAL (95%)
⚠️  Pasarela de pago:        SIMULADA
⚠️  Testing:                 MÍNIMO (5%)
⚠️  Performance:             OPTIMIZABLE (60%)
```

**Estado general:** El proyecto está **85% completo** y **funcionalmente operativo** para un ambiente de desarrollo/staging. La pasarela de pago se mantiene simulada y fuera de alcance; el foco está en las acciones críticas detalladas a continuación.

---

## 🚨 ACCIONES CRÍTICAS (Bloqueantes para Producción)

### 1. Remover Logs Sensibles



**Prioridad:** 🔴 ALTA  
**Tiempo estimado:** 2-3 días  
**Riesgo:** Exposición de datos sensibles en producción

#### Archivos afectados:

```javascript
// backend/src/services/emailService.js
// Líneas 17, 31, 44-47, 177, 182, 212, 240, 245

// backend/src/controllers/passwordResetController.js
// Líneas 33, 41, 66, 117, 123, 144
```

#### Solución:

1. **Instalar Winston**
   ```bash
   cd backend
   npm install winston
   ```

2. **Crear logger**
   ```javascript
   // backend/src/utils/logger.js
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ 
         filename: 'logs/error.log', 
         level: 'error' 
       }),
       new winston.transports.File({ 
         filename: 'logs/combined.log' 
       })
     ]
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   
   export default logger;
   ```

3. **Reemplazar console.log**
   ```javascript
   // Antes
   console.log('[EmailService] ✅ Email enviado:', info.messageId);
   
   // Después
   import logger from '../utils/logger.js';
   logger.info('Email enviado', { messageId: info.messageId });
   ```

4. **Variables de entorno**
   ```env
   # Producción
   NODE_ENV=production
   LOG_LEVEL=warn
   
   # Desarrollo
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

---

### 2. Optimización de Performance Frontend

**Prioridad:** 🟡 MEDIA  
**Tiempo estimado:** 1 semana  
**Impacto:** Mejora significativa en carga inicial

#### Acciones:

**A. Code Splitting**

```javascript
// frontend/src/app/App.jsx
import { lazy, Suspense } from 'react';

// Lazy load de módulos admin (no se necesitan en carga inicial)
const AdminDashboard = lazy(() => import('@/modules/admin/pages/AdminDashboardPage'));
const OrdersAdmin = lazy(() => import('@/modules/admin/pages/orders/OrdersAdminPageV2'));
const CustomersPage = lazy(() => import('@/modules/admin/pages/CustomersPage'));
const ProductsAdmin = lazy(() => import('@/modules/admin/pages/products/ProductsAdminPage'));

// Lazy load de páginas secundarias
const ProductDetailPage = lazy(() => import('@/modules/products/pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('@/modules/cart/pages/CheckoutPage'));

// Wrapper con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    {/* ... más rutas */}
  </Routes>
</Suspense>
```

**B. Optimizar imports de Lucide**

```javascript
// ❌ Antes (importa TODO el bundle)
import * as Icons from 'lucide-react';

// ✅ Después (solo lo necesario)
import { ShoppingCart, User, Package, TrendingUp } from 'lucide-react';
```

**Script para encontrar imports problemáticos:**
```bash
cd frontend
grep -r "import \* as.*from 'lucide-react'" src/
```

**C. Lazy loading de imágenes**

```jsx
// ProductCard.jsx y ProductDetailPage.jsx
<img 
  src={product.imagen} 
  alt={product.nombre}
  loading="lazy"  // ✅ Agregar este atributo
  className="..."
/>
```

**D. Optimizar TanStack Query**

```javascript
// frontend/src/app/App.jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false, // Evitar refetch innecesarios
    },
  },
});
```

**E. Medir impacto**

```bash
# Build antes
npm run build
# Nota: Revisar tamaño en dist/

# Después de optimizaciones
npm run build
# Compare el tamaño del bundle
```

**Objetivo:** Reducir de 1.09 MB a < 500 KB

---

## 🟡 ACCIONES IMPORTANTES (Mejoras significativas)

### 3. Testing Completo

**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 2 semanas  
**Cobertura actual:** ~5%

#### Backend Testing

**A. Tests unitarios de controllers**

```javascript
// backend/__tests__/auth.test.js
import request from 'supertest';
import app from '../index.js';

describe('Auth Controller', () => {
  describe('POST /api/auth/login', () => {
    it('debe retornar token con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@moa.cl',
          password: 'admin'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });
    
    it('debe retornar 401 con credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@moa.cl',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
```

**B. Tests de integración**

```javascript
// backend/__tests__/checkout-flow.test.js
describe('Flujo de Checkout Completo', () => {
  let token;
  let cartId;
  let orderId;
  
  beforeAll(async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@moa.cl', password: 'demo' });
    token = loginRes.body.data.token;
  });
  
  it('debe crear orden desde carrito', async () => {
    // 1. Agregar producto al carrito
    const addToCart = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productoId: 1, cantidad: 2 });
    
    expect(addToCart.status).toBe(200);
    cartId = addToCart.body.data.carrito_id;
    
    // 2. Crear orden
    const createOrder = await request(app)
      .post('/api/checkout/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        direccion_id: 1,
        metodo_pago: 'webpay',
        metodo_despacho: 'standard'
      });
    
    expect(createOrder.status).toBe(201);
    expect(createOrder.body.data).toHaveProperty('orden_id');
    orderId = createOrder.body.data.orden_id;
    
    // 3. Verificar que carrito se vació
    const getCart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    
    expect(getCart.body.data.items).toHaveLength(0);
  });
});
```

**C. Ejecutar tests**

```bash
cd backend
npm test

# Con cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Frontend Testing

**A. Tests de componentes**

```javascript
// frontend/src/modules/cart/__tests__/CheckoutPage.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import CheckoutPage from '../pages/CheckoutPage';

describe('CheckoutPage', () => {
  it('debe mostrar formulario de checkout', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CheckoutPage />
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/método de pago/i)).toBeInTheDocument();
    expect(screen.getByText(/método de envío/i)).toBeInTheDocument();
  });
  
  it('debe validar campos requeridos', async () => {
    render(<CheckoutPage />);
    
    const submitButton = screen.getByRole('button', { name: /confirmar/i });
    await userEvent.click(submitButton);
    
    expect(await screen.findByText(/selecciona una dirección/i))
      .toBeInTheDocument();
  });
});
```

**B. Tests E2E con Playwright**

```bash
npm install -D @playwright/test

# frontend/e2e/checkout.spec.js
import { test, expect } from '@playwright/test';

test('flujo de compra completo', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:5174/login');
  await page.fill('input[name="email"]', 'demo@moa.cl');
  await page.fill('input[name="password"]', 'demo');
  await page.click('button[type="submit"]');
  
  // 2. Agregar producto
  await page.goto('http://localhost:5174/productos');
  await page.click('[data-testid="add-to-cart"]:first-of-type');
  
  // 3. Ir al carrito
  await page.click('[data-testid="cart-icon"]');
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  
  // 4. Checkout
  await page.click('text=Proceder al checkout');
  
  // 5. Completar formulario
  await page.selectOption('select[name="direccion"]', '1');
  await page.selectOption('select[name="metodo_pago"]', 'webpay');
  
  // 6. Confirmar
  await page.click('button:has-text("Confirmar pedido")');
  await page.click('button:has-text("Sí, crear orden")'); // Modal
  
  // 7. Verificar página de confirmación
  await expect(page.locator('text=/pedido confirmado/i')).toBeVisible();
  await expect(page.locator('text=/MOA-/i')).toBeVisible();
});
```

---

### 4. Sistema de Notificaciones por Email

**Prioridad:** 🟡 MEDIA  
**Tiempo estimado:** 1 semana  
**Estado:** Email service implementado, faltan templates adicionales

#### Emails pendientes:

**A. Email de cambio de estado de orden**

```javascript
// backend/src/services/emailService.js

export const sendOrderStatusUpdate = async (order, newStatus) => {
  const statusMessages = {
    procesando: 'Tu pedido está siendo procesado',
    enviado: 'Tu pedido ha sido enviado',
    entregado: 'Tu pedido ha sido entregado'
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Estilos del template */
        </style>
      </head>
      <body>
        <h1>${statusMessages[newStatus]}</h1>
        <p>Hola ${order.usuario_nombre},</p>
        <p>Tu pedido <strong>#${order.codigo_orden}</strong> ha cambiado de estado.</p>
        
        <div class="status-box">
          <p>Estado actual: <strong>${newStatus}</strong></p>
        </div>
        
        ${order.numero_seguimiento ? `
          <p>Número de seguimiento: <strong>${order.numero_seguimiento}</strong></p>
          <p>Courier: ${order.empresa_envio}</p>
        ` : ''}
        
        <a href="${process.env.FRONTEND_URL}/perfil?tab=orders">Ver mi pedido</a>
      </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: order.usuario_email,
    subject: `MOA - ${statusMessages[newStatus]}`,
    html
  });
};
```

**B. Integrar en controller de admin**

```javascript
// backend/src/controllers/orderAdminController.js

import * as emailService from '../services/emailService.js';

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_envio, estado_pago } = req.body;
    
    // Actualizar en BD
    const updatedOrder = await orderAdminModel.updateOrderStatus(id, {
      estado_envio,
      estado_pago
    });
    
    // Enviar email si cambió el estado de envío
    if (estado_envio && estado_envio !== updatedOrder.previous_estado_envio) {
      await emailService.sendOrderStatusUpdate(updatedOrder, estado_envio);
    }
    
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    // Error handling
  }
};
```

**C. Email de carrito abandonado (opcional)**

```javascript
// Crear cron job que se ejecute diariamente
// backend/src/jobs/abandonedCart.js

export const checkAbandonedCarts = async () => {
  // Buscar carritos con items que no se hayan modificado en 24h
  const abandonedCarts = await cartModel.findAbandoned(24);
  
  for (const cart of abandonedCarts) {
    await emailService.sendAbandonedCartReminder(cart);
  }
};
```

---

## 🟢 MEJORAS OPCIONALES (No bloqueantes)

### 5. Tracking Automático de Couriers

**Tiempo estimado:** 1-2 semanas

**APIs disponibles:**
- Chilexpress: https://developers.chipax.com/docs/chilexpress
- Blue Express: https://www.blue.cl/integraciones
- Starken: https://www.starken.cl/developers

**Implementación sugerida:**

```javascript
// backend/src/services/tracking.service.js

export const getTrackingInfo = async (trackingNumber, courier) => {
  switch (courier.toLowerCase()) {
    case 'chilexpress':
      return await getChilexpressTracking(trackingNumber);
    case 'blue-express':
      return await getBlueExpressTracking(trackingNumber);
    case 'starken':
      return await getStarkenTracking(trackingNumber);
    default:
      throw new Error('Courier no soportado');
  }
};

// Cron job para actualizar estados
export const updateAllTrackingStatuses = async () => {
  const ordersWithTracking = await orderModel.findWithTracking();
  
  for (const order of ordersWithTracking) {
    const trackingInfo = await getTrackingInfo(
      order.numero_seguimiento,
      order.empresa_envio
    );
    
    if (trackingInfo.status !== order.estado_envio) {
      await orderModel.updateShippingStatus(
        order.orden_id,
        trackingInfo.status
      );
      
      // Enviar email de actualización
      await emailService.sendOrderStatusUpdate(order, trackingInfo.status);
    }
  }
};
```

---

### 6. Documentación API con Swagger

**Tiempo estimado:** 3-4 días

```bash
cd backend
npm install swagger-jsdoc swagger-ui-express
```

```javascript
// backend/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MOA API',
      version: '1.0.0',
      description: 'API REST para e-commerce MOA',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
```

```javascript
// backend/index.js
import { specs, swaggerUi } from './swagger.js';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Documentar endpoints:**

```javascript
// backend/routes/authRoutes.js

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 */
router.post('/login', authController.login);
```

---

## 📅 Cronograma Sugerido

```
SEMANA 1-2: Pasarela de Pago (CRÍTICO)
├─ Días 1-3: Setup Transbank/Stripe
├─ Días 4-7: Implementación backend
├─ Días 8-10: Integración frontend
├─ Días 11-12: Testing con tarjetas ficticias
└─ Días 13-14: Documentación y refinamiento

SEMANA 3: Seguridad y Logs
├─ Días 1-2: Implementar Winston logger
├─ Día 3: Reemplazar console.log
├─ Días 4-5: Testing y verificación
└─ Días 6-7: Auditoría de seguridad

SEMANA 4: Optimización Frontend
├─ Días 1-2: Code splitting
├─ Día 3: Optimizar imports lucide
├─ Día 4: Lazy loading de imágenes
├─ Día 5: Build y medición
└─ Días 6-7: Ajustes finales

SEMANA 5-6: Testing Completo
├─ Semana 5: Backend tests
│   ├─ Días 1-3: Tests unitarios
│   └─ Días 4-7: Tests de integración
└─ Semana 6: Frontend tests
    ├─ Días 1-3: Tests de componentes
    ├─ Días 4-5: Tests E2E
    └─ Días 6-7: Cobertura y reports

SEMANA 7: Notificaciones
├─ Días 1-3: Templates de email
├─ Días 4-5: Integración con controllers
└─ Días 6-7: Testing de emails

SEMANA 8: Pre-Producción
├─ Días 1-2: Configurar servidor
├─ Día 3: Configurar BD producción
├─ Día 4: Variables de entorno
├─ Día 5: Deploy y smoke tests
└─ Días 6-7: Monitoreo y documentación final
```

---

## ✅ Checklist Pre-Deploy

Antes de lanzar a producción, verificar:

### Infraestructura
- [ ] Servidor configurado y accesible
- [ ] Dominio apuntando al servidor
- [ ] HTTPS/SSL certificado instalado
- [ ] PostgreSQL en servidor dedicado
- [ ] Backup automático configurado
- [ ] Firewall configurado

### Backend
- [ ] Variables de entorno de producción configuradas
- [ ] Pasarela de pago con credenciales reales
- [ ] Logs sensibles removidos
- [ ] Rate limiting activo
- [ ] CORS configurado para dominio real
- [ ] Error handling completo
- [ ] Health check endpoint funcionando

### Frontend
- [ ] Build de producción generado
- [ ] Variables de entorno apuntando a API real
- [ ] Bundle optimizado (< 500 KB)
- [ ] Assets en CDN (opcional)
- [ ] Service worker para PWA (opcional)

### Base de Datos
- [ ] Migraciones ejecutadas
- [ ] Índices optimizados
- [ ] Backup configurado
- [ ] Política de retención definida

### Testing
- [ ] Tests unitarios pasando (> 70%)
- [ ] Tests de integración pasando
- [ ] Tests E2E del flujo crítico
- [ ] Performance testing (Lighthouse > 85)
- [ ] Security audit completo

### Legal
- [ ] Términos y condiciones publicados
- [ ] Política de privacidad publicada
- [ ] Política de devoluciones definida
- [ ] Aviso legal

### Monitoreo
- [ ] Sentry o similar configurado
- [ ] Logs centralizados
- [ ] Alertas de errores activas
- [ ] Uptime monitoring

---

## 📞 Recursos Útiles

### Documentación del Proyecto
- Estado completo: `/docs/ESTADO_PROYECTO_NOV_2025.md`
- Resumen visual: `/docs/RESUMEN_VISUAL.md`
- Tareas: `/docs/TODO.md`
- README: `/README.md`

### Documentación Externa
- Transbank: https://www.transbankdevelopers.cl/
- Stripe: https://stripe.com/docs
- React Query: https://tanstack.com/query/latest
- PostgreSQL: https://www.postgresql.org/docs/

### Testing
- Jest: https://jestjs.io/
- Playwright: https://playwright.dev/
- React Testing Library: https://testing-library.com/react

---

## 🎯 Resumen de Prioridades

```
🔴 CRÍTICO (Bloqueante)
   1. Integrar pasarela de pago real
   2. Remover logs sensibles

🟡 IMPORTANTE (Alta prioridad)
   3. Optimizar performance frontend
   4. Testing completo (70% cobertura)
   5. Sistema de notificaciones

🟢 OPCIONAL (Mejoras)
   6. Tracking automático de couriers
   7. Documentación API (Swagger)
   8. Sistema de cupones/descuentos
```

---

**Última actualización:** 21 de Noviembre, 2025  
**Próxima revisión sugerida:** Después de completar Sprint 1-2
