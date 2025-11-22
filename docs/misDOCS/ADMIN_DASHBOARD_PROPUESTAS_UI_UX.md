# 📊 Propuestas Admin Dashboard - MOA E-commerce

**Fecha:** 22 de Noviembre, 2025  
**Autor:** Análisis basado en referencias de UI/UX admin dashboards  
**Estado:** 🎨 Propuestas de diseño

---

## 🎯 Objetivo

Rediseñar el admin dashboard de MOA con visualizaciones modernas, intuitivas y accionables, adaptadas a la identidad visual de la marca (tonos tierra, minimalismo, elegancia).

---

## 📈 Datos Disponibles (Análisis de DB)

### Tablas Principales

1. **`ordenes`** (17 órdenes confirmadas)
   - `total_cents`, `subtotal_cents`, `envio_cents`
   - `metodo_pago`: transferencia, webpay, tarjeta_credito, tarjeta_debito, paypal, efectivo
   - `metodo_despacho`: standard, express, retiro
   - `estado_pago`: pendiente, pagado, fallido
   - `estado_envio`: preparacion, enviado, entregado
   - `estado_orden`: draft, confirmed, cancelled
   - Timestamps: `creado_en`, `fecha_pago`, `fecha_envio`, `fecha_entrega_real`

2. **`usuarios`** (13 clientes activos)
   - `rol`: admin, user
   - `status`: activo, inactivo
   - `creado_en`

3. **`productos`** (múltiples SKUs)
   - `precio_cents`, `stock`, `status`
   - `categoria_id`, `nombre`, `slug`
   - `badge`, `tags`, `color`, `material`

4. **`orden_items`** (detalle de productos vendidos)
   - `cantidad`, `precio_unit`
   - Relaciones: `orden_id`, `producto_id`

5. **`categorias`** (6 categorías)
   - Muebles, Sillas, Mesas, Decoración, Iluminación, Accesorios

6. **`carritos`** (carritos abandonados)
7. **`wishlists`** (productos favoritos)

### Métricas Derivables

#### 📊 Ventas & Ingresos
- **Ingresos totales** (última semana, mes, trimestre, año)
- **Ticket promedio** por orden
- **Ingresos por categoría** (torta/barras)
- **Ingresos por método de pago** (ya implementado ✅)
- **Ingresos por método de envío** (ya implementado ✅)
- **Evolución temporal** (línea de tiempo: diaria, semanal, mensual)
- **Comparativa períodos** (vs mes anterior, vs año anterior)
- **Distribución de precios** (rangos: <$10k, $10-50k, >$50k)

#### 👥 Clientes
- **Total clientes registrados**
- **Clientes nuevos** (por período)
- **Clientes recurrentes** (>1 compra)
- **Tasa de retención** (% que vuelve a comprar)
- **Valor de vida del cliente** (LTV)
- **Distribución geográfica** (por región si tenemos direcciones)
- **Clientes activos vs inactivos**

#### 📦 Productos
- **Total productos activos**
- **Productos más vendidos** (top 10)
- **Productos con bajo stock** (<5 unidades)
- **Productos sin ventas** (últimos 30 días)
- **Valor del inventario** (stock × precio)
- **Margen por producto** (si tenemos costo)
- **Productos más añadidos a wishlist**
- **Productos más abandonados en carrito**

#### 🚚 Logística & Envíos
- **Órdenes pendientes** (por estado_envio)
- **Tiempo promedio de envío** (fecha_envio → fecha_entrega_real)
- **Tasa de entregas a tiempo**
- **Órdenes por empresa de envío**
- **Órdenes en tránsito**

#### 💳 Pagos
- **Órdenes pendientes de pago**
- **Tasa de conversión de pago** (pagado / total)
- **Pagos fallidos** (por método)
- **Tiempo promedio de procesamiento**

#### 📉 Conversión & Abandono
- **Carritos abandonados** (total, valor)
- **Tasa de conversión carrito → orden**
- **Productos más abandonados**
- **Wishlist → conversión**

---

## 🎨 Propuestas de Visualizaciones

### 1️⃣ **Overview Dashboard** (Página Principal)

Inspirado en las imágenes de referencia, propongo un layout en **grid adaptable** con las siguientes secciones:

