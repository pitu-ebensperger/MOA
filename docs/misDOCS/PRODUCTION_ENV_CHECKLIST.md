# Variables de Entorno - Guía de Configuración para Producción

**Fecha:** Noviembre 2025  
**Propósito:** Checklist de variables críticas para desplegar MOA en producción

---

## 📋 Variables Críticas (OBLIGATORIAS)

### 🔐 Seguridad y Autenticación

```bash
# JWT Secret - DEBE ser único y seguro en producción
JWT_SECRET=<generar-con-openssl-rand-base64-32>
JWT_EXPIRES_IN=24h                    # Clientes: 24 horas
JWT_ADMIN_EXPIRES_IN=7d               # Admin: 7 días

# Recomendación: Generar secret seguro
# openssl rand -base64 32
```

**⚠️ Acción requerida:**
- [ ] Generar `JWT_SECRET` único para producción (NO usar el de desarrollo)
- [ ] Confirmar tiempos de expiración adecuados para tu caso de uso

---

### 🗄️ Base de Datos

```bash
# PostgreSQL Connection
DB_HOST=<tu-servidor-postgres>        # ej: localhost, RDS endpoint, etc.
DB_PORT=5432
DB_USER=<usuario-postgres>
DB_PASSWORD=<password-seguro>
DB_DATABASE=moa_db                    # O nombre personalizado
```

**⚠️ Acción requerida:**
- [ ] Configurar credenciales de PostgreSQL en producción
- [ ] Verificar firewall/security groups permiten conexión desde app
- [ ] Asegurar que `DB_PASSWORD` es fuerte (min 16 caracteres, mixto)
- [ ] Probar conexión con: `psql -h $DB_HOST -U $DB_USER -d $DB_DATABASE`

**🔒 Seguridad BD:**
- Pool de conexiones configurado: `max: 20, timeout: 2000ms`
- No exponer puerto 5432 públicamente (usar VPC/network privada)
- Considerar SSL/TLS para conexión (`pg` soporta `ssl: true`)

---

### 📧 Email (SMTP) - Nodemailer

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com              # Gmail, SendGrid, AWS SES, etc.
SMTP_PORT=587                         # 587 (TLS) o 465 (SSL)
SMTP_USER=<tu-email@dominio.com>
SMTP_PASS=<app-password-o-api-key>
SMTP_FROM=noreply@moa.cl              # Remitente visible
```

**⚠️ Acción requerida:**
- [ ] Configurar cuenta SMTP de producción (evitar Gmail personal)
- [ ] Si usas Gmail: habilitar "App Passwords" (2FA requerido)
- [ ] Si usas SendGrid/Mailgun/AWS SES: obtener API keys
- [ ] Verificar `SMTP_FROM` es válido y no rebota (SPF/DKIM configurado)
- [ ] Probar envío con: `npm run -w backend test` (emailService tests)

**Recomendaciones de servicio:**
- **SendGrid:** 100 emails/día gratis, API simple
- **AWS SES:** $0.10/1000 emails, requiere verificar dominio
- **Mailgun:** 5000 emails/mes gratis primeros 3 meses

---

### 🌐 CORS y URLs Frontend

```bash
# CORS Configuration
CORS_ORIGIN=https://tu-dominio.com    # URL producción (sin trailing slash)
# Para múltiples orígenes: CORS_ORIGIN=https://moa.com,https://www.moa.com

# Frontend URL (links en emails)
FRONTEND_URL=https://tu-dominio.com
```

**⚠️ Acción requerida:**
- [ ] Reemplazar con dominio de producción real
- [ ] Si usas subdominio (app.moa.cl), agregar ambos dominios a CORS
- [ ] Verificar que emails usen `FRONTEND_URL` correcto (link confirmación orden)
- [ ] Probar CORS con: `curl -H "Origin: https://tu-dominio.com" http://localhost:4000/api/health`

---

### 🚀 Servidor y Entorno

```bash
# Server Configuration
PORT=4000                              # O puerto asignado por hosting
NODE_ENV=production                    # ¡IMPORTANTE! Cambia comportamiento

# Rate Limiting (opcional, ajustar según tráfico)
RATE_LIMIT_WINDOW_MS=900000           # 15 minutos
RATE_LIMIT_MAX=200                    # 200 requests/15min general
AUTH_RATE_LIMIT_MAX=10                # 10 requests/15min auth endpoints
```

