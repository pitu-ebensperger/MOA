# 🗂️ Estado de archivos (Frontend)

**Leyenda** 
ESTADO = 🟥 Pendiente / 🟨 En Proceso / 🟦 Listo /  ✅ Revisado / ⚠️ Corregir / ⬛ Cerrado
[ ? ] = Quien lo está viendo
//blabla = Comentarios


## App
- 🟥 src/app/App.jsx [ ? ]
- 🟥 src/app/main.jsx [ ? ]
- 🟥 src/app/routes.jsx [ ? ]

## Pages

### pages/home
- 🟥 src/pages/home/HomePage.jsx [ ? ]
### pages/products
- 🟥 src/pages/products/productsPage.jsx [ ? ]
- 🟥 src/pages/products/ProductDetailPage.jsx [ ? ]
- 🟥 src/pages/products/ProductCategoryPage.jsx [ ? ]
### pages/cart
- 🟥 src/pages/cart/CartPage.jsx [ ? ]
- 🟥 src/pages/cart/CheckoutPage.jsx [ ? ]
### pages/auth
- 🟥 src/pages/auth/LoginPage.jsx [ ? ]
- 🟥 src/pages/auth/RegisterPage.jsx [ ? ]
- 🟥 src/pages/auth/*/ForgotPasswordPage.jsx [ ? ]
- 🟥 src/pages/auth/*/ResetPasswordPage.jsx [ ? ]
### pages/profile
- 🟥 src/pages/profile/ProfilePage.jsx [ ? ]
- 🟥 src/pages/profile/OrdersPage.jsx [ ? ]
- 🟥 src/pages/profile/OrderDetailPage.jsx [ ? ]
- 🟥 src/pages/profile/WishlistPage.jsx [ ? ]
### pages/admin
- 🟥 src/pages/admin/AdminDashboardPage.jsx [ ? ]
- 🟥 src/pages/admin/products/productsAdminPage.jsx [ ? ]
- 🟥 src/pages/admin/products/NewProductPage.jsx [ ? ]
- 🟥 src/pages/admin/orders/OrdersListPage.jsx [ ? ]
- 🟥 src/pages/admin/orders/OrdersDetailPage.jsx [ ? ]
### pages/...
- 🟥 src/pages/search/SearchResuljsPage.jsx [ ? ]
- 🟥 src/pages/ErrorPage.jsx [ ? ]
- 🟥 src/pages/support/PrivacyPage.jsx [ ? ]
- 🟥 src/pages/support/TermsPage.jsx [ ? ]
- 🟥 src/pages/support/ContactPage.jsx [ ? ]

## Components

### components/ui
- 🟥 src/components/ui/Badge.jsx [ ? ]
- 🟥 src/components/ui/Button.jsx [ ? ]
- 🟥 src/components/ui/DropdownMenu.jsx [ ? ]
- 🟥 src/components/ui/Input.jsx [ ? ]
- 🟥 src/components/ui/Modal.jsx [ ? ]
- 🟥 src/components/ui/Pagination.jsx [ ? ]
- 🟥 src/components/ui/Select.jsx [ ? ]
- 🟥 src/components/ui/Tooltip.jsx [ ? ]
### components/layout
- 🟥 src/components/layout/Breadcrumbs.jsx [ ? ]
- 🟥 src/components/layout/Container.jsx [ ? ]
- 🟥 src/components/layout/Footer.jsx [ ? ]
- 🟥 src/components/layout/Hero.jsx [ ? ]
- 🟥 src/components/layout/Navbar.jsx [ ? ]
### components/data-display
- 🟥 src/components/data-display/Price.jsx [ ? ]
- 🟥 src/components/data-display/ProductCard.jsx [ ? ]
### components/forms
- 🟥 src/components/forms/QuantitySelector.jsx [ ? ]
- 🟥 src/components/forms/SearchBar.jsx [ ? ]
### components/feedback
- 🟥 src/components/feedback/EmptyState.jsx [ ? ]
- 🟥 src/components/feedback/Toast.jsx [ ? ]
### components/features
- 🟥 src/features/cart/AddToCartButton.jsx [ ? ]
- 🟥 src/features/cart/CartDrawer.jsx [ ? ]
- 🟥 src/features/products/CategoryFilters.jsx [ ? ]
- 🟥 src/features/products/ProductFilters.jsx [ ? ]
- 🟥 src/features/products/ProductGallery.jsx [ ? ]
- 🟥 src/features/products/QuickViewModal.jsx [ ? ]

