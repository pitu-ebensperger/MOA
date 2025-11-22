# GitHub Copilot Instructions - MOA E-commerce

## Project Overview

MOA is a full-stack e-commerce marketplace (85% complete) with React 19 + Vite frontend, Node.js/Express backend, and PostgreSQL database. Built as a final project for Desafío Latam bootcamp.

## Architecture Essentials

### Frontend Structure (`frontend/`)
- **Module-based architecture**: 11 feature modules under `src/modules/` (admin, auth, cart, products, profile, orders, etc.)
- **Lazy loading**: All pages use `React.lazy()` - bundle split into vendor/query/ui chunks (~150KB initial)
- **State management**: 
  - TanStack Query v5 for server state (5min staleTime, no windowFocus refetch)
  - React Context for auth/cart (consider `AuthOptimized.jsx` for context splitting)
  - Local state with hooks
- **Routing**: React Router v7 with `ProtectedRoute` and `AdminRoute` wrappers
- **Import aliases**: Always use `@/` prefix (e.g., `@/components/ui/Button.jsx`)

### Backend Structure (`backend/`)
- **Routes**: 11 route files in `routes/` (auth, products, orders, admin, etc.)
- **Controllers**: 13 controllers in `src/controllers/` - use `next(error)` pattern, never `res.status().send()`
- **Models**: 10 models in `src/models/` - return data directly, throw errors on failure
- **Middleware**: `tokenMiddleware.js` for JWT, `verifyAdmin.js` for admin-only routes
- **Error handling**: Centralized in `src/utils/error.utils.js` - use `AppError`, `NotFoundError`, `UnauthorizedError`

### Database (`backend/database/`)
- **PostgreSQL 17** with connection pool (pg)
- **Schema**: `database/schema/DDL.sql` (consolidated), migrations in `schema/migrations/`
- **Seeders**: 8 seeders in `database/seed/` - run `npm run -w backend seed:all` for demo data
- **Key tables**: `usuarios`, `productos`, `categorias`, `ordenes`, `carrito`, `direcciones`, `pagos`, `envios`

## Critical Patterns

### JWT Authentication
```javascript
// JWT payload structure (authController.js)
{
  id: user.usuario_id,        // Primary user ID
  email: user.email,
  role_code: user.rol_code,   // 'ADMIN' or 'CUSTOMER'
  rol: user.rol               // Full role name
}

// Default expiration: JWT_EXPIRES_IN=24h (from .env)
// For longer admin sessions, set different JWT_EXPIRES_IN in .env
// OR check role_code in authController and use conditional expiresIn:
const expiresIn = authPayload.role_code === 'ADMIN' ? '7d' : '24h';
```

### Error Handling (3-Layer System)
1. **Backend**: Models throw errors → Controllers catch with `next(error)` → `errorHandler` middleware
2. **React Query**: `onError` callbacks in mutations/queries (see `main.jsx`)
3. **UI**: `ErrorBoundary` (render errors), `SuspenseErrorBoundary` (lazy load), `useErrorHandler` hook

### API Client Pattern
```javascript
// frontend/src/services/api-client.js
- Auto-detects auth routes (no manual auth:true needed for /admin, /perfil, /carrito)
- 401 triggers global logout (except /login, /register)
- Max 2 retries on network/5xx errors, no retry on 4xx
```

### Admin Tables Pattern
All admin tables use: `AdminPageHeader` → `TableToolbar` (search/filters) → `VirtualizedTable` → `ResponsiveRowActions`
- See `CustomersPage.jsx`, `OrdersAdminPageV2.jsx`, `AdminCategoriesPage.jsx` for reference
- Always use `@tanstack/react-virtual` for tables >20 rows

## Development Workflows

### Quick Start
```bash
# Install
npm install

# Database (creates schema + seeds demo data)
npm run -w backend db
npm run -w backend seed:all

# Run dev servers
npm run -w frontend dev  # Port 5173
npm run -w backend dev   # Port 4000

# Test users: admin@moa.cl / demo@moa.cl (password: "admin" or "demo")
```

### Database Operations
```bash
# Individual seeders (run in order)
npm run -w backend seed:users      # Creates admin@moa.cl
npm run -w backend seed:categories
npm run -w backend seed:products
npm run -w backend seed:orders

# Reset schema (DESTRUCTIVE)
npm run -w backend db:reset
```