#### **Header KPIs** (4 cards superiores)
```
┌─────────────────────────────────────────────────────────────┐
│  Ingresos Totales     │  Órdenes       │  Clientes    │  AOV │
│  $449,699            │  17 (+12%)    │  13 (+4)     │ $26k │
│  vs mes anterior      │  Esta semana   │  Nuevos      │ ↑ 8% │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- **Iconos lucide-react**: DollarSign, ShoppingCart, Users, TrendingUp
- **Colores MOA**: 
  - Verde suave para métricas positivas: `#059669` (emerald-600)
  - Naranja cálido para alertas: `#f97316` (orange-500)
  - Marrón primario: `--color-primary1`
- **Animación**: Framer Motion fade-in con contador animado (react-countup)
- **Comparativa**: Mini sparkline o % cambio vs período anterior

#### **Gráfico Principal: Evolución de Ingresos**
```
┌───────────────────────────────────────────────────────────────┐
│  Ingresos y Órdenes (Últimos 30 días)                   [7d 30d 90d 1y] │
│                                                                 │
│  [Gráfico de línea + área (Recharts)]                         │
│  - Línea azul: Ingresos diarios                                │
│  - Área verde: Volumen de órdenes                              │
│  - Tooltips con desglose por día                               │
│                                                                 │
└───────────────────────────────────────────────────────────────┘
```

**Inspiración**: Imagen de "Statistics" con gráficos duales  
**Componente**: `<ComposedChart>` de Recharts (Line + Area)  
**Filtros**: Tabs para 7d, 30d, 90d, 1y (como en las imágenes)

#### **Grid de Métricas Secundarias** (2 columnas)

**Columna Izquierda:**
1. **Ingresos por Método de Pago** (ya implementado ✅)
   - Mantener diseño actual (PieChart + tabla detallada)
   
2. **Top 5 Productos Más Vendidos**
   ```
   ┌────────────────────────────────────────┐
   │  Productos Más Vendidos               │
   │  ─────────────────────────────────     │
   │  1. Lámpara Colgante    3 uds  $45k  │
   │  2. Silla Cuero         2 uds  $30k  │
   │  3. Escritorio Fresno   2 uds  $38k  │
   │  ... con imágenes miniatura            │
   └────────────────────────────────────────┘
   ```
   **Diseño**: Lista ordenada con:
   - Imagen thumbnail (40x40px)
   - Nombre del producto
   - Badge de categoría
   - Unidades vendidas + ingresos
   - Barra de progreso relativa al #1

3. **Distribución de Órdenes por Estado**
   ```
   ┌──────────────────────────────────┐
   │  Estado de Órdenes              │
   │  ─────────────────────────       │
   │  [Gráfico de donut con centro]  │
   │  - Preparación: 5 (29%)         │
   │  - Enviado: 8 (47%)             │
   │  - Entregado: 4 (24%)           │
   └──────────────────────────────────┘
   ```
   **Inspiración**: "Delivery exceptions" de las imágenes  
   **Colores**: Naranja (prep), Azul (enviado), Verde (entregado)

**Columna Derecha:**
1. **Métodos de Envío** (ya implementado ✅)
   - Mantener diseño actual

2. **Clientes Nuevos vs Recurrentes**
   ```
   ┌─────────────────────────────────────┐
   │  Distribución de Clientes           │
   │  ──────────────────────────────      │
   │  [Gráfico de barras horizontales]   │
   │  Nuevos:      9 clientes  (69%)     │
   │  Recurrentes: 4 clientes  (31%)     │
   │                                      │
   │  Tasa de retención: 31%             │
   └─────────────────────────────────────┘
   ```

3. **Productos con Bajo Stock (Alerta)**
   ```
   ┌────────────────────────────────────┐
   │  ⚠️ Alerta de Stock Bajo          │
   │  ────────────────────────────      │
   │  • Silla Moderna (2 uds)          │
   │  • Mesa Roble (3 uds)             │
   │  • Lámpara Techo (1 ud)           │
   │  ────────────────────────────      │
   │  [Botón: Ver Inventario]          │
   └────────────────────────────────────┘
   ```
   **Colores**: Fondo naranja claro, borde naranja-600  
   **Interactivo**: Click → navega a página de productos