## Hooks

### hooks/state
- 🟥 src/hooks/useAuth.js [ ? ] //Maneja sesión (login, logout, isAuth, user)
- 🟥 src/hooks/useCart.js [ ? ] //Carrito
- 🟥 src/hooks/useCategories.js [ ? ] //Filtros, navegación por categorías
- 🟥 src/hooks/useOrders.js //Crear y consultar órdenes
- 🟥 src/hooks/useProducts.js [ ? ] //Listado y detalle de productos
- 🟥 src/hooks/useUser.js [ ? ] //Perfil del usuario
- 🟥 src/hooks/useWishlist.js [ ? ] //Carga/agrega/etc favoritos
### hooks/ui    
- 🟥 src/hooks/useInput.js [ ? ]
- 🟥 src/hooks/useModal.js [ ? ]
- 🟥 src/hooks/usePagination.js [ ? ]
### hooks/utils  
- 🟥 src/hooks/useDebounce.js [ ? ]


## Routes
- 🟥 src/routes/auth.route.js [ ? ]
- 🟥 src/routes/checkout.route.js [ ? ]

## Context
- 🟥 src/context/AuthContext.jsx [ ? ]
- 🟥 src/context/CartContext.jsx [ ? ]
- 🟥 src/context/UIContext.jsx [ ? ]

# Config
- 🟥 src/config/constant.js 

### Services
- 🟨 src/services/api.js [ Pitu ]

### Utils
- 🟦 src/utils/currency.js [ Pitu ]
- 🟦 src/utils/date.js [ Pitu ]
- 🟦 src/utils/validators [ Pitu ]


## Styles
- 🟥 src/styles/globals.css [ ? ]
- 🟥 src/styles/tokens.css [ ? ]

## Assets
- 🟥 src/assets/icons/ [ ? ]
- 🟥 src/assets/images/ [ ? ]
- 🟥 src/assets/fonts/ [ ? ]

### Public
- 🟥 public/favicon.ico [ ? ]






//EXTRAS?
- 🟥 src/components/ui/Checkbox.jsx [ ? ]
- 🟥 src/components/ui/Switch.jsx [ ? ]
- 🟥 src/components/ui/Tabs.jsx [ ? ]
- 🟥 src/components/ui/Icon.jsx [ ? ]
- 🟥 src/components/ui/Popover.jsx [ ? ]
- 🟥 src/components/ui/Skeleton.jsx [ ? ]
- 🟥 src/components/ui/Loader.jsx [ ? ]

- 🟥 src/components/data-display/ProductSkeleton.jsx [ ? ]
- 🟥 src/components/data-display/ProductGrid.jsx [ ? ]
- 🟥 src/components/data-display/Rating.jsx [ ? ]

- 🟥 src/features/cart/Cartsummary.jsx [ ? ]

- 🟥 src/services/http/client.js [ ? ]
- 🟥 src/services/http/interceptors.js [ ? ]
- 🟥 src/services/repositories/auth.repo.js [ ? ]
- 🟥 src/services/repositories/products.repo.js [ ? ]
- 🟥 src/services/repositories/categories.repo.js [ ? ]
- 🟥 src/services/repositories/cart.repo.js [ ? ]
- 🟥 src/services/repositories/orders.repo.js [ ? ]


hooks/ui
      useOnClickOutside.js
      useIntersectionObserver.js
      useDocumentTitle.js
hooks/utils  
      useLocalStorage.js
      useSessionStorage.js
      useEventListener.js
      usePrevious.js