**⚠️ Acción requerida:**
- [ ] Setear `NODE_ENV=production` en servidor (habilita optimizaciones)
- [ ] Confirmar `PORT` disponible (o usar variable de hosting como `$PORT`)
- [ ] Ajustar rate limits si esperas alto tráfico (considerar Redis para limiter distribuido)

---

## 🔧 Variables Opcionales (Recomendadas)

### Password Reset Cleanup Job

```bash
PASSWORD_RESET_CLEANUP_ENABLED=true
PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES=60
PASSWORD_RESET_CLEANUP_LOGS=false      # true para debugging
```

**Acción:** Mantener habilitado para limpiar tokens expirados automáticamente.

---

## ✅ Checklist de Verificación Pre-Deploy

### 1. Archivo `.env` de producción creado
- [ ] Copiar `.env.example` → `.env`
- [ ] Reemplazar TODOS los valores `<tu-*>` con datos reales
- [ ] NO commitear `.env` al repositorio (verificar `.gitignore`)

### 2. Secrets en servidor/hosting
- [ ] Si usas Heroku/Vercel/Railway: setear variables en dashboard
- [ ] Si usas Docker: pasar via `-e` o archivo `docker-compose.yml`
- [ ] Si usas PM2/systemd: cargar `.env` en script de inicio

### 3. Validación de conectividad
```bash
# Test database
npm run -w backend db              # Ejecutar DDL (solo primera vez)
npm run -w backend seed:all        # Opcional: datos demo

# Test email
node backend/scripts/testEmail.js  # (crear script simple si no existe)

# Test JWT
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moa.cl","password":"admin"}'
```

- [ ] DB conecta sin errores
- [ ] Email envía correctamente (revisar spam)
- [ ] JWT login retorna token válido

### 4. Verificar health endpoint
```bash
curl http://localhost:4000/api/health
# Debe retornar: {"status":"ok","database":{"status":"connected"}, ...}
```

- [ ] Health endpoint responde 200 OK
- [ ] `database.status: "connected"`
- [ ] Configurar monitoring (UptimeRobot, Pingdom, etc.) en `/api/health`

---

## 🔥 Errores Comunes y Soluciones

### Error: `ECONNREFUSED` al conectar DB
**Causa:** PostgreSQL no está corriendo o firewall bloquea conexión.  
**Solución:**
```bash
# Verificar PostgreSQL activo
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Verificar puerto abierto
telnet $DB_HOST 5432
```

### Error: `Invalid token` en requests autenticadas
**Causa:** `JWT_SECRET` diferente entre desarrollo y producción.  
**Solución:** Regenerar tokens con secret de producción o forzar re-login usuarios.

### Error: `CORS not allowed`
**Causa:** `CORS_ORIGIN` no coincide con URL frontend.  
**Solución:**
```bash
# Backend logs mostrarán: "CORS: Origin not allowed: https://..."
# Agregar ese origin exacto a CORS_ORIGIN
```

### Emails no llegan
**Causa:** SMTP bloqueado, credenciales incorrectas, o IP blacklisted.  
**Solución:**
```bash
# Test manual
npm install -g nodemailer
node -e "require('nodemailer').createTransport({host:'$SMTP_HOST',port:587,auth:{user:'$SMTP_USER',pass:'$SMTP_PASS'}}).sendMail({from:'$SMTP_FROM',to:'test@example.com',subject:'Test',text:'OK'},console.log)"
```

---

## 📚 Referencias Adicionales

- **Backend .env.example:** `backend/.env.example`
- **Configuración SMTP:** `backend/src/services/emailService.js`
- **Rate limiting:** `backend/index.js` línea 35-45
- **Pool DB:** `backend/database/config.js`
- **Error handling:** `backend/src/utils/error.utils.js`

---

## 🚨 NUNCA Commitear

```bash
# Archivos a mantener en .gitignore:
.env
.env.production
.env.local
*.pem
*.key
```

**Recomendación:** Usar servicios de secrets management (AWS Secrets Manager, HashiCorp Vault) para producción enterprise.

---

**Última actualización:** 21 noviembre 2025  
**Contacto soporte:** (agregar email de contacto técnico)