#### **Footer: Actividad Reciente**
```
┌────────────────────────────────────────────────────────────┐
│  Últimas Órdenes                                           │
│  ──────────────────────────────────────────────────────     │
│  #MOA-00017 │ María García   │ $15,990 │ Webpay    │ ✓    │
│  #MOA-00016 │ Juan Pérez     │ $45,000 │ Transfer. │ ⏳   │
│  ... (últimas 5)                           [Ver todas →]   │
└────────────────────────────────────────────────────────────┘
```
**Diseño**: Tabla compacta con estados en chips de colores

---

### 2️⃣ **Ventas (Nueva Tab o Página)**

Análisis profundo de ventas con más detalles.

#### **Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Filtros de período + comparativa                   │
│  [Selector de rango de fechas] [vs mes anterior ✓]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  KPIs ampliados (6 cards)                                   │
│  Ingresos │ Órdenes │ AOV │ Productos │ Conversión │ Tasa  │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┬─────────────────────┐
│  Evolución Temporal (Grande)          │  Distribución       │
│  [Gráfico de barras agrupadas]        │  Horaria            │
│  - Por día/semana/mes                 │  [Heatmap]          │
│  - Comparativa con período anterior   │  Lun-Dom × 0-23h    │
└───────────────────────────────────────┴─────────────────────┘

┌────────────────────┬──────────────────┬───────────────────────┐
│  Por Categoría     │  Por Método Pago │  Por Método Envío     │
│  [Barras horiz.]   │  [Pie Chart]     │  [Cards con ícono]    │
└────────────────────┴──────────────────┴───────────────────────┘
```

**Características especiales:**
- **Heatmap de ventas por hora**: Inspirado en "Shipment Statistics"
  - Filas: Días de la semana
  - Columnas: Horas del día (0-23)
  - Color: Intensidad de ventas (blanco → verde oscuro)
  - Librería: `react-calendar-heatmap` o custom con Recharts

- **Comparativa temporal**: Líneas superpuestas (actual vs anterior)
  - Similar a "Sales Overview" de las imágenes

---

### 3️⃣ **Clientes (Nueva Página en Sidebar)**

Dashboard dedicado a métricas de clientes.

#### **Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  KPIs Clientes                                               │
│  Total │ Nuevos │ Recurrentes │ LTV Promedio │ Retención   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────┐
│  Crecimiento de Clientes         │  Segmentación por Valor  │
│  [Gráfico de área apilada]       │  [Gráfico de embudo]     │
│  - Acumulado mensual             │  - VIP (>$100k): 2       │
│  - Nuevos vs Recurrentes         │  - Regulares: 7          │
│                                   │  - Ocasionales: 4        │
└──────────────────────────────────┴──────────────────────────┘

┌──────────────────────────────────┬──────────────────────────┐
│  Top 10 Clientes por Compras     │  Distribución Geográfica │
│  [Tabla con avatars]             │  [Mapa o lista]          │
│  Nombre │ Órdenes │ Total        │  Santiago: 8             │
│  ───────────────────────────     │  Valparaíso: 3           │
│  María G. │ 3 │ $45k            │  Concepción: 2           │
└──────────────────────────────────┴──────────────────────────┘
```

**Inspiración**: "Popular Instructors" de las imágenes  
**Componentes**:
- Avatares con iniciales (si no hay foto)
- Badges de "VIP", "Nuevo", "Inactivo"

---

### 4️⃣ **Productos (Mejorar Vista Actual)**

Agregar al CRUD existente un **panel de analytics arriba**:

```
┌─────────────────────────────────────────────────────────────┐
│  Inventario en Números                                       │
│  Total │ Activos │ Bajo Stock │ Sin Ventas │ Valor Total    │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  [Tabs: Top Vendidos | Bajo Stock | Sin Ventas | Por Cat.] │
│                                                              │
│  Visualizaciones según tab seleccionado                     │
└────────────────────────────────────────────────────────────┘
```

**Tab "Top Vendidos":**
- Tabla con columnas: Imagen | Nombre | Categoría | Vendidos | Ingresos | Stock
- Ordenable por cualquier columna

**Tab "Bajo Stock":**
- Cards con alertas visuales
- Botón rápido "Actualizar Stock" → abre modal

**Tab "Por Categoría":**
- Gráfico de barras con drill-down (click → ver productos)

---

### 5️⃣ **Órdenes (Mejorar Vista Actual)**

Agregar **dashboard de logística**:

