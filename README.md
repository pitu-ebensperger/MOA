# Proyecto MOA - Marketplace E-commerce

> **Estado del proyecto:** 🟢 Funcional (85% completo) | **Última actualización:** Noviembre 2025

## 📊 Estado Actual

```
✅ Core Features:        100%  ████████████████████
✅ Admin Panel:          95%   ███████████████████░
✅ Integración:          90%   ██████████████████░░
⚠️  Testing:             5%    █░░░░░░░░░░░░░░░░░░░
⚠️  Performance:         60%   ████████████░░░░░░░░
```

**Ver estado completo:** [docs/ESTADO_PROYECTO_NOV_2025.md](./docs/ESTADO_PROYECTO_NOV_2025.md)  
**Resumen visual:** [docs/RESUMEN_VISUAL.md](./docs/RESUMEN_VISUAL.md)

---

## 🔐 Usuarios de Prueba

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Admin | `admin@moa.cl` | `admin` / `demo` / `123456` | Administrador |
| Demo | `demo@moa.cl` | `demo` / `admin` / `123456` | Cliente |
| Cliente | `cliente@mail.cl` | `demo` / `admin` / `123456` | Cliente |

---


## 🚀 Quick Start

### 1. Instalar Dependencias

```bash
# Desde la raíz del proyecto
npm install
```

### 2. Configurar Base de Datos

```bash
# Crear schema completo
npm run -w backend db

# Sembrar datos de prueba
npm run -w backend seed:all
```

### 3. Ejecutar Aplicación

```bash
# Frontend (puerto 5174)
npm run -w frontend dev

# Backend (puerto 4000)
npm run -w backend dev
```

### 4. Acceder a la Aplicación

- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:4000
- **Login como Admin:** admin@moa.cl / admin

---

## 📦 Scripts Disponibles

### Frontend
```bash
npm run -w frontend dev      # Desarrollo (Vite)
npm run -w frontend build    # Build producción
npm run -w frontend preview  # Preview build
npm run -w frontend lint     # Linting
npm run -w frontend test     # Tests
```

### Backend
```bash
npm run -w backend dev       # Desarrollo (nodemon)
npm run -w backend start     # Producción
npm run -w backend test      # Tests
```

### Base de Datos

```bash
# Schema completo
npm run -w backend db              # Crear todas las tablas
npm run -w backend db:reset        # Recrear schema

# Sembrar datos (individual)
npm run -w backend seed:users      # Crea admin@moa.cl y usuarios base
npm run -w backend seed:clients    # Clientes de ejemplo
npm run -w backend seed:categories # Categorías iniciales
npm run -w backend seed:products   # Productos de prueba
npm run -w backend seed:addresses  # Direcciones ejemplo
npm run -w backend seed:carts      # Carritos prellenados
npm run -w backend seed:wishlists  # Listas de deseos ejemplo
npm run -w backend seed:orders     # Órdenes de prueba

# Sembrar todo
npm run -w backend seed:all        # Ejecuta todos los seeds en orden
```

---

## 🏗️ Estructura del Proyecto

