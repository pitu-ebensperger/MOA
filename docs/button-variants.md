# Inventario y variantes de botones

Este inventario identifica los botones que ya existen en el frontend y las clases que los definen para poder agruparlos en variantes reutilizables.

## 1. Estilos base compartidos

- El archivo `frontend/src/styles/components/buttons.css:2` define `.btn` como una capa base con display inline-flex, gap, sombreado y transición, y exporta helpers (`.btn-block`, `.btn-sm`/`.btn-md`/`.btn-lg`, `.btn-circle`, `.btn-rounded`) que el componente `Button` reutiliza.
- Las variantes principales (`.btn-primary`, `.btn-secondary`, `.btn-ghost` y `.btn-link`) salen de `frontend/src/styles/components/buttons.css:35`, `frontend/src/styles/components/buttons.css:43`, `frontend/src/styles/components/buttons.css:49` y `frontend/src/styles/components/buttons.css:55` respectivamente; todas gestionan fondo, color y estados hover con la misma paleta.
- `.btn-icon`, `.is-loading` y `.btn-spinner` (desde `frontend/src/styles/components/buttons.css:76`, `frontend/src/styles/components/buttons.css:82` y `frontend/src/styles/components/buttons.css:86`) permiten iconos acompañantes y estados de carga.
- El CSS global define los botones del navbar (`.nav-btn`/`.nav-btn-primary` comienza en `frontend/src/styles/global.css:111`) y los envoltorios de iconos (`.nav-icon-bg` y `.nav-icon` desde `frontend/src/styles/global.css:135` y `frontend/src/styles/global.css:143`). Las reglas del slider también están en `frontend/src/styles/global.css:174` (`.slider-handle` y su focus).

## 2. Variantes actuales del componente `Button`

- `Button` construye los helpers de `buttons.css` y agrega banderas de tamaño, ancho completo y carga (`frontend/src/components/ui/Button.jsx:6`).  
- `primary`: clase `btn-primary` que recurre al color principal con el radius por defecto y se usa en CTAs como los formularios de contacto (`frontend/src/modules/support/pages/ContactPage.jsx:80`).  
- `primary-round`: combina `.btn-primary` con `.btn-primary-round` para crear un CTA pill/ovalado; Login utiliza esta variante (`frontend/src/modules/auth/pages/LoginPage.jsx:103`).  
  - El botón de login además usa la clase `font-regular` para mantener el peso de texto uniforme (`frontend/src/modules/auth/pages/LoginPage.jsx:103`).
- `secondary`: se invoca explícitamente para el botón "Limpiar" del dashboard de productos (`frontend/src/modules/admin/pages/products/NewProductPage.jsx:103`).  
- Variante por defecto (sin `variant`) se emplea en el mismo formulario para "Guardar producto" (`frontend/src/modules/admin/pages/products/NewProductPage.jsx:106`).

## 3. Patrones ad-hoc por sección

### 3.1 Navbar y toggles

- Los botones de autenticación usan `.nav-btn`/`.nav-btn-primary` (`frontend/src/components/layout/Navbar.jsx:107`) y se replican dentro del bloque móvil (`frontend/src/components/layout/Navbar.jsx:205`).  
- Los íconos circulares con `.nav-icon-bg` y `.nav-icon` sirven para la acción de perfil, carrito, búsqueda y menú (`frontend/src/components/layout/Navbar.jsx:133` y `frontend/src/components/layout/Navbar.jsx:170`), con el hover/active definido en `frontend/src/styles/global.css:135`.

### 3.2 Hero y CTA

- La sección hero temprana expone dos botones con clases `rounded-md` y fondos en variables (`frontend/src/components/layout/TODOHeroSection.jsx:19`), uno sólido y otro outline blanco, que serían buenos candidatos para mapear a `btn-primary` y una variante de ghost/outline.

### 3.3 Formularios y CTAs de sesión

- El llamado de registro utiliza un botón lleno marrón con bordes redondeados y efectos de elevación (`frontend/src/modules/auth/pages/RegisterPage.jsx:182`) y un botón link subrayado para regresar al login (`frontend/src/modules/auth/pages/RegisterPage.jsx:197`).
- Las páginas de "Olvidé mi contraseña" y "Restablecer contraseña" comparten la misma clase marrón (`frontend/src/modules/auth/pages/ForgotPasswordPage.jsx:66` y `frontend/src/modules/auth/pages/ResetPasswordPage.jsx:93`), perfectas para un `btn-primary` con estados disabled/hover.
- El formulario de contacto en la landing también usa un CTA similar con `bg-primary1` y `rounded-full` (`frontend/src/modules/home/components/ContactSection.jsx:50`).
- La tarjeta de perfil presenta un botón secundario en overlay (`frontend/src/modules/profile/components/Card.jsx:26`).
- ContactPage reutiliza `Button` con clases personalizadas (`frontend/src/modules/support/pages/ContactPage.jsx:80`), mientras que NotFound ofrece un CTA oscuro con sombra (`frontend/src/modules/support/pages/NotFoundPage.jsx:15`).

