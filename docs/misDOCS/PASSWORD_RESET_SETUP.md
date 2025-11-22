# Guía de Configuración - Password Reset

**Fecha:** 21 de noviembre, 2025  
**Estado:** ✅ Implementado - Requiere configuración de email

---

## ✅ IMPLEMENTACIÓN COMPLETADA

### Frontend
- ✅ Rutas agregadas a `API_PATHS`
- ✅ `ForgotPasswordPage.jsx` lista
- ✅ `ResetPasswordPage.jsx` lista
- ✅ `auth.api.js` actualizado

### Backend
- ✅ Tabla `password_reset_tokens` creada
- ✅ Model `passwordResetModel.js` creado
- ✅ Service `emailService.js` creado
- ✅ Controller `passwordResetController.js` creado
- ✅ Routes actualizadas en `authRoutes.js`
- ✅ Function `updateUserPasswordModel` agregada
- ✅ Dependencia `nodemailer` instalada
- ✅ Email service cae en cuenta Ethereal automáticamente si no hay SMTP
- ✅ Helpers `verifyEmailConfig()` y `sendTestEmail()` listos para validar conexiones

---

## 🔧 CONFIGURACIÓN REQUERIDA

> ℹ️ **Modo automático:** si no defines variables SMTP, `emailService` genera una cuenta temporal en Ethereal y muestra las credenciales/URL en consola. Sirve para desarrollo local y no requiere pasos adicionales.

### 1. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-specific-password
SMTP_FROM=noreply@moa.cl

# Frontend URL (para links en emails)
FRONTEND_URL=http://localhost:5173
```

### 2. Configurar Gmail (Recomendado para desarrollo)

#### Opción A: App Password (Recomendado)

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Navega a "Seguridad"
3. Activa "Verificación en 2 pasos" (requerido)
4. Ve a "Contraseñas de aplicaciones"
5. Selecciona "Correo" y "Otro" (escribe "MOA Backend")
6. Copia la contraseña de 16 caracteres
7. Usa esta contraseña en `SMTP_PASS`

#### Opción B: Permitir aplicaciones menos seguras (No recomendado)

1. Ve a https://myaccount.google.com/lesssecureapps
2. Activa "Permitir aplicaciones menos seguras"
3. Usa tu contraseña normal en `SMTP_PASS`

### 3. Alternativas de Email Providers

#### SendGrid (100 emails/día gratis)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
```

#### Mailgun (5,000 emails/mes gratis)
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASS=tu-password-de-mailgun
```

#### AWS SES (Muy económico)
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=tu-smtp-username
SMTP_PASS=tu-smtp-password
```

---

## 📦 BASE DE DATOS

- Script listo en `backend/database/schema/password_reset.sql`
- Incluye tabla `password_reset_tokens`, índices (`token`, `usuario_id`, `expires_at`) y comentarios
- Ejecuta después del DDL principal:
  ```bash
  cd backend/database/schema
  psql -d moa -f password_reset.sql
  ```
- En proyectos nuevos basta con correr `DDL.sql` porque ya `\i` este archivo

---

## 🧠 FLUJO BACKEND

1. **`POST /api/auth/request-password-reset`**
   - Normaliza email y valida formato
   - Busca usuario con `findUserModel`
   - Siempre responde 200 para no filtrar emails inexistentes
   - `invalidateUserTokens(usuario_id)` limpia enlaces previos
   - `createResetToken` crea token de 32 bytes (1h de vigencia)
   - `sendPasswordResetEmail` genera HTML + texto y registra logs (incluye `previewUrl` en modo Ethereal)
   - Si falla el correo se marca el token como usado para evitar basura

2. **`POST /api/auth/reset-password`**
   - Valida token y fortaleza de contraseña (8+ caracteres, mayúscula, minúscula, número)
   - `findValidToken` asegura que exista, no esté usado y no haya expirado
   - Hashea con `bcrypt` y usa `updateUserPasswordModel`
   - Marca token como usado + invalida otros tokens pendientes del usuario

> Ambos endpoints viven en `backend/routes/authRoutes.js` y no requieren autenticación previa.

---

## 🧪 TESTING

### 1. Verificar Configuración de Email

Puedes probar la configuración ejecutando:

```javascript
// En backend/index.js o crear un script de test
import { verifyEmailConfig } from './src/services/emailService.js';

verifyEmailConfig()
  .then(result => console.log('Email config:', result))
  .catch(err => console.error('Email error:', err));
```

- Si estás usando Ethereal verás en consola algo como:
  ```
  [EmailService] 🧪 Generando cuenta Ethereal...
  User: john.doe@ethereal.email
  Pass: abc123
  [EmailService] 📬 Ver email en: https://ethereal.email/message/WaQKMgKddxQDoou...
  ```
  Copia la URL para revisar el correo enviado.

### 2. Flujo Completo

#### Paso 1: Solicitar Reset
```bash
curl -X POST http://localhost:4000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@mail.cl"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña."
}
```

**Email recibido:**
- Asunto: "Restablecer tu contraseña - MOA"
- Contiene link: `http://localhost:5173/auth/restablecer-contrasena?token=ABC123...`
- Expira en 60 minutos

#### Paso 2: Resetear Password
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"el-token-del-email",
    "password":"NuevaPassword123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
}
```

#### Paso 3: Verificar Login
```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"cliente@mail.cl",
    "password":"NuevaPassword123"
  }'
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

### Características de Seguridad