```
┌────────────────────────────────────────────────────────────┐
│  Pipeline de Órdenes (Kanban visual)                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ 🆕   │  │ 💳   │  │ 📦   │  │ 🚚   │  │ ✅   │        │
│  │ Nueva│  │ Pago │  │ Prep.│  │ Envío│  │ Entr.│        │
│  │  5   │  │  3   │  │  4   │  │  3   │  │  2   │        │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘        │
└────────────────────────────────────────────────────────────┘
```

**Inspiración**: "Vehicle Overview" + "Shipment Statistics" de imágenes  
**Interactividad**: Click en número → filtra tabla de órdenes abajo

**Métricas de tiempos:**
```
┌──────────────────────────────────────────────────────────┐
│  Tiempos Promedio de Procesamiento                       │
│  ──────────────────────────────────────────────────      │
│  Confirmación → Pago:      2.5 días  [barra progreso]   │
│  Pago → Preparación:       1.0 día   [barra progreso]   │
│  Preparación → Envío:      2.0 días  [barra progreso]   │
│  Envío → Entrega:          3.5 días  [barra progreso]   │
│  ──────────────────────────────────────────────────      │
│  Total promedio:           9.0 días                      │
└──────────────────────────────────────────────────────────┘
```

---

### 6️⃣ **Conversión & Abandono (Nueva Página)**

Dashboard para analizar embudos de conversión.

```
┌─────────────────────────────────────────────────────────────┐
│  Embudo de Conversión                                        │
│  ────────────────────────────────────────────────────────    │
│  [Gráfico de embudo vertical]                               │
│  👁️ Visitas a productos:      1,245  (100%)                │
│     ↓ 68% conversión                                        │
│  🛒 Añadido al carrito:         850  (68%)                  │
│     ↓ 45% conversión                                        │
│  🎯 Inició checkout:            380  (31%)                  │
│     ↓ 75% conversión                                        │
│  💳 Completó pago:              285  (23%)                  │
└─────────────────────────────────────────────────────────────┘
```

**Inspiración**: "Conversion Rate" de imágenes

```
┌────────────────────────────────────────────────────────────┐
│  Carritos Abandonados (Últimos 7 días)                      │
│  ──────────────────────────────────────────────────────     │
│  Total: 12 carritos │ Valor: $234,500 │ Tasa: 55%         │
│                                                              │
│  [Tabla: Usuario | Productos | Valor | Hace | Acciones]    │
│  María G. │ 3 items │ $25k │ 2 días │ [📧 Email] [👁️ Ver]│
│  Juan P.  │ 1 item  │ $15k │ 5 días │ [📧 Email] [👁️ Ver]│
└────────────────────────────────────────────────────────────┘
```

**Acciones:**
- **[📧 Email]**: Enviar email de recordatorio (si implementamos)
- **[👁️ Ver]**: Ver detalle del carrito en modal

```
┌──────────────────────────────────────────────────────────┐
│  Productos Más Abandonados                                │
│  ────────────────────────────────────────────────────     │
│  1. Silla Moderna           8 veces │ Avg $30k          │
│  2. Mesa Roble              5 veces │ Avg $45k          │
│  3. Lámpara Techo           4 veces │ Avg $15k          │
│  [Sugerencia: Revisar precio, stock, descripción]        │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Sistema de Diseño MOA para Dashboard

### **Paleta de Colores Adaptada**

Basado en `tokens.css` existente:

```css
/* Colores principales para gráficos */
--chart-primary: #78350f;      /* brown-900 - MOA primario */
--chart-secondary: #92400e;    /* brown-800 */
--chart-accent-1: #059669;     /* emerald-600 - éxito/positivo */
--chart-accent-2: #f97316;     /* orange-500 - alerta/atención */
--chart-accent-3: #0284c7;     /* sky-600 - información */
--chart-neutral: #64748b;      /* slate-500 - neutro */

/* Estados */
--status-success: #10b981;     /* green-500 */
--status-warning: #f59e0b;     /* amber-500 */
--status-error: #ef4444;       /* red-500 */
--status-info: #3b82f6;        /* blue-500 */

/* Fondos de cards */
--card-bg: #ffffff;
--card-border: var(--color-border);
--card-hover: #fafaf9;         /* stone-50 */
```

### **Tipografía Dashboard**

```css
/* Títulos de secciones */
.dashboard-section-title {
  font-family: var(--font-display); /* Outfit */
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary2);
}

/* KPIs grandes */
.kpi-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-strong);
}