### 3.4 Productos, filtros y navegación interna

- Los botones de filtro móvil, los chips de filtros activos y las tarjetas de categorías emplean bordes redondeados y sombras (`frontend/src/modules/products/pages/ProductsPage.jsx:89`, `frontend/src/modules/products/pages/ProductsPage.jsx:100`, `frontend/src/modules/home/components/CategoriesMenu.jsx:77`).  
- Los paneles laterales y el drawer de filtros repiten chips blancos con borde (`frontend/src/modules/products/components/ProductSidebar.jsx:18`, `frontend/src/modules/products/components/ProductFiltersDrawer.jsx:71`) y acciones de limpieza/mostrar (`frontend/src/modules/products/components/ProductFiltersDrawer.jsx:83`, `frontend/src/modules/products/components/ProductFiltersDrawer.jsx:90`).  
- Las pestañas de categoría en `ProductFiltersContent` se comportan como botones con estado activo (`frontend/src/modules/products/components/ProductFiltersContent.jsx:66`).  
- Las tarjetas de producto contienen tres botones: favorito (`frontend/src/modules/products/components/ProductCard.jsx:128`), "Agregar" (`frontend/src/modules/products/components/ProductCard.jsx:155`) y "Ver detalles" (`frontend/src/modules/products/components/ProductCard.jsx:171`), todos con radio pequeño y transiciones.  
- La página de detalle mezcla controles de cantidad y un CTA de “Agregar al carrito” con borde redondeado (`frontend/src/modules/products/pages/ProductDetailPage.jsx:280` y `frontend/src/modules/products/pages/ProductDetailPage.jsx:300`).  
- Los handles del slider usan botones circulares (`frontend/src/modules/products/components/DoubleRangeSlider.jsx:126`) y se apoyan en `.slider-handle` para focus y arrastre.

### 3.5 Utilidades

- El buscador fullscreen tiene un botón traslúcido para cerrar y otro submit redondo (`frontend/src/components/ui/SearchBar.jsx:55` y `frontend/src/components/ui/SearchBar.jsx:75`).  
- La paginación renderiza botones circulares con hover y estados disabled (`frontend/src/components/ui/Pagination.jsx:54`).  
- El acordeón usa un botón de ancho completo que solo se estiliza como texto con icono (`frontend/src/components/ui/Accordion.jsx:9`).  
- En el checkout, el icono de basura y el botón “Pagar” siguen el patrón de microbotones (`frontend/src/modules/cart/pages/CheckoutPage.jsx:64` y `frontend/src/modules/cart/pages/CheckoutPage.jsx:88`).

## 4. Propuesta de variantes consolidadas

1. `primary`: reuse `.btn-primary` con las clases de tamaño (`btn-sm/md/lg`) para CTAs grandes; usa `primary-round` cuando el botón debe lucir pill (login) y `primary` normal cuando solo necesita color sólido.  
2. `secondary`/`outline`: botón blanco con borde para filtros y tarjetas ligeras (`ProductFiltersDrawer`, `ProductCard`, `ProductsPage`).  
3. `ghost/link`: para textos enlazados (footer del register y los toggles del accordion).  
4. `chip`/`pill`: botones redondeados usados en categorías/filtros (`CategoriesMenu`, `ProductFiltersContent`, chips de filtros).  
5. `nav`: `.nav-btn`/`.nav-btn-primary` para acciones de navbar y menús móviles (`Navbar`).  
6. `icon`: botón circular del buscador y toggles (`SearchBar`, `Pagination`, `DoubleRangeSlider`) con tamaño fijo.  
7. `support`: botones con sombras y colores propios (`NotFoundPage`, `Profile Card`).  

## 5. Próximos pasos

- Decidir qué variantes se expondrán desde `Button.jsx` (por ejemplo `chip`, `outline` y `icon`) y aplicar clases ya presentes en `buttons.css`.  
- Reemplazar los componentes de filtro/producto con `Button` cuando el markup coincida y reducir los estilos inline duplicados.  
- Confirmar que los estilos exportados por `buttons.css` siguen siendo suficientes o extenderlos (por ejemplo, sumando `.btn-chip`, `.btn-outline`, `.btn-nav`) para evitar nuevas combinaciones dispersas.
