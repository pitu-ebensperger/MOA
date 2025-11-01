# Listado Dependencias

✅  = Instalado y confirmado  
☑️  = Instalado pero en evaluación  
⬜  = Posible a futuro  
✖️  = Descartado  

------------------------------------------------------------------------------

## frontend/

### 🧩 Base
- ✅ react, react-dom > `npm i react react-dom` | app y DOM virtual
- ✅ react-router-dom > `npm i react-router-dom` | maneja rutas entre páginas
- ✅ vite, @vitejs/plugin-react > `npm i -D @vitejs/plugin-react` | dev server + build rápido

### 🎨 UI y estilos
- ✅ tailwindcss, @tailwindcss/vite > `npm i -D tailwindcss @tailwindcss/vite` | estilos utilitarios (Tailwind v4)
- ✅ clsx, tailwind-merge > `npm i clsx tailwind-merge` | combina clases condicionales sin conflictos
- ☑️ @heroicons/react > `npm i @heroicons/react` | iconos outline + fill
- ⬜ lucide-react > `npm i lucide-react` | iconos outline (lib mas grande pero sin fill)

### ⚙️ Funcionalidad
- ☑️ react-hook-form > `npm i react-hook-form` | manejo eficiente de formularios y validaciones
- ☑️ zod, @hookform/resolvers > `npm i zod @hookform/resolvers` | validación tipada integrada a RHF
- ⬜ @tanstack/react-query > `npm i @tanstack/react-query` | manejo de datos con cache, loading y reintentos automáticos
- ⬜ zustand > `npm i zustand` | manejo global de estado (carrito, sesión o UI)

### 💬 Feedback y notificaciones
- ✅ sweetalert2 > `npm i sweetalert2` | alerts, toasts y modales con confirmación

### 🧹 Código y testing
- ✅ eslint, prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh > `npm i -D eslint prettier eslint-plugin-react-hooks eslint-plugin-react-refresh` | formato y estilo de código uniforme
- ⬜ vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom > `npm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom` | testing unitario y de componentes

### 🧠 SEO y Metadatos
- ⬜ react-helmet-async > `npm i react-helmet-async` | gestión de títulos y metadatos dinámicos para SEO

### ✖️ Descartados
- ✖️ axios > `npm i axios` | reemplazado por `fetch` nativo o React Query

------------------------------------------------------------------------------

## backend/

### 🔧 Core y servidor
- ⬜ express > `npm i express` | servidor backend básico y flexible
- ⬜ nodemon > `npm i -D nodemon` | reinicia automáticamente el servidor en desarrollo
- ⬜ cors > `npm i cors` | habilita peticiones desde el frontend
- ⬜ dotenv > `npm i dotenv` | carga variables de entorno desde `.env`
- ⬜ morgan > `npm i morgan` | logs HTTP en desarrollo

### 🔒 Seguridad y autenticación
- ⬜ bcrypt > `npm i bcrypt` | hash seguro de contraseñas
- ⬜ jsonwebtoken > `npm i jsonwebtoken` | autenticación basada en tokens JWT
- ⬜ express-validator > `npm i express-validator` | validación y sanitización de inputs

### 🗄️ Base de datos
- ⬜ pg, pg-hstore, sequelize > `npm i pg pg-hstore sequelize` | ORM y conexión con PostgreSQL
- ⬜ prisma > `npm i prisma` | ORM moderno alternativo a Sequelize (evaluación futura)
- ⬜ sqlite3 > `npm i sqlite3` | BD ligera para testing/local

### ✖️ Descartados (backend)
- /

------------------------------------------------------------------------------

### 💡 Notas 
- Confirmar las marcadas ☑️ una vez la estructura del proyecto esté estable.
- Registrar cualquier nuevo paquete o cambio en este documento para mantener coherencia entre todos los devs.
- Usar `npm i` si se usa en runtime / Usar `npm i -D` si se usa solo en desarrollo o build (devDependencies)
- Al estas dependencias, agregar como plugin en vite.config.js para: tailwindcss(), 