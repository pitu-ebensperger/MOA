# 📋 Índice tabular del repositorio MOA

Las rutas visibles del repositorio, con enlaces directos y columnas para anotar estado/comentarios de seguimiento (ocultos o ignorados se omiten). Completar las columnas `Estado`/`Comentarios` según avance.

## Nivel raíz

| Ruta | Descripción | Estado | Comentarios |
| --- | --- | --- | --- |
| [`README.md`](../README.md) | Guía general, scripts y contexto del proyecto. | ⬜️ | - |
| [`package.json`](../package.json) / [`package-lock.json`](../package-lock.json) | Dependencias y scripts npm del workspace. | ⬜️ | - |
| [`docs/`](../docs) | Documentación funcional/técnica. | ⬜️ | Ver sección específica. |
| [`frontend/`](../frontend) | App web Vite + React. | ⬜️ | Ver detalle frontend. |
| [`backend/`](../backend) | API Node.js + base de datos. | ⬜️ | Ver detalle backend. |
| [`scripts/`](../scripts) | Utilidades para desarrollo. | ⬜️ | - |
| [`snapshots/`](../snapshots) | Fotografías de dependencias y planes de refactor. | ⬜️ | - |
| [`dist/`](../dist) | Build generado por Vite. | ⬜️ | - |

## Documentación (`docs/`)

| Ruta | Descripción | Estado | Comentarios |
| --- | --- | --- | --- |
| [`docs/indice.md`](indice.md) | Índice visual en formato tree. | ⬜️ | Mantener actualizado. |
| [`docs/indice-tabla.md`](indice-tabla.md) | (Este archivo) índice tabular. | ⬜️ | - |
| [`docs/status.md`](status.md) | Tracking de avance por archivo frontend. | ⬜️ | - |
| [`docs/dependencias.md`](dependencias.md) | Inventario de dependencias usadas/evaluadas. | ⬜️ | - |
| [`docs/assets.md`](assets.md) | Lineamientos de recursos gráficos. | ⬜️ | - |

## Frontend (`frontend/`)

### Configuración y utilidades

| Ruta | Descripción | Estado | Comentarios |
| --- | --- | --- | --- |
| [`frontend/package.json`](../frontend/package.json) | Scripts `dev`, `build`, `preview`. | ⬜️ | - |
| [`frontend/vite.config.js`](../frontend/vite.config.js) | Configuración de Vite + plugins. | ⬜️ | - |
| [`frontend/tailwind.config.js`](../frontend/tailwind.config.js) | Tokens y setup de Tailwind. | ⬜️ | - |
| [`frontend/eslint.config.js`](../frontend/eslint.config.js) | Reglas de linting. | ⬜️ | - |
| [`frontend/public/favicon.ico`](../frontend/public/favicon.ico) | Favicon principal. | ⬜️ | - |
| [`frontend/public/vite.svg`](../frontend/public/vite.svg) | Logo de Vite. | ⬜️ | - |
| [`frontend/scripts/export-tokens.js`](../frontend/scripts/export-tokens.js) | Exporta design tokens al front. | ⬜️ | - |

### `src/`

| Ruta | Descripción | Estado | Comentarios |
| --- | --- | --- | --- |
| [`frontend/src/app/App.jsx`](../frontend/src/app/App.jsx) | Composición principal de rutas/layout. | ⬜️ | - |
| [`frontend/src/app/main.jsx`](../frontend/src/app/main.jsx) | Punto de entrada que monta la app. | ⬜️ | - |
| [`frontend/src/components/data-display/`](../frontend/src/components/data-display/) | Componentes DataTable/Price. | ⬜️ | - |
| [`frontend/src/components/layout/`](../frontend/src/components/layout/) | Header, Navbar, Footer, etc. | ⬜️ | - |
| [`frontend/src/components/ui/`](../frontend/src/components/ui/) | Librería de UI (Accordion, Button, etc.). | ⬜️ | - |
| [`frontend/src/config/`](../frontend/src/config/) | `api-paths`, `env`, `status-maps`, tests. | ⬜️ | - |
| [`frontend/src/context/`](../frontend/src/context/) | Contextos Auth, Cart, User, etc. | ⬜️ | - |
| [`frontend/src/hooks/`](../frontend/src/hooks/) | Hooks genéricos (`useInput`, `useOrders`). | ⬜️ | - |
| [`frontend/src/utils/`](../frontend/src/utils/) | Helpers (currency, pagination, validators…). | ⬜️ | - |
| [`frontend/src/styles/`](../frontend/src/styles/) | `global.css`, `tokens.css`, estilos de componentes. | ⬜️ | - |
| [`frontend/src/services/`](../frontend/src/services/) | API client y servicios específicos. | ⬜️ | - |
| [`frontend/src/routes/`](../frontend/src/routes/) | Definición de rutas públicas/privadas. | ⬜️ | - |
| [`frontend/src/mocks/`](../frontend/src/mocks/) | Datos mock (API y base). | ⬜️ | - |
| [`frontend/src/modules/home/`](../frontend/src/modules/home/) | Landing (Hero, CategoriesMenu, hooks). | ⬜️ | - |
| [`frontend/src/modules/products/`](../frontend/src/modules/products/) | Catálogo, filtros, detalle y hooks. | ⬜️ | - |
| [`frontend/src/modules/cart/`](../frontend/src/modules/cart/) | CartPage, Checkout, CartDrawer. | ⬜️ | - |
| [`frontend/src/modules/auth/`](../frontend/src/modules/auth/) | Login/Register/Forgot/Reset + hooks. | ⬜️ | - |
| [`frontend/src/modules/profile/`](../frontend/src/modules/profile/) | Profile, MyOrders, Wishlist. | ⬜️ | - |
| [`frontend/src/modules/admin/`](../frontend/src/modules/admin/) | Dashboard, tablas, drawers, hooks admin. | ⬜️ | - |
| [`frontend/src/modules/categories/`](../frontend/src/modules/categories/) | Vista de categorías. | ⬜️ | - |
| [`frontend/src/modules/styleguide/`](../frontend/src/modules/styleguide/) | StyleGuidePage y variante local. | ⬜️ | - |
| [`frontend/src/modules/support/`](../frontend/src/modules/support/) | Contact, FAQ, Privacy, Terms, NotFound. | ⬜️ | - |

