# Guía de Troubleshooting - MOA E-commerce

Soluciones a problemas comunes en desarrollo, producción y administración de la plataforma MOA.

## 📋 Tabla de Contenidos

1. [Problemas de Desarrollo](#problemas-de-desarrollo)
2. [Problemas de Base de Datos](#problemas-de-base-de-datos)
3. [Problemas de Autenticación](#problemas-de-autenticación)
4. [Problemas de Frontend](#problemas-de-frontend)
5. [Problemas de Backend/API](#problemas-de-backendapi)
6. [Problemas de Producción](#problemas-de-producción)
7. [Logs y Debugging](#logs-y-debugging)
8. [Contacto de Soporte](#contacto-de-soporte)

---

## 🛠️ Problemas de Desarrollo

### 1. No puedo instalar dependencias

**Error**:
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Soluciones**:
```bash
# Opción 1: Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm cache clean --force
npm install

# Opción 2: Usar --legacy-peer-deps
npm install --legacy-peer-deps

# Opción 3: Verificar versión de Node
node -v  # Debe ser 18+ (recomendado 20 LTS)
nvm use 20  # Si usas nvm
```

---

### 2. Frontend no carga después de `npm run dev`

**Síntomas**: Página en blanco, error "Failed to fetch dynamically imported module"

**Soluciones**:
```bash
# Solución 1: Limpiar caché de Vite
rm -rf frontend/node_modules/.vite
npm run -w frontend dev

# Solución 2: Hard refresh del navegador
# Chrome/Firefox: Ctrl+Shift+R (Cmd+Shift+R en Mac)

# Solución 3: Verificar puerto 5173 libre
lsof -i :5173  # Ver qué proceso usa el puerto
kill -9 <PID>  # Matar proceso si es necesario

# Solución 4: Reinstalar frontend
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

**Si persiste**:
- Verifica que `vite.config.js` tenga configuración correcta
- Revisa console del navegador (F12) para errores específicos
- Asegúrate de que `VITE_API_URL` en `.env` sea correcto

---

### 3. Backend no inicia - Error de conexión a DB

**Error**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
  at TCPConnectWrap.afterConnect
```

**Soluciones**:
```bash
# Paso 1: Verificar que PostgreSQL esté corriendo
psql --version  # Debe mostrar versión 17+

# Mac (Homebrew)
brew services list | grep postgresql
brew services start postgresql@17

# Linux (systemd)
sudo systemctl status postgresql
sudo systemctl start postgresql

# Paso 2: Verificar credenciales en backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_real
DB_NAME=moa_db

# Paso 3: Probar conexión manual
psql -h localhost -U postgres -d moa_db

# Paso 4: Verificar que base de datos exista
psql -U postgres -c "\l" | grep moa_db

# Si no existe, crearla:
npm run -w backend db
```

---

### 4. Error "Module not found" con alias `@/`

**Error**:
```
Error: Cannot find module '@/components/ui/Button'
```

**Soluciones**:
```bash
# Verificar jsconfig.json en frontend/
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}

# Reiniciar servidor de desarrollo
# Ctrl+C y volver a ejecutar:
npm run -w frontend dev

# Si el archivo existe, verifica la extensión:
# Correcto: import Button from '@/components/ui/Button.jsx'
# Incorrecto: import Button from '@/components/ui/Button'
```

---

## 🗄️ Problemas de Base de Datos

### 1. Error "relation 'usuarios' does not exist"

**Causa**: Schema de la base de datos no está creado

**Solución**:
```bash
# Opción 1: Ejecutar script de creación
npm run -w backend db

# Opción 2: Manual con psql
psql -U postgres -d moa_db -f backend/database/schema/DDL.sql

# Verificar que tablas existan
psql -U postgres -d moa_db -c "\dt"
```

---

### 2. Datos de prueba no aparecen

**Causa**: Seeders no se han ejecutado

**Solución**:
```bash
# Ejecutar todos los seeders en orden
npm run -w backend seed:all

# O ejecutar individualmente en orden correcto:
npm run -w backend seed:users       # Primero usuarios
npm run -w backend seed:categories  # Luego categorías
npm run -w backend seed:products    # Productos (requiere categorías)
npm run -w backend seed:addresses   # Direcciones (requiere usuarios)
npm run -w backend seed:orders      # Órdenes (requiere todo lo anterior)

# Verificar datos
psql -U postgres -d moa_db -c "SELECT COUNT(*) FROM productos;"
psql -U postgres -d moa_db -c "SELECT COUNT(*) FROM usuarios;"
```

---

### 3. Error "duplicate key violates unique constraint"

**Causa**: Intentando insertar dato con clave primaria/única duplicada

**Soluciones**:
```bash
# Caso 1: Seeders corriendo múltiples veces
# Resetear base de datos completa:
npm run -w backend db:reset
npm run -w backend db
npm run -w backend seed:all

# Caso 2: Desarrollo - limpiar tabla específica
psql -U postgres -d moa_db -c "TRUNCATE TABLE productos CASCADE;"

# Caso 3: Resetear secuencias auto-increment
psql -U postgres -d moa_db -c "
  SELECT setval('usuarios_usuario_id_seq', (SELECT MAX(usuario_id) FROM usuarios));
  SELECT setval('productos_producto_id_seq', (SELECT MAX(producto_id) FROM productos));
"
```

---

### 4. Migraciones pendientes

**Error**: "Your database is out of sync with migrations"

**Solución**:
```bash
# Ver migraciones pendientes
ls backend/database/schema/migrations/

# Aplicar migración específica
psql -U postgres -d moa_db -f backend/database/schema/migrations/001_add_tracking_to_orders.sql

# Verificar cambios
psql -U postgres -d moa_db -c "\d ordenes"  # Ver estructura de tabla
```

---

## 🔐 Problemas de Autenticación

### 1. Token JWT expirado

**Error**: `401 Unauthorized` o "Token inválido o expirado"

**Soluciones**:
```javascript
// Frontend: Logout automático implementado en api-client.js
// Para usuarios normales: token dura 24h (configurable)
// Para admins: token dura 7 días

// Solución temporal (desarrollo): Aumentar expiración en backend/.env
JWT_EXPIRES_IN=30d           # Clientes
JWT_ADMIN_EXPIRES_IN=90d     # Admins

// Solución permanente: Implementar refresh tokens
// (Ver docs/misDOCS/AUTH_REFRESH_TOKENS.md)
```

**Manual logout/login**:
```javascript
// Desde consola del navegador (F12):
localStorage.clear();
window.location.href = '/login';
```

---

### 2. No puedo hacer login - Credenciales correctas

**Síntomas**: Email y password correctos pero login falla

**Soluciones**:
```bash
# 1. Verificar usuario en DB
psql -U postgres -d moa_db -c "SELECT email, activo FROM usuarios WHERE email='admin@moa.cl';"

# 2. Usuario desactivado? Activar:
psql -U postgres -d moa_db -c "UPDATE usuarios SET activo=true WHERE email='admin@moa.cl';"

# 3. Verificar hash de password
# Regenerar password para admin:
node backend/scripts/resetAdminPassword.js

# 4. Verificar que JWT_SECRET esté configurado en backend/.env
echo $JWT_SECRET  # No debe estar vacío
```

---

### 3. "No autorizado" al acceder a rutas admin

**Error**: 403 Forbidden en `/admin/*`

**Soluciones**:
```bash
# Verificar rol del usuario en DB
psql -U postgres -d moa_db -c "
  SELECT u.email, r.rol_code 
  FROM usuarios u 
  JOIN roles r ON u.rol_id = r.rol_id 
  WHERE u.email='tu_email@example.com';
"

# Cambiar rol a ADMIN
psql -U postgres -d moa_db -c "
  UPDATE usuarios 
  SET rol_id = (SELECT rol_id FROM roles WHERE rol_code='ADMIN')
  WHERE email='tu_email@example.com';
"

# Verificar JWT payload (desde consola del navegador F12):
const token = localStorage.getItem('token');
console.log(JSON.parse(atob(token.split('.')[1])));
// Debe tener: { role_code: 'ADMIN', ... }
```

---

## 🎨 Problemas de Frontend

### 1. Estilos Tailwind no se aplican

**Síntomas**: Clases CSS no funcionan, elementos sin estilo

**Soluciones**:
```bash
# 1. Verificar que Tailwind esté corriendo
# Debe generar estilos automáticamente en modo dev

# 2. Revisar tailwind.config.js (frontend/):
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"  # Debe incluir tus archivos
  ],
  // ...
}

# 3. Limpiar build y reiniciar
rm -rf frontend/node_modules/.vite
npm run -w frontend dev

# 4. Verificar que main.css importe Tailwind
# frontend/src/index.css debe tener:
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 2. React Query cache no actualiza

**Síntomas**: Datos viejos en pantalla después de mutación exitosa

**Solución**:
```javascript
// Invalidar cache manualmente después de mutación
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createProduct,
  onSuccess: () => {
    // Invalida y refetch automático
    queryClient.invalidateQueries({ queryKey: ['products'] });
    
    // O actualiza directamente el cache
    queryClient.setQueryData(['products'], (old) => [...old, newProduct]);
  }
});

// Verificar configuración global (frontend/src/main.jsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});
```

---

### 3. Componente lazy no carga ("Loading chunk failed")

**Error**: `ChunkLoadError: Loading chunk X failed`

**Soluciones**:
```bash
# Solución 1: Hard refresh
Ctrl+Shift+R (Cmd+Shift+R en Mac)

# Solución 2: Limpiar caché Vite
rm -rf frontend/node_modules/.vite
npm run -w frontend dev

# Solución 3: Verificar import en App.jsx
const ProductsPage = lazy(() => import('@/modules/products/pages/ProductsPage.jsx'));
# Asegúrate de que la ruta sea correcta

# Solución 4: Rebuild completo
npm run -w frontend build
```

---

### 4. Infinite loop con useEffect

**Síntomas**: Página congela, memory spike, console spammeado

**Causa común**:
```javascript
// ❌ MAL: Array/objeto nuevo cada render
useEffect(() => {
  fetchData();
}, [{ id: 1 }]);  // Nuevo objeto cada vez!

// ✅ BIEN: Dependencias primitivas
useEffect(() => {
  fetchData();
}, [id]);  // Solo cuando id cambia

// ✅ BIEN: Memoizar objetos/arrays
const filters = useMemo(() => ({ id: 1 }), [id]);
useEffect(() => {
  fetchData(filters);
}, [filters]);
```

---

## 🚀 Problemas de Backend/API

### 1. CORS error en requests

**Error**: `Access to fetch at 'http://localhost:4000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Soluciones**:
```javascript
// backend/index.js - Verificar configuración CORS
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// backend/.env - Verificar variables
CORS_ORIGIN=http://localhost:5173

// Producción: múltiples orígenes
CORS_ORIGIN=https://moa.cl,https://www.moa.cl
```

---

### 2. Request timeout / servidor no responde

**Síntomas**: Request queda pending infinitamente

**Soluciones**:
```bash
# 1. Verificar que backend esté corriendo
curl http://localhost:4000/api/health
# Debe retornar: {"status":"ok"}

# 2. Revisar logs del backend
npm run -w backend dev
# Buscar errores en consola

# 3. Verificar puerto correcto en frontend
# frontend/.env
VITE_API_URL=http://localhost:4000  # Sin trailing slash!

# 4. Probar endpoint con curl
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moa.cl","password":"admin"}'
```

---

### 3. Error 500 - Internal Server Error

**Causa**: Exception no manejada en backend

**Debugging**:
```bash
# 1. Revisar logs del backend (terminal donde corre npm run dev)
# Buscar stack trace completo

# 2. Agregar logs temporales en controller
console.log('Data recibida:', req.body);
console.log('Usuario autenticado:', req.user);

# 3. Verificar middleware errorHandler (backend/src/middleware/errorHandler.js)
# Debe estar al FINAL de todos los routes en index.js
app.use(errorHandler);

# 4. Test manual del endpoint con datos válidos
curl -X POST http://localhost:4000/api/productos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "sku": "TEST-001",
    "descripcion": "Test producto",
    "categoria_id": 1,
    "precio": 10000,
    "stock": 5
  }'
```

---

### 4. Stock no se descuenta al crear orden

**Síntomas**: Productos se venden pero stock no baja

**Soluciones**:
```bash
# 1. Verificar que SELECT FOR UPDATE esté presente
# backend/src/models/orderModel.js línea ~56
const stockQuery = `
  SELECT producto_id, stock 
  FROM productos 
  WHERE producto_id = ANY($1)
  FOR UPDATE  # <-- Debe estar aquí
`;

# 2. Verificar que UPDATE stock esté ejecutándose
# Agregar log temporal después de línea 73:
console.log('Stock actualizado para producto:', productId, 'nuevo stock:', newStock);

# 3. Probar transacción manual
psql -U postgres -d moa_db
BEGIN;
SELECT stock FROM productos WHERE producto_id=1 FOR UPDATE;
UPDATE productos SET stock = stock - 1 WHERE producto_id=1;
SELECT stock FROM productos WHERE producto_id=1;
COMMIT;

# 4. Verificar que orden esté en estado 'confirmed'
psql -U postgres -d moa_db -c "SELECT orden_id, estado_orden FROM ordenes ORDER BY orden_id DESC LIMIT 5;"
```

---

## 🌐 Problemas de Producción

### 1. App no carga después de deploy

**Checklist**:
```bash
# 1. Verificar build exitoso
npm run -w frontend build
# Debe generar frontend/dist/ sin errores

# 2. Verificar variables de entorno en servidor
# Deben estar configuradas en panel de hosting (Vercel/Netlify/etc)
VITE_API_URL=https://api.moa.cl  # URL producción

# 3. Verificar que backend esté accesible
curl https://api.moa.cl/api/health

# 4. Revisar logs del servidor
# Vercel: vercel logs
# Heroku: heroku logs --tail
# Railway: railway logs

# 5. Verificar CORS en producción
# backend/.env en servidor
CORS_ORIGIN=https://moa.cl,https://www.moa.cl
```

---

### 2. SSL/HTTPS problemas

**Error**: "Mixed Content" o certificado inválido

**Soluciones**:
```javascript
// 1. Asegurarse de que API_URL use https://
VITE_API_URL=https://api.moa.cl  # NO http://

// 2. Verificar que certificado SSL esté activo
# Cloudflare, Let's Encrypt, o proveedor de hosting debe tenerlo

// 3. Forzar HTTPS en Express (backend)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

### 3. Database connection pool exhausted

**Error**: "remaining connection slots reserved for non-replication superuser connections"

**Soluciones**:
```javascript
// backend/database/config.js
import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  // Ajustar límites según tier de DB
  max: 20,  # Reducir si DB tiene límite bajo (ej: Heroku free tier = 20)
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Liberar conexiones correctamente
const client = await pool.connect();
try {
  // ... queries
} finally {
  client.release();  // ¡SIEMPRE LIBERAR!
}
```

---

### 4. Emails no llegan en producción

**Soluciones**:
```bash
# 1. Verificar credenciales SMTP en producción
# backend/.env (servidor)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@moa.cl
SMTP_PASS=app_password_real  # NO la contraseña normal!
EMAIL_FROM=noreply@moa.cl

# 2. Gmail: Habilitar "App Passwords"
# https://myaccount.google.com/apppasswords

# 3. Verificar que servicio email esté iniciado
# backend/src/services/emailService.js debe estar importado

# 4. Test manual desde backend
node -e "
  import emailService from './backend/src/services/emailService.js';
  emailService.sendOrderConfirmation({
    email: 'tu_email@test.com',
    orderCode: 'TEST-001',
    // ...
  });
"
```

---

## 🔍 Logs y Debugging

### Ubicación de Logs

#### Desarrollo
```bash
# Backend logs (terminal)
npm run -w backend dev
# Muestra console.logs, errores de DB, requests HTTP

# Frontend logs (navegador F12)
Console tab: errores JS, console.logs, warnings
Network tab: requests HTTP, tiempos de respuesta
```

#### Producción
```bash
# Vercel
vercel logs --follow

# Heroku
heroku logs --tail --app moa-backend

# Railway
railway logs

# PM2 (VPS)
pm2 logs moa-backend
pm2 logs moa-backend --lines 100
```

---

### Debugging Backend con VS Code

**Configuración** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**Uso**:
1. Coloca breakpoints (click en número de línea)
2. Presiona F5 o "Run → Start Debugging"
3. Ejecuta request desde frontend o curl
4. Inspecciona variables en panel izquierdo

---

### Debugging Frontend con React DevTools

**Instalación**:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React DevTools](https://addons.mozilla.org/firefox/addon/react-devtools/)

**Uso**:
1. Abre DevTools (F12)
2. Tab "⚛️ Components" para árbol de componentes
3. Tab "⚛️ Profiler" para performance
4. Inspecciona props, state, hooks de cada componente

---

### Debugging SQL Queries

```javascript
// Agregar logging temporal en modelo
const query = `SELECT * FROM productos WHERE producto_id = $1`;
const values = [productId];

console.log('SQL Query:', query);  // <-- Log query
console.log('Values:', values);    // <-- Log parámetros

const { rows } = await pool.query(query, values);
console.log('Result rows:', rows.length);  // <-- Log resultados
```

**Ejecutar query manualmente**:
```bash
psql -U postgres -d moa_db

# Ejecutar query exacta
SELECT * FROM productos WHERE producto_id = 1;

# Explain query plan
EXPLAIN ANALYZE SELECT * FROM productos WHERE categoria_id = 5;
```

---

## 📞 Contacto de Soporte

### Antes de Contactar

1. **Revisa esta guía completa**
2. **Busca el error en GitHub Issues**: Puede que alguien ya lo resolvió
3. **Intenta las soluciones propuestas**
4. **Recopila información**:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Screenshots/videos (si aplica)
   - Logs completos (backend + frontend console)
   - Versiones: Node, PostgreSQL, SO
   - ¿Desarrollo o producción?

### Canales de Soporte

📧 **Email**: soporte@moa.cl  
📞 **Teléfono**: +56912345678 (Lunes a Viernes, 9:00-18:00 CLT)  
💬 **GitHub Issues**: [MOA Issues](https://github.com/pitu-ebensperger/MOA/issues)  
📚 **Documentación**: `docs/misDOCS/`

### Formato de Reporte de Bug

```markdown
## Descripción del Problema
[Qué está fallando]

## Entorno
- OS: macOS 14 / Windows 11 / Ubuntu 22.04
- Node: 20.10.0
- PostgreSQL: 17.1
- Navegador: Chrome 120 / Firefox 121
- Ambiente: Desarrollo / Producción

## Pasos para Reproducir
1. Ir a /admin/productos
2. Click en "Nuevo Producto"
3. Completar formulario
4. Click en "Guardar"
5. Ver error

## Comportamiento Esperado
Producto se crea y aparece en lista

## Comportamiento Actual
Error 500 y producto no se crea

## Logs
Backend logs:
```
[Error logs aquí]
```

Frontend console (F12):
```
[Console errors aquí]
```

## Screenshots
[Adjuntar imágenes]

## Intentos de Solución
- Reinicié servidor: ❌ No funcionó
- Limpié caché: ❌ No funcionó
- Verifiqué DB: ✅ Tablas existen
```

---

## 🔄 Actualizaciones de Esta Guía

Esta guía se actualiza constantemente. Última actualización: **Noviembre 2025**

Si encuentras un problema no documentado aquí y logras resolverlo, considera contribuir a esta guía siguiendo el [CONTRIBUTING.md](./CONTRIBUTING.md).

---

**Documentación Relacionada**:
- [Manual de Administrador](./ADMIN_MANUAL.md)
- [Guía de Contribución](./CONTRIBUTING.md)
- [Estado del Proyecto](./ESTADO_PROYECTO_NOV_2025.md)
- [Fixes Críticos Implementados](./FIXES_CRITICOS_NOV_2025.md)