/* KPIs labels */
.kpi-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Métricas comparativas */
.metric-change {
  font-size: 0.875rem;
  font-weight: 600;
}
.metric-change.positive { color: var(--status-success); }
.metric-change.negative { color: var(--status-error); }
```

### **Componentes Reutilizables**

#### **StatCard** (para KPIs)
```jsx
<StatCard
  label="Ingresos Totales"
  value="$449,699"
  change="+12%"
  trend="up"
  icon={<DollarSign />}
  period="vs mes anterior"
/>
```

#### **ChartCard** (wrapper para gráficos)
```jsx
<ChartCard
  title="Evolución de Ventas"
  subtitle="Últimos 30 días"
  filters={<TabFilters options={['7d', '30d', '90d']} />}
  actions={<IconButton icon={<Download />} />}
>
  <LineChart data={data} />
</ChartCard>
```

#### **ProgressBar** (para porcentajes)
```jsx
<ProgressBar
  value={68}
  max={100}
  label="Conversión"
  color="emerald"
  showPercentage
/>
```

#### **Badge** (para estados)
```jsx
<Badge variant="success">Entregado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="error">Cancelado</Badge>
<Badge variant="info">Procesando</Badge>
```

---

## 📐 Layouts Propuestos

### **Opción A: Dashboard con Tabs** (Recomendado)

Mantener estructura actual de AdminDashboardPage con tabs mejorados:

```
Header (fijo)
─────────────────────────────────────────────────────────
│ [Logo] MOA Admin                     [🔔] [👤] Admin   │
─────────────────────────────────────────────────────────

Sidebar (izquierda)
─────────────────
│ 📊 Dashboard   │ ← activo
│ 📦 Productos   │
│ 📋 Órdenes     │
│ 👥 Clientes    │
│ 📊 Analytics   │ ← nuevo
│ ⚙️ Configurar  │
─────────────────

