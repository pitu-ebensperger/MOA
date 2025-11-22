# Análisis del Flujo Forgot / Reset Password

**Fecha:** 21 de noviembre, 2025  
**Estado:** ✅ Código completo – requiere QA funcional y hardening

---

## 🧭 Resumen Ejecutivo

El flujo de recuperación de contraseña quedó implementado end-to-end:

- **Backend** expone `POST /api/auth/request-password-reset` y `POST /api/auth/reset-password`, persiste tokens en PostgreSQL y envía correos HTML.
- **Frontend** integra formularios modernos (`ForgotPasswordPage.jsx` y `ResetPasswordPage.jsx`) que consumen `auth.api.js`.
- **Email service** usa SMTP configurado o genera automáticamente una cuenta Ethereal cuando no existen variables `.env`, mostrando la URL para visualizar los correos.

El código ya está en main; faltan pruebas manuales y endurecer rate limiting/logging antes de habilitarlo en producción.

---

## 🏗️ Arquitectura Actual

### Base de Datos
- Tabla `password_reset_tokens` creada desde `backend/database/schema/password_reset.sql`.
- Campos: `token_id`, `usuario_id`, `token`, `expires_at`, `used_at` + índices por `token`, `usuario_id` y `expires_at`.
- `DDL.sql` incluye este script, por lo que entornos nuevos quedan cubiertos de inmediato.

### Modelos (`backend/src/models/passwordResetModel.js`)
- `createResetToken(usuario_id)` genera tokens de 32 bytes, 1 hora de vigencia.
- `findValidToken(token)` asegura `used_at IS NULL` y `expires_at > NOW()`.
- `markTokenAsUsed`, `cleanExpiredTokens` y `invalidateUserTokens` limpian registros.

### Controlador (`backend/src/controllers/passwordResetController.js`)
- `requestPasswordReset` normaliza email, valida formato con regex, invalida tokens previos y siempre responde 200 para evitar filtrados.
- `resetPassword` valida token + contraseña (mínimo 8 caracteres, mayúscula/minúscula/dígito), hashea con `bcrypt` y actualiza al usuario vía `updateUserPasswordModel`.
- Ambos controladores registran logs con prefijo `[PasswordReset]` para facilitar debugging.

### Servicio de Email (`backend/src/services/emailService.js`)
- `createTransporter` usa SMTP si `SMTP_*` está configurado; de lo contrario crea credenciales Ethereal y las imprime en consola (ideal para desarrollo).
- Plantilla HTML responsive con CTA, fallback en texto plano y `previewUrl` disponible cuando se usa Ethereal.
- Utilidades `verifyEmailConfig()` y `sendTestEmail()` para smoke tests manuales.

### Rutas (`backend/routes/authRoutes.js`)
```javascript
router.post("/api/auth/request-password-reset", requestPasswordReset);
router.post("/api/auth/reset-password", resetPassword);
```
No requieren autenticación previa y conviven con las rutas de login/perfil.

### Frontend
- `frontend/src/services/auth.api.js` define `requestPasswordReset` y `resetPassword` apuntando a los endpoints reales.
- `ForgotPasswordPage.jsx` valida email con regex, muestra toasts y confirma con modal (`@/components/ui/confirm`).
- `ResetPasswordPage.jsx` lee `token` desde query params, aplica validaciones de largo y coincidencia y redirige a `/login` tras éxito.
- `API_PATHS.auth` ya incluye `requestPasswordReset` y `resetPassword`.

---

## 🔌 Endpoints y Contratos

### `POST /api/auth/request-password-reset`
**Request**
```json
{ "email": "usuario@mail.cl" }
```
**Response 200 (siempre)**
```json
{
  "success": true,
  "message": "Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña."
}
```
**Validaciones**
- Email requerido, string, formato válido.
- Tiempo de espera artificial (~1s) cuando el email no existe para evitar timing attacks.
- Se invalidan tokens previos antes de emitir uno nuevo.

### `POST /api/auth/reset-password`
**Request**
```json
{ "token": "abc123...", "password": "NuevaPass123" }
```
**Response 200**
```json
{ "success": true, "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña." }
```
**Errores**
- `401 UnauthorizedError` cuando el token no existe / expiró / ya se usó.
- `400` si faltan campos o la contraseña no cumple reglas de complejidad.

---

## 🔄 Flujo End-to-End

