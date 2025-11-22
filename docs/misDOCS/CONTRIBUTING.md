# Guía de Contribución - MOA E-commerce

Gracias por tu interés en contribuir a MOA! Este documento te guiará en el proceso de desarrollo y contribución al proyecto.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Estándares de Código](#estándares-de-código)
6. [Testing](#testing)
7. [Commits y Pull Requests](#commits-y-pull-requests)
8. [Reportar Issues](#reportar-issues)

---

## 📦 Requisitos Previos

### Software Necesario

- **Node.js** 18+ (recomendado: 20 LTS)
- **npm** 9+ o **pnpm** 8+
- **PostgreSQL** 17+
- **Git** 2.40+

### Conocimientos Recomendados

- JavaScript/ES6+
- React 19 + React Router v7
- Node.js + Express 5
- PostgreSQL + SQL básico
- Git/GitHub workflows

---

## 🚀 Configuración del Entorno

### 1. Fork y Clone del Repositorio

```bash
# Fork en GitHub primero, luego:
git clone https://github.com/TU_USUARIO/MOA.git
cd MOA
```

### 2. Instalación de Dependencias

```bash
# Instalar todas las dependencias (monorepo)
npm install

# O individualmente
npm install -w backend
npm install -w frontend
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos
createdb moa_db

# Ejecutar schema
npm run -w backend db

# Poblar con datos de prueba
npm run -w backend seed:all
```

### 4. Variables de Entorno

Crea archivos `.env` en `backend/` y `frontend/`:

#### Backend `.env`:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=moa_db

# JWT
JWT_SECRET=tu_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
JWT_ADMIN_EXPIRES_IN=7d

# Email (desarrollo usa Ethereal)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=tu_usuario_ethereal
SMTP_PASS=tu_password_ethereal
EMAIL_FROM=noreply@moa.cl

# CORS (desarrollo)
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_ENABLED=false
```

#### Frontend `.env`:
```env
VITE_API_URL=http://localhost:4000
VITE_DEBUG_LOGS=true
```

### 5. Ejecutar Servidores

```bash
# Terminal 1: Backend (puerto 4000)
npm run -w backend dev

# Terminal 2: Frontend (puerto 5173)
npm run -w frontend dev
```

Accede a:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

**Usuarios de prueba**:
- Admin: `admin@moa.cl` / `admin`
- Cliente: `demo@moa.cl` / `demo`

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
MOA/
├── backend/                 # API REST Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de controladores
│   │   ├── models/          # Modelos de datos (PostgreSQL)
│   │   ├── middleware/      # Autenticación, validaciones
│   │   ├── services/        # Servicios externos (email, etc.)
│   │   └── utils/           # Utilidades y helpers
│   ├── routes/              # Definición de rutas
│   ├── database/
│   │   ├── config.js        # Conexión PostgreSQL
│   │   ├── schema/DDL.sql   # Schema completo
│   │   └── seed/            # Scripts de datos de prueba
│   └── __tests__/           # Tests Jest
│
├── frontend/                # React SPA
│   ├── src/
│   │   ├── app/             # App.jsx, configuración global
│   │   ├── modules/         # Módulos por feature
│   │   │   ├── admin/       # Dashboard administrativo
│   │   │   ├── auth/        # Login, registro
│   │   │   ├── cart/        # Carrito y checkout
│   │   │   ├── products/    # Catálogo de productos
│   │   │   └── ...
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── ui/          # Botones, inputs, modales
│   │   │   └── data-display/# Tablas, cards, badges
│   │   ├── context/         # Context API (auth, cart)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API clients
│   │   ├── config/          # Constantes, rutas
│   │   └── utils/           # Helpers, validaciones
│   └── public/              # Assets estáticos
│
├── docs/                    # Documentación
│   ├── misDOCS/             # Documentación técnica detallada
│   └── FIXES_CRITICOS_NOV_2025.md
│
└── shared/                  # Código compartido backend/frontend
    └── constants/
```

### Patrones de Arquitectura

#### Backend (MVC)
- **Controllers**: Manejan requests HTTP, validan datos
- **Models**: Interactúan con PostgreSQL, retornan datos puros
- **Services**: Lógica de negocio compleja (emails, pagos)
- **Middleware**: Autenticación JWT, validaciones, rate limiting

#### Frontend (Feature-based)
- **Modules**: Agrupación por feature (admin, products, cart)
- **Components**: UI reutilizable y agnóstica de feature
- **Context**: Estado global (auth, cart)
- **Hooks**: Lógica reutilizable con React Query

---

## 🔄 Flujo de Trabajo

### 1. Crear una Rama

```bash
# Siempre desde dev
git checkout dev
git pull origin dev

# Crear rama según tipo de cambio
git checkout -b feature/nombre-feature     # Nueva funcionalidad
git checkout -b fix/descripcion-bug        # Corrección de bug
git checkout -b refactor/nombre-refactor   # Refactorización
git checkout -b docs/tema-documentacion    # Documentación
```

### 2. Desarrollo

1. **Escribe tests primero** (TDD recomendado)
2. Implementa la funcionalidad
3. Verifica que los tests pasen: `npm test`
4. Verifica el linting: `npm run lint` (si está configurado)
5. Prueba manualmente en el navegador

### 3. Commit

```bash
git add .
git commit -m "tipo: descripción corta

Descripción extendida opcional
- Detalle 1
- Detalle 2

Refs: #123"
```

**Tipos de commit**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización de código
- `docs`: Cambios en documentación
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

### 4. Push y Pull Request

```bash
git push origin tu-rama
```

Abre un PR en GitHub con:
- **Título descriptivo**: `feat: agregar filtro de búsqueda en productos`
- **Descripción completa**: Qué cambió, por qué, cómo probarlo
- **Screenshots** (si es UI)
- **Checklist** de verificación

---

## 📝 Estándares de Código

### JavaScript/JSX

```javascript
// ✅ BUENO: Nombres descriptivos, arrow functions
const getUserOrders = async (userId) => {
  const orders = await orderModel.getOrdersByUserId(userId);
  return orders.filter(order => order.estado_orden === 'confirmed');
};

// ❌ MALO: Nombres genéricos, function keyword innecesario
function getData(id) {
  return model.get(id).filter(x => x.s === 'c');
}
```

### Componentes React

```jsx
// ✅ BUENO: Props destructuradas, PropTypes, exports named
import PropTypes from 'prop-types';

export const ProductCard = ({ product, onAddToCart }) => {
  // Hooks primero
  const [quantity, setQuantity] = useState(1);
  
  // Handlers después
  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };
  
  return (
    <div className="product-card">
      {/* ... */}
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

// ❌ MALO: Default export, sin PropTypes
export default function Card(props) {
  return <div>{props.p.n}</div>;
}
```

### SQL (PostgreSQL)

```sql
-- ✅ BUENO: Parameterizado, explícito
const query = `
  SELECT 
    o.orden_id,
    o.total_cents,
    u.nombre as cliente_nombre
  FROM ordenes o
  JOIN usuarios u ON o.usuario_id = u.usuario_id
  WHERE o.estado_orden = $1
    AND o.creado_en >= $2
  ORDER BY o.creado_en DESC
  LIMIT $3
`;
const { rows } = await pool.query(query, ['confirmed', startDate, 20]);

-- ❌ MALO: Concatenación (SQL injection), SELECT *
const query = `SELECT * FROM ordenes WHERE usuario_id = ${userId}`;
```

### CSS (Tailwind)

```jsx
// ✅ BUENO: Clases utilitarias, responsive, semántico
<button className="
  px-4 py-2 
  bg-primary1 hover:bg-primary1/90 
  text-white font-medium 
  rounded-lg 
  transition-colors
  disabled:opacity-50 disabled:cursor-not-allowed
  sm:px-6 sm:py-3
">
  Agregar al Carrito
</button>

// ❌ MALO: Estilos inline, no responsive
<button style={{ padding: '8px 16px', background: '#6B5444' }}>
  Agregar
</button>
```

### Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos | kebab-case | `product-card.jsx` |
| Componentes | PascalCase | `ProductCard` |
| Funciones | camelCase | `getUserOrders` |
| Constantes | UPPER_SNAKE | `API_BASE_URL` |
| Rutas API | kebab-case | `/api/user-orders` |
| Variables DB | snake_case | `usuario_id`, `order_code` |

---

## 🧪 Testing

### Backend Tests (Jest)

```bash
# Ejecutar todos los tests
npm run -w backend test

# Test específico
npm run -w backend test -- stockValidation.test.js

# Con coverage
npm run -w backend test -- --coverage
```

**Estructura de test**:
```javascript
describe('Order Creation', () => {
  beforeAll(async () => {
    // Setup: crear datos de prueba
  });
  
  afterAll(async () => {
    // Cleanup: limpiar datos de prueba
  });
  
  test('Debe crear orden y descontar stock', async () => {
    // Arrange
    const orderData = { /* ... */ };
    
    // Act
    const order = await orderModel.createOrder(orderData);
    
    // Assert
    expect(order).toBeDefined();
    expect(order.orden_id).toBeGreaterThan(0);
  });
});
```

### Frontend Tests (Jest + React Testing Library)

```bash
npm run -w frontend test
```

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

test('Muestra información del producto correctamente', () => {
  const product = { id: 1, name: 'Mesa', price: 150000 };
  render(<ProductCard product={product} />);
  
  expect(screen.getByText('Mesa')).toBeInTheDocument();
  expect(screen.getByText('$150.000')).toBeInTheDocument();
});
```

### Cobertura Mínima

- **Funciones críticas**: 80%+ (auth, checkout, payments)
- **Models**: 70%+ (lógica de datos)
- **Utils**: 80%+ (helpers, validations)
- **Components UI**: 50%+ (pruebas básicas de render)

---

## 💬 Commits y Pull Requests

### Formato de Commit

```
tipo(scope): descripción corta (max 72 caracteres)

Descripción extendida opcional explicando:
- Qué cambió
- Por qué era necesario
- Cómo afecta al sistema

Refs: #123
Fixes: #456
```

**Ejemplo**:
```
feat(checkout): agregar validación de stock en tiempo real

- Implementa SELECT FOR UPDATE para prevenir race conditions
- Agrega validación de stock antes de crear orden
- Retorna error descriptivo si stock insuficiente

Refs: #234
Fixes: #235
```

### Checklist de Pull Request

Antes de abrir un PR, verifica:

- [ ] El código compila sin errores
- [ ] Todos los tests pasan (`npm test`)
- [ ] Se agregaron tests para nueva funcionalidad
- [ ] La documentación está actualizada
- [ ] El código sigue los estándares del proyecto
- [ ] Se probó manualmente en navegador
- [ ] No hay console.logs en código de producción
- [ ] Las migraciones de DB están incluidas (si aplica)
- [ ] El PR tiene descripción clara y completa

### Revisión de Código

El equipo revisará:
1. **Funcionalidad**: ¿Resuelve el problema correctamente?
2. **Calidad**: ¿Sigue los estándares?
3. **Tests**: ¿Tiene cobertura adecuada?
4. **Performance**: ¿Afecta negativamente el rendimiento?
5. **Seguridad**: ¿Introduce vulnerabilidades?

---

## 🐛 Reportar Issues

### Antes de Reportar

1. **Busca issues existentes**: Puede que alguien ya lo reportó
2. **Verifica la versión**: Asegúrate de estar en la última versión
3. **Reproduce el bug**: Confirma que es reproducible

### Formato de Issue

**Título**: Descriptivo y específico
- ✅ `Checkout falla al crear orden sin dirección`
- ❌ `Bug en checkout`

**Descripción** debe incluir:
```markdown
## Descripción del Bug
[Descripción clara y concisa]

## Pasos para Reproducir
1. Ir a '...'
2. Click en '....'
3. Ver error

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué pasa realmente]

## Screenshots
[Si aplica]

## Entorno
- OS: macOS 14
- Browser: Chrome 120
- Node: 20.10.0
- DB: PostgreSQL 17

## Logs de Consola
```
[Logs relevantes]
```

## Información Adicional
[Contexto adicional]
```

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- [Estado del Proyecto](../docs/ESTADO_PROYECTO_NOV_2025.md)
- [Fixes Críticos Implementados](../docs/FIXES_CRITICOS_NOV_2025.md)
- [Flujo de Compra Completo](../docs/misDOCS/FLUJO_COMPRA_COMPLETO.md)
- [Error Handling Architecture](../docs/misDOCS/ERROR_HANDLING_ARCHITECTURE.md)
- [Guía de Troubleshooting](../docs/TROUBLESHOOTING.md)
- [Manual de Administrador](../docs/ADMIN_MANUAL.md)

### Tecnologías Clave

- [React 19 Docs](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Express 5](https://expressjs.com/)
- [PostgreSQL 17](https://www.postgresql.org/docs/17/)
- [Tailwind CSS 4](https://tailwindcss.com/)

### Comunidad

- **Email**: soporte@moa.cl
- **Issues**: [GitHub Issues](https://github.com/pitu-ebensperger/MOA/issues)
- **Pull Requests**: [GitHub PRs](https://github.com/pitu-ebensperger/MOA/pulls)

---

## 🎉 ¡Gracias por Contribuir!

Tu contribución hace que MOA sea mejor para todos. Si tienes dudas, no dudes en preguntar en los issues o abrir una discusión.

**Happy Coding!** 🚀