Contenido Principal
─────────────────────────────────────────────────────────────
│ [Tabs: Overview | Ventas | Conversión]                    │
│                                                             │
│ [Contenido según tab seleccionado]                        │
└─────────────────────────────────────────────────────────────┘
```

**Tabs del Dashboard:**
1. **Overview** (default): Vista general con métricas clave
2. **Ventas**: Análisis profundo de ventas
3. **Conversión**: Embudos y carritos abandonados

### **Opción B: Páginas Separadas en Sidebar**

Crear nuevas rutas en el menú lateral:

```
Sidebar
─────────────────────
│ 📊 Overview        │ → /admin/dashboard
│ 💰 Ventas          │ → /admin/ventas (nuevo)
│ 👥 Clientes        │ → /admin/clientes (nuevo)
│ 📦 Productos       │ → /admin/productos
│ 📋 Órdenes         │ → /admin/ordenes
│ 📈 Analytics       │ → /admin/analytics (nuevo)
│ 🛒 Conversión      │ → /admin/conversion (nuevo)
│ ⚙️ Configuración   │ → /admin/configuracion
─────────────────────
```

**Ventaja**: Mejor organización, URLs directas  
**Desventaja**: Más clics para cambiar de vista

### **Opción C: Dashboard Híbrido** (Mejor de ambos)

```
Sidebar principal:
─────────────────────
│ 📊 Dashboard       │ → con tabs: Overview, Ventas, Conversión
│ 👥 Clientes        │ → página dedicada con analytics
│ 📦 Productos       │ → CRUD actual + panel analytics
│ 📋 Órdenes         │ → tabla actual + dashboard logística
│ ⚙️ Configuración   │
─────────────────────
```

**Recomendación**: Esta opción combina lo mejor de ambas estrategias.

---

## 🎨 Referencias Visuales Aplicadas

### De las imágenes adjuntas:

1. **"Statistics" (4 KPIs superiores)** → `StatCard` components
2. **"Sales Overview" (gráfico dual)** → `ComposedChart` de Recharts
3. **"Delivery Performance" (lista con íconos)** → Top productos vendidos
4. **"Vehicle Overview" (barra segmentada)** → Estados de órdenes
5. **"Shipment Statistics" (gráfico de barras)** → Evolución temporal
6. **"Delivery exceptions" (donut chart)** → Distribución de estados
7. **"Traffic source" (donut con íconos)** → Clientes nuevos vs recurrentes
8. **"Topic you are interested in" (barras horizontales)** → Productos por categoría
9. **"Course you are taking" (tabla con progress)** → Tabla de órdenes mejorada
10. **"Popular Instructors"** → Top clientes
11. **"Earning Reports" (gráfico de barras + desglose)** → Ventas por período
12. **"Conversion Rate" (embudo con %)**  → Embudo de conversión
13. **"Generated Leads" (donut gauge)** → Porcentajes circulares

---

## 🛠️ Stack Tecnológico Propuesto

### Librerías de Gráficos

1. **Recharts** (ya instalado ✅)
   - Para: Line, Area, Bar, Pie, Composed charts
   - Responsive, customizable, bien documentado

2. **TanStack Table v8** (ya instalado ✅)
   - Para: Tablas avanzadas con sorting, filtering
   - Virtualization para grandes datasets

3. **Framer Motion** (ya instalado ✅)
   - Animaciones suaves de entrada/salida
   - Gestures para interactividad

### Nuevas Librerías Sugeridas

1. **react-countup** (contador animado para KPIs)
   ```bash
   npm install react-countup
   ```
   Uso:
   ```jsx
   <CountUp end={449699} duration={2} separator="," />
   ```

2. **date-fns** (ya instalado ✅)
   - Manejo de fechas/rangos

3. **recharts-to-png** (exportar gráficos)
   ```bash
   npm install recharts-to-png
   ```

4. **react-calendar-heatmap** (heatmap de ventas horarias)
   ```bash
   npm install react-calendar-heatmap
   ```

---

## 📝 Plan de Implementación

### Fase 1: Mejoras Inmediatas (2-3 días)

1. **Crear componentes base:**
   - `StatCard.jsx` (4 variantes de diseño)
   - `ChartCard.jsx` (wrapper con header/footer)
   - `Badge.jsx` (estados con colores MOA)
   - `ProgressBar.jsx`

2. **Mejorar Overview tab actual:**
   - Agregar 4 KPIs superiores animados
   - Implementar gráfico de evolución temporal (línea + área)
   - Agregar "Top 5 Productos" abajo del gráfico de pagos

3. **Crear queries nuevas:**
   - `useTopProducts(periodo, limit)`
   - `useOrdersByStatus()`
   - `useCustomerStats(periodo)`

### Fase 2: Nuevas Vistas (3-4 días)

1. **Tab "Ventas":**
   - Gráfico de barras agrupadas (actual vs anterior)
   - Heatmap de ventas por hora/día
   - Distribución por categoría

2. **Tab "Conversión":**
   - Embudo de conversión
   - Tabla de carritos abandonados
   - Productos más abandonados

3. **Página "Clientes":**
   - KPIs de clientes
   - Top 10 clientes
   - Segmentación por valor

### Fase 3: Mejoras en Vistas Existentes (2 días)

1. **Productos:**
   - Panel de analytics arriba del CRUD
   - Tabs para diferentes vistas

2. **Órdenes:**
   - Pipeline visual de estados
   - Métricas de tiempos de procesamiento

### Fase 4: Refinamiento (1-2 días)

1. **Interactividad:**
   - Click en gráficos → filtrar tablas
   - Tooltips informativos
   - Exportación de datos

2. **Responsividad:**
   - Grid adaptable mobile
   - Gráficos escalables

3. **Performance:**
   - Lazy loading de gráficos
   - Memoización de cálculos pesados

**Total estimado: 8-11 días de desarrollo**

---

## 🎯 Prioridades Sugeridas

### Must Have (Crítico)
- ✅ 4 KPIs superiores animados
- ✅ Gráfico de evolución temporal
- ✅ Top 5 productos más vendidos
- ✅ Distribución de estados de órdenes
- ✅ Componentes base (StatCard, ChartCard, Badge)

### Should Have (Importante)
- 📊 Tab "Ventas" con gráficos avanzados
- 📊 Heatmap de ventas horarias
- 📊 Embudo de conversión
- 📊 Carritos abandonados

### Nice to Have (Deseable)
- 🎨 Animaciones complejas
- 🎨 Exportación de reportes PDF
- 🎨 Página dedicada de "Clientes"
- 🎨 Comparativas de períodos personalizadas

---

## 📊 Ejemplos de Queries SQL

Para implementar las visualizaciones propuestas:

### Top Productos por Ventas
```sql
SELECT 
  p.nombre,
  p.img_url,
  c.nombre as categoria,
  SUM(oi.cantidad) as unidades_vendidas,
  SUM(oi.cantidad * oi.precio_unit) as ingresos_totales