### Common Issues
- **"Failed to fetch dynamically imported module"**: Hot reload error - press F5 to reload
- **401 on admin routes**: Check JWT payload has `role_code: 'ADMIN'` (not just `rol`)
- **CORS errors**: Verify `CORS_ORIGIN` in backend `.env` or use default dev origins
- **DB connection fails**: Ensure PostgreSQL running (`brew services start postgresql@17`)

## Key Conventions

### File Naming
- Components: PascalCase with `.jsx` (e.g., `ProductCard.jsx`)
- Services: camelCase with `.js` (e.g., `products.api.js`)
- Hooks: `use*` prefix (e.g., `useCart.js`, `useErrorHandler.js`)
- Pages: `*Page.jsx` suffix (e.g., `ProductsPage.jsx`)

### Code Style
- **No `console.log` in production code** - use `useErrorHandler` or backend logger
- **Prefer hooks over classes** (except ErrorBoundary)
- **Always handle loading/error states** in React Query
- **Use TailwindCSS utility classes** - custom CSS only for complex animations

### API Responses
```javascript
// Success: Always return data object
res.status(200).json({ ...data })

// Error: Use error.utils classes
throw new NotFoundError("Producto");
throw new UnauthorizedError("No autorizado");
throw new AppError("Custom message", 400);
```

### Database Queries
```javascript
// Always use parameterized queries (SQL injection prevention)
const query = 'SELECT * FROM productos WHERE id = $1';
const { rows } = await pool.query(query, [productId]);

// Use transactions for multi-step operations
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... multiple queries
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

## Performance Optimizations (Already Implemented)

1. **Code splitting**: 30+ lazy-loaded routes, manual chunks in `vite.config.js`
2. **React Query caching**: 5min staleTime, 10min cacheTime
3. **Virtualization**: Tables >20 rows use `@tanstack/react-virtual`
4. **Memoization**: Critical components use `React.memo`, `useMemo`, `useCallback`
5. **Debouncing**: Search inputs debounced (300ms) via `useDebounce` hook
6. **Prefetching**: Product/category prefetch on hover (see `usePrefetch.examples.md`)

## Testing

```bash
# Frontend tests (Jest + React Testing Library)
npm run -w frontend test

# Backend tests (4+ API routes)
npm run -w backend test
```

## Documentation

- **Full status**: `docs/ESTADO_PROYECTO_NOV_2025.md`
- **Optimizations changelog**: `docs/misDOCS/CHANGELOG_OPTIMIZACIONES.md`
- **Complete checkout flow**: `docs/misDOCS/FLUJO_COMPRA_COMPLETO.md`
- **Error handling architecture**: `docs/misDOCS/ERROR_HANDLING_ARCHITECTURE.md`
- **All docs**: `docs/misDOCS/` (45+ markdown files)

## Current TODOs (High Priority)

1. **JWT Expiration for Admin**: Modify `authController.js` to use conditional `expiresIn` based on `role_code`
2. **Admin Products CRUD**: Connect `ProductsAdminPage.jsx` to real API (currently console.log)
3. **Order Confirmation Email**: Trigger email in `createOrderFromCart` (emailService.js exists)
4. **Stock Validation**: Verify real-time stock checks before order creation
5. **Remove sensitive logs**: Audit `AuthContext.jsx`, `CheckoutPage.jsx` for production logs

## Prohibited Patterns

- ❌ Direct DOM manipulation (use React state)
- ❌ `any` types in JSDoc (use specific types)
- ❌ Inline styles (use Tailwind classes)
- ❌ String concatenation in SQL queries (use parameterized)
- ❌ Hardcoded API URLs (use `API_PATHS` from `config/api-paths.js`)
- ❌ `console.log` without DEV check (use `import.meta.env.DEV`)

## Quick Reference

**Test Credentials**: `admin@moa.cl` / `admin` | `demo@moa.cl` / `demo`  
**Frontend Port**: 5173 | **Backend Port**: 4000  
**Database**: `moa_db` (PostgreSQL 17)  
**Tech Stack**: React 19, Vite 7, Express 5, TanStack Query v5, Tailwind 4, PostgreSQL 17