```
MOA/
├── backend/                    # API REST (Node.js + Express)
│   ├── routes/                 # 11 archivos de rutas
│   ├── src/
│   │   ├── controllers/        # 13 controllers
│   │   ├── models/             # 10 models (PostgreSQL)
│   │   ├── middleware/         # Auth + Admin verification
│   │   └── services/           # Email service
│   └── database/
│       ├── schema/             # DDL y migraciones
│       └── seed/               # 8 seeders
│
├── frontend/                   # SPA (React 19 + Vite)
│   ├── src/
│   │   ├── modules/            # 11 módulos de features
│   │   │   ├── admin/          # Panel administrativo
│   │   │   ├── auth/           # Login, registro, reset
│   │   │   ├── cart/           # Carrito y checkout
│   │   │   ├── products/       # Catálogo y detalle
│   │   │   ├── profile/        # Perfil de usuario
│   │   │   └── orders/         # Gestión de órdenes
│   │   ├── components/         # 40+ componentes UI
│   │   ├── services/           # 15 API clients
│   │   ├── hooks/              # Custom hooks
│   │   └── context/            # Context providers
│   └── public/
│
├── docs/                       # Documentación técnica
│   ├── ESTADO_PROYECTO_NOV_2025.md  # Estado completo
│   ├── RESUMEN_VISUAL.md            # Resumen gráfico
│   ├── TODO.md                      # Tareas pendientes
│   └── misDOCS/                     # Documentación detallada
│
└── scripts/                    # Scripts de utilidad
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Core Features (100%)

- **Autenticación completa**
  - Login/Registro con JWT
  - Reset de contraseña con email
  - Protección de rutas privadas
  - Roles (admin/customer)

- **Catálogo de Productos**
  - Listado con paginación
  - Filtros por categoría y precio
  - Búsqueda de productos
  - Vista detallada
  - **Validación de stock en tiempo real**

- **Carrito de Compras**
  - Agregar/eliminar productos
  - Actualizar cantidades
  - Persistencia en BD
  - **Validación de stock antes de compra**

- **Proceso de Checkout**
  - Selección de dirección
  - Métodos de pago
  - Vista previa del pedido
  - Confirmación con modal
  - Página de confirmación rediseñada

- **Gestión de Órdenes**
  - Historial de compras
  - Estados de pago y envío
  - Timeline visual
  - Tracking de envío

- **Lista de Deseos**
  - Agregar/eliminar favoritos
  - Mover a carrito
  - Vista en perfil

- **Perfil de Usuario**
  - Información personal
  - Historial de compras
  - Gestión de direcciones
  - Lista de favoritos

### ✅ Panel de Administración (95%)

- **Dashboard**
  - Métricas en tiempo real
  - Gráficos de ventas
  - Alertas de stock
  - Productos más vendidos

- **Gestión de Órdenes**
  - Vista completa de pedidos
  - Filtros avanzados
  - Actualización de estados
  - Agregar tracking
  - Exportar a CSV

- **Gestión de Clientes**
  - CRUD completo
  - Historial de compras
  - Cambio de estados
  - Filtros y búsqueda

- **Gestión de Productos**
  - CRUD completo
  - Control de stock
  - Asignación de categorías
  - Desactivación de productos

- **Configuración de Tienda**
  - Información de contacto
  - Redes sociales
  - Horarios de atención
  - Footer dinámico

---

## 🛠️ Tecnologías

### Frontend
- React 19.1.1
- Vite 7.1.7
- TanStack Query v5 (estado servidor)
- React Router v7
- TailwindCSS 4
- Radix UI (componentes)
- Lucide React (iconos)
- Recharts (gráficos)

### Backend
- Node.js + Express 5.1.0
- PostgreSQL
- JWT (autenticación)
- bcryptjs (passwords)
- Nodemailer (emails)
- Stripe SDK (preparado)

---

## ⚙️ Configuración JWT y Sesiones

### Tiempos de Expiración del Token

El proyecto incluye un sistema de monitoreo de sesión que:
- ⚠️ Avisa 5 minutos antes de que expire la sesión
- 🔄 Permite extender la sesión activa
- 🚪 Hace logout automático cuando expira
- 📧 Muestra alerta de "Sesión expirada"

**Configurar tiempos en `backend/.env`:**

```bash
# Clientes regulares (default: 24 horas)
JWT_EXPIRES_IN=24h

# Administradores (default: 7 días)
JWT_ADMIN_EXPIRES_IN=7d