FROM orden_items oi
JOIN productos p ON oi.producto_id = p.producto_id
LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
JOIN ordenes o ON oi.orden_id = o.orden_id
WHERE o.estado_orden = 'confirmed'
  AND o.creado_en >= NOW() - INTERVAL '30 days'
GROUP BY p.producto_id, p.nombre, p.img_url, c.nombre
ORDER BY unidades_vendidas DESC
LIMIT 5;
```

### Órdenes por Estado
```sql
SELECT 
  estado_envio,
  COUNT(*) as cantidad,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM ordenes
WHERE estado_orden = 'confirmed'
GROUP BY estado_envio;
```

### Clientes Nuevos vs Recurrentes
```sql
WITH cliente_ordenes AS (
  SELECT 
    usuario_id,
    COUNT(*) as total_ordenes
  FROM ordenes
  WHERE estado_orden = 'confirmed'
  GROUP BY usuario_id
)
SELECT 
  CASE 
    WHEN total_ordenes = 1 THEN 'Nuevo'
    ELSE 'Recurrente'
  END as tipo_cliente,
  COUNT(*) as cantidad
FROM cliente_ordenes
GROUP BY tipo_cliente;
```

### Evolución Diaria de Ventas (últimos 30 días)
```sql
SELECT 
  DATE(creado_en) as fecha,
  COUNT(*) as num_ordenes,
  SUM(total_cents) as ingresos_totales
FROM ordenes
WHERE estado_orden = 'confirmed'
  AND creado_en >= NOW() - INTERVAL '30 days'
GROUP BY DATE(creado_en)
ORDER BY fecha;
```

### Productos con Bajo Stock
```sql
SELECT 
  producto_id,
  nombre,
  sku,
  stock,
  img_url
FROM productos
WHERE status = 'activo'
  AND stock <= 5
ORDER BY stock ASC;
```

### Carritos Abandonados
```sql
SELECT 
  c.carrito_id,
  u.nombre as cliente,
  u.email,
  COUNT(ci.carrito_item_id) as num_items,
  SUM(p.precio_cents * ci.cantidad) as valor_total,
  c.creado_en,
  EXTRACT(DAY FROM NOW() - c.creado_en) as dias_abandonado
FROM carritos c
JOIN usuarios u ON c.usuario_id = u.usuario_id
JOIN carrito_items ci ON c.carrito_id = ci.carrito_id
JOIN productos p ON ci.producto_id = p.producto_id
WHERE NOT EXISTS (
  SELECT 1 
  FROM ordenes o 
  WHERE o.usuario_id = c.usuario_id 
    AND o.creado_en > c.creado_en
)
  AND c.creado_en >= NOW() - INTERVAL '7 days'
GROUP BY c.carrito_id, u.nombre, u.email, c.creado_en
ORDER BY dias_abandonado ASC;
```

---

## 🎨 Mockup de Layout Final

```
┌─────────────────────────────────────────────────────────────────────┐
│ MOA Admin                          [🔔 Notificaciones] [👤 Admin]   │
├──────────┬──────────────────────────────────────────────────────────┤
│          │ DASHBOARD                                                │
│ Sidebar  │ ┌───────────────────────────────────────────────────┐   │
│          │ │ [Tabs: Overview | Ventas | Conversión]           │   │
│ 📊 Dash  │ └───────────────────────────────────────────────────┘   │
│ 👥 Client│                                                          │
│ 📦 Produc│ ┌──────┬──────┬──────┬──────┐                          │
│ 📋 Orden │ │ $449k│  17  │  13  │ $26k │  ← StatCards animados   │
│ ⚙️ Config│ └──────┴──────┴──────┴──────┘                          │
│          │                                                          │
│          │ ┌────────────────────────────────────────────────────┐  │
│          │ │ Evolución de Ingresos [7d 30d 90d 1y]            │  │
│          │ │ [Gráfico de línea + área]                         │  │
│          │ │                                                    │  │
│          │ └────────────────────────────────────────────────────┘  │
│          │                                                          │
│          │ ┌─────────────────────┬──────────────────────────────┐  │
│          │ │ Métodos de Pago     │ Métodos de Envío            │  │
│          │ │ [PieChart + tabla]  │ [Cards + BarChart]          │  │
│          │ └─────────────────────┴──────────────────────────────┘  │
│          │                                                          │
│          │ ┌─────────────────────┬──────────────────────────────┐  │
│          │ │ Top 5 Productos     │ Estados de Órdenes          │  │
│          │ │ [Lista con imgs]    │ [Donut chart]               │  │
│          │ └─────────────────────┴──────────────────────────────┘  │
│          │                                                          │
│          │ ┌────────────────────────────────────────────────────┐  │
│          │ │ Últimas Órdenes [Ver todas →]                     │  │
│          │ │ [Tabla compacta con 5 filas]                      │  │
│          │ └────────────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Preparación
- [ ] Crear branch `feature/admin-dashboard-redesign`
- [ ] Instalar librerías nuevas: `react-countup`, `react-calendar-heatmap`
- [ ] Crear carpeta `frontend/src/modules/admin/components/dashboard/`

