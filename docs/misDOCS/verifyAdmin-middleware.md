# Middleware verifyAdmin

## Descripción

El middleware `verifyAdmin` es un middleware de autenticación y autorización que verifica que el usuario tenga un token JWT válido y además posea privilegios de administrador.

## Funcionalidades

### verifyAdmin

Middleware principal que:
1. **Verifica el token JWT** en el header `Authorization`
2. **Valida el formato** del token (debe ser `Bearer <token>`)
3. **Consulta la base de datos** para obtener información completa del usuario
4. **Verifica el rol** del usuario (debe tener `rol_code = 'admin'`)
5. **Agrega información del usuario** al objeto `req` para uso en controladores

### optionalAdminVerify

Middleware opcional que:
- Verifica si el usuario es admin sin fallar si no lo es
- Útil para endpoints que pueden ser accesibles por usuarios normales o admins
- Si el usuario es admin, agrega la información al `req`

## Uso

### Importar el middleware

```javascript
import { verifyAdmin, optionalAdminVerify } from "../src/middleware/verifyAdmin.js";
```

### Proteger rutas de administración

```javascript
// Ruta que requiere ser administrador
router.get("/admin/dashboard", verifyAdmin, (req, res) => {
  // El usuario está verificado como admin
  console.log(req.user); // Información del usuario admin
  console.log(req.admin); // true
  res.json({ message: "Dashboard admin" });
});
```

### Uso opcional

```javascript
// Ruta que puede mostrar contenido diferente para admins
router.get("/productos", optionalAdminVerify, (req, res) => {
  if (req.admin) {
    // Mostrar vista de administrador
    res.json({ productos: allProducts, adminView: true });
  } else {
    // Mostrar vista pública
    res.json({ productos: publicProducts });
  }
});
```

## Estructura del objeto req.user

Cuando el middleware es exitoso, agrega al objeto `req`:

```javascript
req.user = {
  id: 123,                    // ID del usuario
  usuario_id: 123,            // Alias del ID
  email: "admin@moa.cl",      // Email del usuario
  nombre: "Admin MOA",        // Nombre del usuario
  rol: "Administrador",       // Nombre del rol
  rol_code: "admin",          // Código del rol
  public_id: "abc123"         // ID público del usuario
};

req.admin = true;             // Flag indicando que es admin
```

## Errores que puede devolver

### 401 Unauthorized
- Token no presente
- Token expirado
- Token inválido
- Usuario no encontrado

### 403 Forbidden
- Usuario no tiene rol de administrador

### 500 Internal Server Error
- Error de configuración (JWT_SECRET no definido)
- Error de base de datos

## Configuración requerida

### Variables de entorno

```bash
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
```

### Base de datos

El middleware requiere que la tabla `usuarios` tenga las siguientes columnas:
- `usuario_id` (BIGINT PRIMARY KEY)
- `email` (TEXT)
- `nombre` (TEXT)
- `rol` (TEXT)
- `rol_code` (TEXT)
- `public_id` (TEXT)

### Crear usuario administrador

Usa el script incluido para crear el primer usuario admin:

```bash
node scripts/createAdmin.js admin@moa.cl mi_password_seguro "Admin MOA"
```

## Ejemplos de uso en controladores

### Controlador que requiere admin

```javascript
export const deleteProduct = async (req, res, next) => {
  try {
    // req.user ya está disponible gracias a verifyAdmin
    console.log(`Admin ${req.user.nombre} eliminando producto`);
    
    // Lógica del controlador...
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
```

### Middleware en rutas

```javascript
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";
import { asyncHandler } from "../src/utils/error.utils.js";

// Rutas protegidas
router.get("/admin/users", verifyAdmin, asyncHandler(AdminController.getUsers));
router.post("/admin/products", verifyAdmin, asyncHandler(AdminController.createProduct));
router.delete("/admin/products/:id", verifyAdmin, asyncHandler(AdminController.deleteProduct));
```

## Notas de seguridad

1. **Nunca exponer JWT_SECRET**: Mantén la clave secreta segura y no la incluyas en el código
2. **Rotación de tokens**: Considera implementar rotación de tokens JWT
3. **Logs de auditoría**: Registra las acciones administrativas para auditoría
4. **Principio de menor privilegio**: Solo otorga acceso admin cuando sea necesario
5. **Validación en frontend y backend**: Siempre valida permisos en el servidor

## Dependencias

- `jsonwebtoken`: Para verificar tokens JWT
- `../models/usersModel.js`: Para consultar datos del usuario
- `../utils/error.utils.js`: Para manejo de errores personalizados