# Ejemplos válidos: 30m, 1h, 12h, 24h, 2d, 7d, 30d
```

**⚡ Valores recomendados:**
- **Desarrollo**: `JWT_EXPIRES_IN=1h` (clientes), `JWT_ADMIN_EXPIRES_IN=24h` (admin)
- **Producción**: `JWT_EXPIRES_IN=24h` (clientes), `JWT_ADMIN_EXPIRES_IN=7d` (admin)
- **Alta seguridad**: `JWT_EXPIRES_IN=30m` (clientes), `JWT_ADMIN_EXPIRES_IN=2d` (admin)

**📦 Dependencia requerida (frontend):**
```bash
npm install jwt-decode
```

---

## ⚠️ Pendientes para Producción

### 🔴 Crítico
- [ ] Pasarela de pago: se mantiene simulada (fuera de alcance)
- [ ] Remover logs sensibles
- [ ] Implementar logger estructurado

### 🟡 Importante
- [ ] Testing completo (> 70% cobertura)
- [ ] Optimización de performance (bundle < 500KB)
- [ ] Documentación API (Swagger)

### 🟢 Opcional
- [ ] Notificaciones automáticas por email
- [ ] Integración con APIs de couriers
- [ ] Sistema de cupones/descuentos

**Ver roadmap completo:** [docs/TODO.md](./docs/TODO.md)


**`docs/`**

- [Estructura proyecto y Progreso](./docs/STATUS.md)
- [Listado de dependecias](./docs/DEPENDENCIAS.md)

### Otros

- [Tailwind_Cheatsheet] (https://www.creative-tim.com/twcomponents/cheatsheet/)

---

## Convenciones

### Github Flow

**Ramas/Branches**

- feature/ _(desarrollo de nuevas funcionalidades, ej. feature/add-user-authentication)_
- fix/ _(correción errores, ej. bugfix/issue-123-login-error)_
- chore/ _(tareas mantenimiento o administración, ej. chore/update-dependencies)_
- refactor/ _(restructuración código, ej. refactor/sist-modulos)_

**Organización Proyecto**

- Dejar en componentes si es un elemento genérico o si aparece en 2+ páginas.

-------------------------------------------------------

## Requerimientos

### Hito 1: Diseño y Prototipo

1. Diseñar un boceto de las vista del proyecto.
2. Definir la navegación entre las vistas marcando las públicas y las privadas.
3. Enlistar las dependencias a utilizar en el proyecto.
4. Diseñar las tablas de la base de datos y sus relaciones.
5. Diseñar el contrato de datos de la API REST.

### Hito 2: Desarrollo Frontend\*\*

1. Crear un nuevo proyecto usando npx e instalar las dependencias.\*\*
2. Utilizar React Router para la navegación entre rutas.\*\*
3. Reutilizar componentes haciendo uso del paso de props y renderización dinámica.\*\*
4. Hacer uso de los hooks para un desarrollo ágil y reactivo.\*\*
5. Utilizar Context para el manejo del estado global.\*\*

### Hito 3: Desarrollo Backend

1. Crear un nuevo nuevo de npm e instalar todas las dependencias necesarias.
2. Utilizar el paquete pg para gestionar la comunicación con la base de datos PostgreSQL.
3. Implementar la autenticación y autorización de usuarios con JWT
4. Usar el paquete CORS para permitir las consultas de orígenes cruzados
5. Utilizar middlewares para validar las credenciales o token en cabeceras en las rutas que aplique
6. Realizar test de por lo menos 4 rutas de la API REST comprobando los códigos de
   estados de diferentes escenarios

### Hito 4: Integración y Despliegue

1. Realizar el deploy de la aplicación cliente.
2. Realizar el deploy de la aplicación backend.
3. Realizar el deploy de la base de datos.
4. Integrar la aplicación cliente con la aplicación backend en producción.

### Hito 5: Presentación del proyecto

1. Presentación sincrónica del proyecto (GRUPAL)
   - Cada estudiante deberá exponer sus proyectos mostrando el uso de todas sus funcionalidades como un ejemplo de experiencia de usuario.
   - Adicionalmente, podrán mencionar cuáles fueron sus momentos más destacados durante el desarrollo y que fue lo más difícil de realizar y cómo lo resolvieron
   - Tiempo de exposición: Máximo 10 minutos, posteriormente se reservan 5 minutos para
     preguntas y apreciaciones de los espectadores. (Dado que la duración de las sesiones es de 2 horas, los grupos serán llamados a presentar su proyecto a discreción del docente o tutor).
   - Cada estudiante debe subir la presentación de su grupo, ya sea en formato
     pdf, zip o algún link que contenga la presentación, esta debe subirse en la
     sesión de la tutoría, específicamente en el documento con nombre “Hito 5 -
     Presentación del proyecto”.

2. Grabación asincrónica (video proyecto) (INDIVIDUAL) |
   - Graba una presentación de entre 3 y 5 minutos, de forma individual, respondiendo las siguientes preguntas:
     (a) Qué problemática fue detectada o te fue planteada para el desarrollo del proyecto? Para responder, considera qué necesidades existen y quién las tiene.
     (b) ¿Cómo tu proyecto satisface esa problemática o necesidad? Para responder, describe tu aplicación y señala cómo lo que realizaste logra satisfacer la necesidad detectada.
     (c) ¿Qué conocimientos y habilidades desarrolladas durante la carrera fueron claves para realizar este proyecto? Para responder, identifica en los módulos anteriores aquellos aspectos técnicos y prácticos que aplicaste para el desarrollo de tu aplicación.
   - En la misma presentación, adicionalmente, reflexiona en torno a las siguientes preguntas:
     (a) ¿Qué dificultades tuviste para desarrollar la aplicación y cómo lo resolviste? Para responder, recuerda aquellos tropiezos y frustraciones, piensa qué estrategias o apoyos te permitieron salir adelante.
     (b) ¿Qué fue lo que más disfrutaste de desarrollar tu proyecto? Ya sea del proceso, del resultado o de aquello que te haya entregado mayor satisfacción.
     (c) ¿De qué manera crees que la metodología de aprendizaje fue un aporte para el resultado obtenido? Para responder, mira hacia atrás y reflexiona sobre tu aprendizaje, la metodología de estudio, el trabajo colaborativo, entre otras cosas.
   - Cada estudiante debe subir su propio video, esta debe subirse en la sesión de la tutoría, específicamente en el documento con nombre “Video Proyecto”.



-----------------------------------

## Testing (jest)

Correr tests:
**Frontend** cd frontend && npm test
**Backend** cd backend && npm test
