# Guía Visual - Rediseño OrderConfirmationPage

**Fecha:** 21 de noviembre, 2025

---

## 📐 Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│                    ✓ ¡Compra confirmada!                     │
│              Tu pedido #MOA-12345 ha sido recibido           │
│              [Pagado] [Tracking: ABC123...]                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│  📅 Fecha    │  🚚 Entrega  │ 💳 Total     │
│  21/11/2025  │  25/11/2025  │  $45.990     │
└──────────────┴──────────────┴──────────────┘

┌─────────────────────┬─────────────────────────────────────────┐
│                     │                                         │
│  📍 Dirección       │  🛍️  Productos (3)                      │
│  ───────────        │  ─────────────                          │
│  Juan Pérez         │  ┌──────────────────────────────────┐  │
│  • Av. Libertador   │  │ [IMG] Producto 1    $15.990      │  │
│    #123             │  │       Cantidad: 1 • $15.990 c/u  │  │
│  • Santiago Centro  │  └──────────────────────────────────┘  │
│  • Región Metro     │  ┌──────────────────────────────────┐  │
│  ─────              │  │ [IMG] Producto 2    $19.990      │  │
│  📧 juan@mail.cl    │  │       Cantidad: 2 • $9.995 c/u   │  │
│  📱 +56912345678    │  └──────────────────────────────────┘  │
│                     │                                         │
│  💳 Método de Pago  │  📋 Resumen del pedido                  │
│  ───────────        │  ─────────────────                      │
│  💳 WebPay Plus     │  📦 Subtotal         $45.990            │
│  [Aprobado]         │  🚚 Envío            Gratis             │
│                     │  ━━━━━━━━━━━━━━━━━━━━━━━━━━             │
│  🚚 Método Envío    │  Total               $45.990            │
│  ───────────        │                                         │
│  Starken            │  ┌────────────┬────────────┐           │
│                     │  │ 📥 Descargar│ 🛍️  Pedidos│           │
│  📦 Tracking        │  │ comprobante │           │           │
│  ───────────        │  └────────────┴────────────┘           │
│  ABC123456789       │  ┌──────────────────────────┐          │
│  Courier: Starken   │  │   🏠 Volver a inicio     │          │
│  [Ver en tiempo     │  └──────────────────────────┘          │
│   real]             │                                         │
│                     │                                         │
└─────────────────────┴─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ✉️  Confirmación enviada                        │
│    Hemos enviado un correo a juan@mail.cl con todos         │
│    los detalles de tu pedido                                │
│    Si no lo encuentras, revisa spam                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Paleta de Colores

### Estados de Pago
```
✅ Pagado/Aprobado     → Verde (#10B981) - success
⏳ Pendiente           → Amarillo (#F59E0B) - warning  
🔄 Procesando          → Azul (#3B82F6) - info
❌ Cancelado           → Rojo (#EF4444) - danger
```

### Secciones
```
🎯 Primary Actions     → var(--color-primary1)
🔵 Info Cards          → Azul claro #DBEAFE
🟢 Success Icon        → Verde con gradiente
💳 Total Card          → Gradiente Primary1 → Primary2
📦 Tracking Card       → Gradiente Primary2 → Primary1
```

---

## 📱 Breakpoints Responsive

### Mobile (< 640px)
```
┌───────────────────┐
│   ✓ Confirmada    │
│   [Badge Estado]  │
├───────────────────┤
│   📅 Fecha        │
│   21/11/2025      │
├───────────────────┤
│   🚚 Entrega      │
│   25/11/2025      │
├───────────────────┤
│   💳 Total        │
│   $45.990         │
├───────────────────┤
│   📍 Dirección    │
│   [Detalles]      │
├───────────────────┤
│   💳 Pago         │
│   [Método]        │
├───────────────────┤
│   🛍️ Productos     │
│   [Lista]         │
├───────────────────┤
│   📋 Resumen      │
│   [Totales]       │
├───────────────────┤
│   [Botones]       │
│   [Full Width]    │
└───────────────────┘
```

### Tablet (640px - 1024px)
```
┌─────────────────────────────┐
│    ✓ Confirmada + Badges    │
├─────────┬─────────┬─────────┤
│ Fecha   │ Entrega │ Total   │
├─────────┴─────────┴─────────┤
│     📍 Dirección            │
├─────────────────────────────┤
│     💳 Pago y Envío         │
├─────────────────────────────┤
│     🛍️ Productos             │
├─────────────────────────────┤
│     📋 Resumen              │
├──────────┬──────────────────┤
│ Botón 1  │    Botón 2       │
├──────────┴──────────────────┤
│      Botón 3 Full           │
└─────────────────────────────┘
```

### Desktop (> 1024px)
```
┌────────────────────────────────────────┐
│        ✓ Confirmada + Badges           │
├───────┬─────────┬──────────────────────┤
│ Fecha │ Entrega │       Total          │
├───────┴─────────┴──────────────────────┤
│ 1/3 Left        │  2/3 Right           │
│                 │                      │
│ 📍 Dirección     │  🛍️ Productos        │
│ 💳 Pago/Envío   │  📋 Resumen          │
│ 📦 Tracking     │  [Botones Grid 2x2]  │
│                 │                      │
└─────────────────┴──────────────────────┘
```

---

## 🎭 Estados y Animaciones

