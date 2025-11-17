# Rediseño del Perfil - MOA

## 🎨 Resumen

Se ha rediseñado completamente la página de perfil de usuario con un diseño moderno inspirado en shadcn/ui pero adaptado al sistema de tokens y estilo visual de MOA.

## ✨ Características Principales

### 1. **Hero Section con Avatar**
- Gradiente de fondo usando colores MOA (`--color-light-beige` → `--color-beige`)
- Avatar circular con inicial del usuario
- Información personal destacada (nombre, email)
- Diseño responsive (ajusta en móvil y desktop)

### 2. **Navegación por Tabs Mejorada**
- Pills horizontales con bordes redondeados
- Estado activo con color primario (`--color-primary1`)
- Hover suave con color beige claro
- Scroll horizontal en móvil con scrollbar personalizado
- Iconos para cada sección

### 3. **Cards Consistentes**
- Fondo blanco con borde sutil
- Sombras suaves (`--shadow-sm`)
- Bordes redondeados (rounded-xl)
- Header con título en tipografía display (`Cormorant`)
- Padding consistente (px-6 lg:px-8, py-6)

### 4. **Tabs Individuales**

#### Mi Perfil (UserInfoTab)
- Formulario editable con modo vista/edición
- Botones redondeados con colores MOA
- Estados de loading y éxito
- Grid responsivo para campos (2 columnas en desktop)

#### Mis Pedidos (OrdersTab)
- Cards de pedido con avatar de icono
- Badges de estado con colores personalizados:
  - Pendiente: Amarillo/Warning
  - Procesando: Azul/Primary1
  - Enviado: Púrpura/Primary3
  - Entregado: Verde/Success
  - Cancelado: Rojo/Error
- Formato de precio y fecha en español
- Empty state con call-to-action

#### Lista de Deseos (WishlistTab)
- Grid responsivo (2/3/4 columnas)
- Cards de producto con hover efecto
- Botón de eliminar en esquina superior
- Botones de acción (Ver, Agregar al carrito)
- Imagen con zoom en hover

#### Direcciones (AddressesTab)
- Wrapper consistente para AddressesSection existente
- Mismo estilo de header que otros tabs

## 🎨 Sistema de Colores Aplicado

```css
/* Backgrounds */
--color-neutral1: #FAF8F5  /* Fondo principal */
--color-white: #fff         /* Cards */
--color-light-beige: #f6efe7 /* Hover states, avatars */

/* Borders */
--color-border: #E5DDD1     /* Bordes sutiles */

/* Text */
--color-primary2: #52443A   /* Títulos principales */
--color-text: #52443A       /* Texto general */
--color-text-secondary: #9B8F82 /* Texto secundario */

/* Interactive */
--color-primary1: #6B5444   /* Botones, tabs activas */
--color-success: #7A8B6F    /* Success messages */
--color-error: #B8836B      /* Error messages */
--color-warning: #B8956A    /* Warning messages */
```

## 🏗️ Estructura de Archivos

```
frontend/src/modules/profile/
├── pages/
│   └── ProfilePage.jsx              # Layout principal con hero y tabs
├── components/
│   └── tabs/
│       ├── UserInfoTab.jsx          # Información personal editable
│       ├── OrdersTab.jsx            # Historial de pedidos
│       ├── WishlistTab.jsx          # Lista de deseos
│       └── AddressesTab.jsx         # Direcciones de envío
└── styles/
    └── ProfilePage.css              # Estilos personalizados (tabs, animaciones)
```

## 📱 Responsive Design

- **Mobile (< 640px)**: 
  - Avatar más pequeño (w-20 h-20)
  - Tabs con scroll horizontal
  - Grid de wishlist: 2 columnas
  - Padding reducido

- **Tablet (640px - 1024px)**:
  - Avatar mediano (w-20 h-20)
  - Grid de wishlist: 3 columnas
  - Padding estándar

- **Desktop (> 1024px)**:
  - Avatar grande (w-24 h-24)
  - Grid de wishlist: 4 columnas
  - Padding amplio (lg:px-8)

## 🎭 Animaciones y Transiciones

- **Tabs**: Transición suave de color y background (transition-all)
- **Cards**: Hover con shadow-md y transform
- **Product Images**: Zoom en hover (scale-105)
- **Loading States**: Spinner animado con color primario
- **Empty States**: Iconos con animación float
- **Alerts**: Slide in animation para mensajes

## 🔧 Componentes Reutilizables

### Button Variants Usados:
- **Primary**: `backgroundColor: var(--color-primary1)`, `color: white`
- **Outline**: `borderColor: var(--color-border)`, `color: var(--color-primary1)`
- **Ghost**: Transparent con hover sutil

### Tipografías:
- **Display** (`Cormorant`): Títulos principales de secciones
- **Sans** (`Plus Jakarta Sans`): Todo el resto del texto

## 🚀 Mejoras Futuras

1. [ ] Implementar skeleton loaders en lugar de spinners
2. [ ] Añadir transiciones de página entre tabs
3. [ ] Implementar ruta de detalle de pedido
4. [ ] Optimizar imágenes con lazy loading
5. [ ] Añadir drag & drop para ordenar direcciones
6. [ ] Implementar infinite scroll en pedidos antiguos
7. [ ] Añadir filtros para historial de pedidos
8. [ ] Toast notifications en lugar de alerts

## 📝 Notas de Implementación

- Todos los estilos inline usan CSS custom properties (tokens)
- No se usó Tailwind para colores; se prefirió tokens MOA
- Los componentes de shadcn/ui se mantuvieron pero con estilos personalizados
- Se removió dependencia de CardContent, CardHeader de shadcn en algunos casos
- CSS personalizado en ProfilePage.css para estados avanzados

## 🐛 Warnings Pendientes

- React Hook useEffect tiene dependencias faltantes en:
  - UserInfoTab.jsx (loadUserData)
  - OrdersTab.jsx (loadOrders)
  - WishlistTab.jsx (loadWishlist)
  
  → No crítico pero debería agregarse useCallback para resolverlo.

## ✅ Testing Checklist

- [x] Build exitoso sin errores
- [ ] Verificar en navegador:
  - [ ] Cambio de tabs funciona
  - [ ] Hero section muestra info correcta
  - [ ] Modo edición en Mi Perfil
  - [ ] Wishlist carga productos
  - [ ] Cards de pedidos muestran badges correctos
  - [ ] Responsive en móvil
  - [ ] Hover effects funcionan
  - [ ] Loading states aparecen correctamente
  - [ ] Empty states con CTAs funcionan

---

**Última actualización**: 2025-11-17  
**Desarrollador**: GitHub Copilot  
**Estilo**: MOA Design System
