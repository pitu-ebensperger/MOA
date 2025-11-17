# 📝 Instrucciones para Revisión - MOA Frontend

## 🔗 Links de la Entrega

- **Repositorio GitHub**: https://github.com/pitu-ebensperger/MOA

---

## Credenciales para Vistas Privadas

### Usuario Administrador
```
Email: admin@moa.cl
Password: admin123
```

### Usuario Cliente
```
Email: cliente@mail.com
Password: cliente123
```

---

## ℹ️ Información Importante

### Modo de Operación
Esta aplicación frontend funciona de forma **standalone** con datos de prueba (mocks). No requiere backend activo para su revisión.

### Funcionalidades Disponibles

#### 👤 Como Usuario Regular:
- ✅ Registro y login
- ✅ Ver catálogo de productos
- ✅ Buscar y filtrar por categorías
- ✅ Agregar productos al carrito
- ✅ Lista de deseos (wishlist)
- ✅ Ver perfil y editar datos
- ✅ Ver historial de órdenes

#### 🔐 Como Administrador (admin@moa.cl):
- ✅ Panel de administración completo
- ✅ Gestión de productos (CRUD)
- ✅ Visualización de inventario
- ✅ Alertas de stock bajo
- ✅ Gestión de categorías
- ✅ Visualización de órdenes
- ✅ Gestión de usuarios

---

## 🎯 Cómo Revisar

1. **Acceder a la aplicación** usando el link desplegado
2. **Probar como cliente**: 
   - Registrarse o usar `cliente@mail.com`
   - Navegar productos
   - Agregar al carrito
   
3. **Probar como admin**:
   - Login con `admin@moa.cl`
   - Ir a "Admin" en el menú
   - Explorar gestión de productos
   - Ver estadísticas e inventario

---

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework principal
- **React Router 7** - Navegación
- **TanStack Query** - Manejo de estado/API
- **TanStack Table** - Tablas de datos
- **Tailwind CSS 4** - Estilos
- **Vite 7** - Build tool
- **Lucide React** - Iconografía

---

## 📊 Cumplimiento de Requisitos

### Hito 2: Desarrollo Frontend ✅
- [x] Proyecto creado con Vite
- [x] React Router implementado
- [x] Componentes reutilizables con props
- [x] Hooks personalizados (useCart, useAuth, etc)
- [x] Context API para estado global (AuthContext, CartContext, etc)

### Características Adicionales ✅
- [x] Diseño responsive
- [x] Sistema de autenticación
- [x] Panel de administración
- [x] Tablas interactivas con sorting/filtering
- [x] Formularios validados
- [x] Estados de carga y error

---

## 📱 Notas Técnicas

- La aplicación es **responsive** y funciona en móvil/tablet/desktop
- Los datos se persisten en **localStorage**
- El modo mock está activo por defecto (`VITE_USE_MOCKS=true`)
- Build optimizado con code-splitting

---

## 💡 Observaciones

- El frontend está preparado para conectarse a un backend real modificando `VITE_USE_MOCKS=false`
- Todos los componentes están documentados y siguen patrones de React modernos
- El código está organizado por módulos y funcionalidades

---

**Fecha de entrega**: Noviembre 17, 2025  
**Estudiante**: [Tu nombre]  
**Proyecto**: MOA - Marketplace Online