### Loading State
```
┌──────────────────┐
│    ⏳ Spinner     │
│  Cargando...     │
└──────────────────┘
```

### Error State
```
┌──────────────────────────────┐
│ ⚠️  No se pudo cargar el     │
│     pedido. Intenta          │
│     nuevamente.              │
└──────────────────────────────┘
```

### Success State (Animaciones)
```
1. Success Icon: fade-in + scale (500ms)
2. Quick Cards: slide-in-from-bottom (700ms)
3. Main Grid: fade-in (700ms + 200ms delay)
4. Email Banner: slide-in-from-top (300ms)
```

### Hover Effects
```
✓ Cards: shadow-md → shadow-lg
✓ Productos: border-neutral-200 → border-primary1
✓ Botones: elevación y cambio de color
```

---

## 🔤 Tipografía

### Jerarquía
```
H1 (Título)           → text-3xl md:text-4xl, font-bold
H2 (Secciones)        → text-xl md:text-2xl, font-bold  
H3 (Subsecciones)     → text-lg, font-bold
Body (Regular)        → text-base, font-normal
Small (Labels)        → text-sm, font-medium
XSmall (Secundario)   → text-xs, font-normal
```

### Pesos
```
Bold     → Títulos principales y precios
Semibold → Headers de cards y labels
Medium   → Texto regular importante
Regular  → Texto general
```

### Tracking
```
Tight    → Precios y números grandes
Normal   → Texto regular
Wide     → Labels pequeños (tracking-wide)
Widest   → Badges y pills (tracking-[1.5871px])
```

---

## 📏 Espaciado

### Padding
```
Cards Principales      → p-6
Cards Secundarios      → p-4
Containers            → px-4 md:px-6
Sections              → py-8 md:py-16
```

### Gaps
```
Grid Principal        → gap-6
Grid Botones          → gap-4
Product List          → space-y-3
Summary Lines         → space-y-3
```

### Margin
```
Entre Secciones       → space-y-6
Entre Elements        → space-y-3 o gap-3
Headers               → mb-4 o mb-6
```

---

## 🎯 Componentes Reutilizables

### Badge Component
```jsx
<Badge variant="success">Pagado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="info">Procesando</Badge>
<Badge variant="danger">Cancelado</Badge>
<Badge variant="outline">Tracking: ABC123</Badge>
```

### Button Component
```jsx
// Primary Action
<Button intent="primary" appearance="solid">
  <Download /> Descargar comprobante
</Button>

// Secondary Action  
<Button intent="primary" appearance="outline">
  <ShoppingBag /> Ver mis pedidos
</Button>

// Tertiary Action
<Button intent="neutral" appearance="outline">
  <Home /> Volver a inicio
</Button>
```

### Icon Cards
```jsx
<div className="p-3 rounded-xl bg-(--color-primary1)/10">
  <Icon className="h-6 w-6 text-(--color-primary1)" />
</div>
```

---

## 🔍 Casos de Uso Especiales

### Sin Tracking
```
• Card de tracking no se muestra
• Botón "Ver tracking" deshabilitado
• Se muestra solo estado de envío
```

### Envío Gratis
```
• Línea de envío muestra "Gratis" en verde
• No se muestra monto $0
• Icono Truck en verde
```

### Sin Imagen Producto
```
• Div de imagen no se renderiza
• Texto ocupa todo el ancho
• Sin espacio reservado
```

### Múltiples Items
```
• Lista scrolleable si >5 items
• Cada item con hover effect
• Subtotal actualizado
```

---

## ⚡ Performance

### Optimizaciones
```
✓ useMemo para cálculos de summary
✓ useMemo para fecha estimada
✓ Lazy loading de imágenes
✓ Conditional rendering de secciones
✓ Keys optimizadas en loops
```

### Métricas Objetivo
```
• First Contentful Paint: < 1.5s
• Time to Interactive: < 2.5s
• Largest Contentful Paint: < 2.0s
• Cumulative Layout Shift: < 0.1
```

---

## 🎯 Puntos de Decisión UX

### ¿Por qué 3 columnas en quick info?
→ Información crítica visible sin scroll

### ¿Por qué layout 1:2 en desktop?
→ Dirección compacta, productos destacados

### ¿Por qué tracking en card separada?
→ Acción secundaria pero importante, merece destacarse

### ¿Por qué email banner al final?
→ Confirmación después de revisar detalles

### ¿Por qué 4 botones?
→ Múltiples paths de salida según contexto del usuario

---

## 📋 Checklist de Implementación

### Visual
- [x] Gradientes en cards destacadas
- [x] Iconos contextuales
- [x] Badges de estado
- [x] Hover effects
- [x] Animaciones de entrada
- [x] Responsive breakpoints

### Funcional
- [x] Normalización de datos backend
- [x] Fallbacks para campos opcionales
- [x] Loading states
- [x] Error states
- [x] Navegación a otras páginas

### Accesibilidad
- [x] Contraste de colores adecuado
- [x] Jerarquía de headings
- [x] Texto alternativo en badges
- [x] Estados de focus visibles
- [x] Keyboard navigation

### Performance
- [x] useMemo para cálculos pesados
- [x] Conditional rendering
- [x] Lazy loading de imágenes
- [x] Keys optimizadas

---

**Última actualización:** 21 de noviembre, 2025