✅ **Tokens únicos**: Generados con `crypto.randomBytes(32)`  
✅ **Expiración**: Tokens expiran en 1 hora  
✅ **Un solo uso**: Token se marca como usado después del reset  
✅ **No revela usuarios**: Mismo mensaje para emails válidos e inválidos  
✅ **Timing attack prevention**: Delay artificial para emails no encontrados  
✅ **Password strength**: Requiere 8+ caracteres, mayúscula, minúscula y número  
✅ **Hash seguro**: bcrypt con salt de 10 rounds  
✅ **Invalidación múltiple**: Tokens anteriores se invalidan al crear uno nuevo  

### Mejoras Recomendadas (Opcional)

#### Rate Limiting
Instala y configura:
```bash
npm install express-rate-limit
```

```javascript
// backend/src/middleware/rateLimitMiddleware.js
import rateLimit from 'express-rate-limit';

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 intentos
  message: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// En authRoutes.js
import { passwordResetLimiter } from '../src/middleware/rateLimitMiddleware.js';

router.post("/api/auth/request-password-reset", 
  passwordResetLimiter, 
  requestPasswordReset
);
```

#### Cron Job para Limpieza
```javascript
// backend/src/jobs/cleanupTokens.js
import cron from 'node-cron';
import { cleanExpiredTokens } from '../models/passwordResetModel.js';

// Ejecutar diariamente a las 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('[Cron] Limpiando tokens expirados...');
  const deleted = await cleanExpiredTokens();
  console.log(`[Cron] ${deleted} tokens eliminados`);
});

// En backend/index.js
import './src/jobs/cleanupTokens.js';
```

---

## 📊 BASE DE DATOS

### Tabla Creada

```sql
password_reset_tokens
├── token_id (SERIAL PRIMARY KEY)
├── usuario_id (INTEGER, FK a usuarios)
├── token (VARCHAR(255) UNIQUE)
├── created_at (TIMESTAMP)
├── expires_at (TIMESTAMP)
└── used_at (TIMESTAMP, nullable)

Índices:
- idx_password_reset_token (token)
- idx_password_reset_usuario (usuario_id)
- idx_password_reset_expires (expires_at)
```

### Consultas Útiles

```sql
-- Ver tokens activos
SELECT * FROM password_reset_tokens 
WHERE used_at IS NULL 
  AND expires_at > NOW();

-- Ver tokens de un usuario
SELECT * FROM password_reset_tokens 
WHERE usuario_id = 12 
ORDER BY created_at DESC;

-- Limpiar tokens expirados manualmente
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() OR used_at IS NOT NULL;
```

---

## 🐛 TROUBLESHOOTING

### Error: "Error al enviar el correo"

**Causa:** Configuración SMTP incorrecta

**Solución:**
1. Verifica `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
2. Para Gmail: asegúrate de usar App Password
3. Revisa logs del backend para detalles
4. Prueba con `verifyEmailConfig()`

### Error: "Token inválido o expirado"

**Causa:** Token usado o pasó 1 hora

**Solución:**
1. Solicitar nuevo link de reset
2. Verificar que el token en la URL es correcto
3. Revisar tabla: `SELECT * FROM password_reset_tokens WHERE token = 'ABC123...'`

### Error: "La contraseña debe contener..."

**Causa:** Password no cumple requisitos

**Solución:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula (A-Z)
- Al menos 1 minúscula (a-z)
- Al menos 1 número (0-9)

Ejemplo válido: `Password123`

### Email no llega

**Causa:** Múltiples posibles

**Solución:**
1. Revisa carpeta de spam
2. Verifica que `FRONTEND_URL` es correcto
3. Revisa logs del backend para ver si se envió
4. Verifica que el email existe en la BD: `SELECT * FROM usuarios WHERE email = 'test@mail.cl'`

---

## 📝 ENDPOINTS DISPONIBLES

### POST `/api/auth/request-password-reset`

**Request:**
```json
{
  "email": "usuario@mail.cl"
}
```

**Response (siempre 200):**
```json
{
  "success": true,
  "message": "Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña."
}
```

### POST `/api/auth/reset-password`

**Request:**
```json
{
  "token": "abc123def456...",
  "password": "NuevaPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
}
```

**Response (400/401):**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

## ✅ CHECKLIST FINAL

### Configuración
- [ ] Variables SMTP en `.env`
- [ ] `FRONTEND_URL` configurado
- [ ] App Password de Gmail creado (o provider alternativo)
- [ ] Verificar configuración con `verifyEmailConfig()`
- [ ] Ejecutar `password_reset.sql` (si BD venía de antes de noviembre 2025)

### Testing
- [ ] Solicitar reset con email válido
- [ ] Verificar recepción de email
- [ ] Hacer clic en link del email
- [ ] Crear nueva contraseña
- [ ] Login con nueva contraseña
- [ ] Probar token expirado (esperar 1 hora)
- [ ] Probar token ya usado

### Producción
- [ ] Cambiar `FRONTEND_URL` a dominio real
- [ ] Usar servicio de email profesional (SendGrid/Mailgun)
- [ ] Configurar HTTPS
- [ ] Agregar rate limiting
- [ ] Configurar cron job de limpieza
- [ ] Monitorear logs de email
- [ ] Configurar alertas de errores

---

## 🚀 PRÓXIMOS PASOS

1. **Configurar email** (15 min)
   - Agregar variables a `.env`
   - Crear App Password de Gmail
   - Verificar configuración

2. **Testing completo** (30 min)
   - Probar flujo end-to-end
   - Validar emails recibidos
   - Verificar expiración de tokens

3. **Mejoras opcionales** (1-2 horas)
   - Rate limiting
   - Cron job de limpieza
   - Logs mejorados
   - Métricas y monitoreo

---

**Estado:** ✅ Código completo - Requiere configuración de email  
**Última actualización:** 21 de noviembre, 2025
