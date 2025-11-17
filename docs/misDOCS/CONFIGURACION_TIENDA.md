# Sistema de Configuración de Tienda - Instrucciones de Instalación

## 📋 Descripción
Sistema completo para gestionar la información de la tienda (nombre, descripción, contacto, redes sociales) desde el admin dashboard. Los datos se muestran dinámicamente en el footer del sitio.

## 🗄️ Base de Datos

### Ejecutar DDL
```bash
cd backend/database/schema
psql -d moa -f DDL_CONFIGURACION.sql
```

### Verificar instalación
```sql
-- Verificar que la tabla existe
SELECT * FROM configuracion_tienda;

-- Debería retornar 1 registro con la configuración por defecto
```

## 🔧 Backend

### Archivos creados:
- ✅ `/backend/src/models/configModel.js` - Modelo de datos
- ✅ `/backend/src/controllers/configController.js` - Controladores
- ✅ `/backend/routes/configRoutes.js` - Rutas API
- ✅ `/backend/index.js` - Rutas registradas

### Endpoints disponibles:

#### GET /api/config
Obtener configuración actual (público)
```javascript
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_tienda": "MOA",
    "descripcion": "...",
    "direccion": "...",
    "telefono": "...",
    "email": "...",
    "instagram_url": "...",
    "facebook_url": "...",
    "twitter_url": "...",
    "actualizado_en": "2025-11-17T...",
    "actualizado_por": 1
  }
}
```

#### PUT /api/config
Actualizar configuración (solo admin)
```javascript
// Request (con token de admin en headers)
{
  "nombre_tienda": "MOA Studio",
  "descripcion": "Nueva descripción...",
  "direccion": "Nueva dirección...",
  "telefono": "+56 9 1234 5678",
  "email": "contacto@moastudio.cl",
  "instagram_url": "https://instagram.com/nuevoperfil",
  "facebook_url": "https://facebook.com/nuevoperfil",
  "twitter_url": "https://twitter.com/nuevoperfil"
}

// Response
{
  "success": true,
  "message": "Configuración actualizada correctamente",
  "data": { ... }
}
```

#### POST /api/config/init
Inicializar configuración (solo admin, solo si no existe)

## 🎨 Frontend

### Archivos creados/modificados:
- ✅ `/frontend/src/services/config.api.js` - Cliente API
- ✅ `/frontend/src/modules/admin/pages/StoreSettingsPage.jsx` - Página de ajustes
- ✅ `/frontend/src/modules/admin/pages/AdminSettingsPage.jsx` - Tab "Tienda" agregado
- ✅ `/frontend/src/components/layout/Footer.jsx` - Consume datos dinámicos

### Acceso en Admin:
1. Login como admin
2. Ir a Dashboard → Configuraciones
3. Tab "Tienda" (primera pestaña)
4. Editar campos y guardar

### Campos editables:
- **Información Básica:**
  - Nombre de la Tienda
  - Descripción
  
- **Información de Contacto:**
  - Dirección
  - Teléfono
  - Email
  
- **Redes Sociales:**
  - Instagram URL
  - Facebook URL
  - Twitter/X URL

## 🚀 Flujo de Funcionamiento

1. **Al cargar el sitio:**
   - Footer hace GET `/api/config` (sin autenticación)
   - Muestra datos dinámicos o fallback a valores por defecto

2. **Admin edita configuración:**
   - Login → Dashboard → Configuraciones → Tab "Tienda"
   - Edita campos del formulario
   - Click "Guardar Cambios"
   - PUT `/api/config` (requiere token de admin)
   - Footer se actualiza automáticamente en próxima carga

3. **Validaciones:**
   - Email: formato válido
   - URLs redes sociales: formato URL válido
   - Solo admins pueden actualizar
   - Timestamp automático de última actualización

## 🔒 Seguridad

- ✅ Solo usuarios con `es_admin = true` pueden actualizar
- ✅ Endpoint GET es público (para mostrar en footer)
- ✅ Endpoint PUT requiere token JWT válido
- ✅ Validaciones de formato (email, URLs)
- ✅ Registro de quién y cuándo actualizó (`actualizado_por`, `actualizado_en`)

## 📝 Notas

- La tabla `configuracion_tienda` solo permite 1 registro (constraint `uq_single_config`)
- Si la tabla no existe o está vacía, el frontend muestra valores por defecto
- Las redes sociales sin URL se ocultan automáticamente en el footer
- El trigger `trigger_actualizar_configuracion` actualiza `actualizado_en` automáticamente

## ✅ Testing

### 1. Verificar backend
```bash
cd backend
npm start

# En otra terminal, probar endpoint público:
curl http://localhost:3000/api/config
```

### 2. Verificar frontend
```bash
cd frontend
npm run dev

# Abrir http://localhost:5173
# 1. Ver footer con datos por defecto
# 2. Login como admin
# 3. Ir a Dashboard → Configuraciones → Tienda
# 4. Editar campos y guardar
# 5. Refrescar página principal y verificar cambios en footer
```

## 🐛 Troubleshooting

**Error: Tabla no existe**
```bash
psql -d moa -f backend/database/schema/DDL_CONFIGURACION.sql
```

**Error: 401 al actualizar**
- Verificar que estés logueado como admin
- Verificar token en localStorage

**Footer no se actualiza**
- Verificar que backend esté corriendo
- Verificar endpoint GET /api/config en DevTools Network
- Verificar console.log para errores

**Validación de email falla**
- Usar formato válido: `usuario@dominio.com`

**Validación de URL falla**
- Usar formato completo: `https://instagram.com/usuario`