1. Usuario solicita reset → frontend llama `requestPasswordReset`.
2. Backend invalida tokens previos del usuario y crea uno nuevo (`expires_at = NOW() + 60 min`).
3. `emailService` arma URL `FRONTEND_URL/auth/restablecer-contrasena?token=...` y envía correo.
4. Usuario abre el link y completa `ResetPasswordPage`.
5. `resetPassword` valida token, hashea contraseña, actualiza tabla `usuarios` y marca token como usado.
6. Se invalidan tokens pendientes para evitar reutilización.
7. Usuario inicia sesión con la nueva contraseña.

---

## 🧪 Pruebas Recomendadas

1. **Smoke Test Ethereal**
   ```bash
   cd backend && node -e "import('./src/services/emailService.js').then(m => m.verifyEmailConfig())"
   ```
   Confirmar que en consola aparezca `previewUrl`.

2. **Flujo feliz completo**
   - Iniciar backend y frontend.
   - Solicitar reset con un email válido y revisar el link en Ethereal.
   - Cambiar contraseña, confirmar que `usuarios.password_hash` cambió y `used_at` se pobló.

3. **Tokens inválidos**
   - Ejecutar reset con token manipulado → debe responder `401`.
   - Reutilizar token ya usado → `401`.
   - Esperar >60 min (o actualizar `expires_at` manualmente) para validar expiración.

4. **Email inexistente**
   - Enviar request con un correo random y confirmar que el response es 200 sin revelar información.

---

## 🔐 Seguridad, Operación y Monitoreo

- **Rate limiting:** aún no se aplica. Recomendado agregar `passwordResetLimiter` (p.ej. 3 intentos / 15 min) usando `express-rate-limit`.
- **Cleanup job:** programar cron diario (03:00) que invoque `cleanExpiredTokens` para mantener la tabla liviana (snippet disponible más abajo).
- **Logs:** revisar `backend` logs en producción para detectar spikes. Considerar enviar métricas a un dashboard (cantidad de resets por día).
- **HTTPS:** obligatorio antes de exponer enlaces en producción; los tokens viajan en query params.
- **Env vars mínimas producción:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `FRONTEND_URL`.

```javascript
// Cron sugerido (backend/src/jobs/cleanupTokens.js)
import cron from 'node-cron';
import { cleanExpiredTokens } from '../models/passwordResetModel.js';

cron.schedule('0 3 * * *', async () => {
  const deleted = await cleanExpiredTokens();
  console.log(`[Cron][PasswordReset] Tokens eliminados: ${deleted}`);
});
```

```javascript
// Rate limiter sugerido (backend/src/middleware/rateLimitMiddleware.js)
import rateLimit from 'express-rate-limit';

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
});
```

---

## ⚠️ Pendientes y Riesgos

- [ ] Ejecutar QA manual end-to-end (sin Ethereal) usando un SMTP real.
- [ ] Agregar rate limiting y registros de auditoría (IP/UA) para mitigar abuso.
- [ ] Crear el cron job de limpieza para no dejar tokens viejos (en staging + prod).
- [ ] Hookear alertas (Slack/Email) cuando `sendPasswordResetEmail` falle.
- [ ] Añadir pruebas automatizadas (unitarias para modelos/controladores y e2e mínimo un caso feliz).
- [ ] Documentar en onboarding cómo obtener `FRONTEND_URL` correcto en ambientes preview.

---

## 📎 Recursos Relacionados

- Backend
  - `backend/routes/authRoutes.js`
  - `backend/src/controllers/passwordResetController.js`
  - `backend/src/models/passwordResetModel.js`
  - `backend/src/models/usersModel.js` (`updateUserPasswordModel`)
  - `backend/src/services/emailService.js`
  - `backend/database/schema/password_reset.sql`
- Frontend
  - `frontend/src/services/auth.api.js`
  - `frontend/src/modules/auth/pages/ForgotPasswordPage.jsx`
  - `frontend/src/modules/auth/pages/ResetPasswordPage.jsx`
- Docs
  - `docs/misDOCS/PASSWORD_RESET_SETUP.md` (pasos detallados de configuración)

---

**Conclusión:** el flujo está funcional y listo para QA. El foco inmediato debe estar en validar el envío de correos contra el proveedor definitivo, habilitar rate limiting y agendar limpieza automática de tokens antes del release público.