## Backend (`backend/`)

| Ruta | Descripción | Estado | Comentarios |
| --- | --- | --- | --- |
| [`backend/package.json`](../backend/package.json) | Scripts `dev`, `test`. | ⬜️ | - |
| [`backend/index.js`](../backend/index.js) | Arranque de Express. | ⬜️ | - |
| [`backend/jest.config.js`](../backend/jest.config.js) | Configuración de pruebas. | ⬜️ | - |
| [`backend/database/config.js`](../backend/database/config.js) | Configuración de base de datos. | ⬜️ | - |
| [`backend/database/schema/DDL.sql`](../backend/database/schema/DDL.sql) | Definición de tablas. | ⬜️ | - |
| [`backend/database/schema/DML.sql`](../backend/database/schema/DML.sql) | Datos base iniciales. | ⬜️ | - |
| [`backend/database/seed/`](../backend/database/seed/) | Seeds (categories, products, users + datasets). | ⬜️ | - |
| [`backend/routes/homeRoutes.js`](../backend/routes/homeRoutes.js) | Routing dominio Home. | ⬜️ | - |
| [`backend/routes/productsRoutes.js`](../backend/routes/productsRoutes.js) | Routing productos. | ⬜️ | - |
| [`backend/routes/categoriesRoutes.js`](../backend/routes/categoriesRoutes.js) | Routing categorías. | ⬜️ | - |
| [`backend/routes/usersRoutes.js`](../backend/routes/usersRoutes.js) | Routing usuarios. | ⬜️ | - |
| [`backend/routes/authRoutes.js`](../backend/routes/authRoutes.js) | Routing auth/login. | ⬜️ | - |
| [`backend/routes/adminRoutes.js`](../backend/routes/adminRoutes.js) | Routing admin. | ⬜️ | - |
| [`backend/src/controllers/`](../backend/src/controllers/) | Controladores (auth, categorías, usuarios). | ⬜️ | - |
| [`backend/src/middleware/`](../backend/src/middleware/) | Middlewares de credenciales/token. | ⬜️ | - |
| [`backend/src/models/`](../backend/src/models/) | Modelos de datos (`usersModel`, etc.). | ⬜️ | - |

## Scripts, snapshots y build

| Ruta | Descripción | Estado | Comentarios |
| --- | --- | --- | --- |
| [`scripts/debug-navbar.jsx`](../scripts/debug-navbar.jsx) | Script para depurar Navbar. | ⬜️ | - |
| [`scripts/list-merge-conflicts.js`](../scripts/list-merge-conflicts.js) | Lista conflictos pendientes en git. | ⬜️ | - |
| [`snapshots/frontend-deps.json`](../snapshots/frontend-deps.json) | Foto de dependencias frontend. | ⬜️ | - |
| [`snapshots/backend-deps.json`](../snapshots/backend-deps.json) | Foto de dependencias backend. | ⬜️ | - |
| [`snapshots/frontend-refactor-2025-11-16.md`](../snapshots/frontend-refactor-2025-11-16.md) | Bitácora plan refactor frontend. | ⬜️ | - |
| [`dist/index.html`](../dist/index.html) | HTML del build generado. | ⬜️ | - |
| [`dist/favicon.ico`](../dist/favicon.ico) | Favicon de la build. | ⬜️ | - |
| [`dist/vite.svg`](../dist/vite.svg) | Logo Vite en la build. | ⬜️ | - |
| [`dist/assets/`](../dist/assets/) | Assets finales del bundle. | ⬜️ | - |

> Usá las columnas de estado/comentarios como checklist vivo (ej. ✅ Listo, 🟡 En progreso, 🟥 Pendiente) para mantener claridad sobre cada pieza.