### Componentes Base
- [ ] `StatCard.jsx` + estilos
- [ ] `ChartCard.jsx` + estilos
- [ ] `Badge.jsx` (mejorar existente)
- [ ] `ProgressBar.jsx`
- [ ] `EmptyState.jsx` (para datos vacíos)

### Backend - Nuevos Endpoints
- [ ] `GET /admin/dashboard/kpis?periodo=30` (KPIs generales)
- [ ] `GET /admin/dashboard/top-products?periodo=30&limit=5`
- [ ] `GET /admin/dashboard/orders-by-status`
- [ ] `GET /admin/dashboard/customer-stats?periodo=30`
- [ ] `GET /admin/dashboard/sales-evolution?periodo=30`
- [ ] `GET /admin/dashboard/abandoned-carts?dias=7`

### Frontend - Hooks
- [ ] `useDashboardKPIs(periodo)`
- [ ] `useTopProducts(periodo, limit)`
- [ ] `useOrdersByStatus()`
- [ ] `useCustomerStats(periodo)`
- [ ] `useSalesEvolution(periodo)`

### Visualizaciones
- [ ] KPIs superiores con animación
- [ ] Gráfico evolución temporal (línea + área)
- [ ] Top 5 productos (lista con imágenes)
- [ ] Distribución estados órdenes (donut)
- [ ] Tab "Ventas" con gráficos avanzados
- [ ] Tab "Conversión" con embudo
- [ ] Heatmap de ventas horarias

### Testing
- [ ] Tests unitarios de componentes
- [ ] Tests de integración de queries
- [ ] Tests de responsive design
- [ ] Tests de performance (Lighthouse)

### Documentación
- [ ] Actualizar `MAPA_COMPONENTES_ADMIN.md`
- [ ] Crear `ADMIN_DASHBOARD_USAGE.md`
- [ ] Actualizar `ESTADO_PROYECTO_NOV_2025.md`

---

## 🎓 Recursos de Aprendizaje

### Recharts
- [Documentación oficial](https://recharts.org/)
- [Ejemplos de gráficos](https://recharts.org/en-US/examples)

### Framer Motion
- [Animaciones de cards](https://www.framer.com/motion/animation/)
- [Variants patterns](https://www.framer.com/motion/animation/#variants)

### TanStack Table
- [Guía de inicio](https://tanstack.com/table/v8/docs/guide/introduction)

---

## 💡 Ideas Futuras (Backlog)

1. **Dashboard personalizable**: Drag & drop de widgets
2. **Alertas inteligentes**: Notificaciones cuando stock < 3, ventas caen 20%, etc.
3. **Predicciones con ML**: Forecasting de ventas usando datos históricos
4. **Comparativas automáticas**: "Esta semana vs semana pasada"
5. **Exportación de reportes**: PDF/Excel con gráficos incluidos
6. **Dashboard público**: Vista simplificada para stakeholders externos
7. **Modo oscuro**: Tema oscuro para el admin panel
8. **Métricas en tiempo real**: WebSocket para actualización live
9. **Integración con Google Analytics**: Métricas de tráfico web
10. **Benchmarking**: Comparar métricas con industria (si hay APIs públicas)

---

**Autor:** GitHub Copilot + Análisis de referencias UI/UX  
**Fecha:** 22 de Noviembre, 2025  
**Estado:** ✅ Documento completo - Listo para implementación
