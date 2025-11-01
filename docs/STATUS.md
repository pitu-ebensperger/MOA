# 🗂️ Estado de archivos (Frontend)

**Leyenda** 
ESTADO = 🟥 Pendiente / 🟨 En Proceso / 🟦 Listo /  ✅ Revisado / ⚠️ Corregir / ⬛ Cerrado

--------------------------------------------------------------------------------------------------
## App (src/app)
- 🟥 src/app/App.jsx 
- 🟥 src/app/main.jsx 

----------------------------------
## Components (src/components)

### Data-display
- 🟥 [src/components/data-display/Price.jsx](../src/components/data-display/Price.jsx) 
- 🟥 [src/components/data-display/ProductCard.jsx](../src/components/data-display/ProductCard.jsx) 

### Feedback
- 🟥 [src/components/feedback/EmptyState.jsx](../src/components/feedback/EmptyState.jsx) 
- 🟥 [src/components/feedback/Toast.jsx](../src/components/feedback/Toast.jsx) 

### Forms
- 🟥 [src/components/forms/QuantitySelector.jsx](../src/components/forms/QuantitySelector.jsx) 
- 🟥 [src/components/forms/SearchBar.jsx](../src/components/forms/SearchBar.jsx) 

### Layout
- 🟥 [src/components/layout/Breadcrumbs.jsx](../src/components/layout/Breadcrumbs.jsx) 
- 🟥 [src/components/layout/Container.jsx](../src/components/layout/Container.jsx) 
- 🟥 [src/components/layout/Footer.jsx](../src/components/layout/Footer.jsx) 
- 🟥 [src/components/layout/Header.jsx](../src/components/layout/Header.jsx) 
- 🟥 [src/components/layout/Navbar.jsx](../src/components/layout/Navbar.jsx) 

### UI
- 🟥 [src/components/ui/Badge.jsx](../src/components/ui/Badge.jsx) 
- 🟥 [src/components/ui/Button.jsx](../src/components/ui/Button.jsx) 
- 🟥 [src/components/ui/DropdownMenu.jsx](../src/components/ui/DropdownMenu.jsx) 
- 🟥 [src/components/ui/Input.jsx](../src/components/ui/Input.jsx) 
- 🟥 [src/components/ui/Modal.jsx](../src/components/ui/Modal.jsx) 
- 🟥 [src/components/ui/Pagination.jsx](../src/components/ui/Pagination.jsx) 
- 🟥 [src/components/ui/Select.jsx](../src/components/ui/Select.jsx) 
- 🟥 [src/components/ui/Tooltip.jsx](../src/components/ui/Tooltip.jsx) 

----------------------------------
## Config (src/config)
- 🟥 src/config/constant.js 

----------------------------------
## Context (src/context)
- 🟥 [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) 
- 🟥 [src/context/cartContext.jsx](../src/context/cartContext.jsx) 

----------------------------------
## Hooks (src/hooks)
### state
- 🟥 src/hooks/state/useCart.js  //Carrito
- 🟥 src/hooks/state/useCategories.js  //Filtros, navegación por categorías
- 🟥 src/hooks/state/useOrders.js  //Crear y consultar órdenes
- 🟥 src/hooks/state/useProducts.js  //Listado y detalle de productos
- 🟥 src/hooks/state/useUser.js  //Perfil del usuario
- 🟥 src/hooks/state/useWishlist.js  //Carga/agrega/etc favoritos
### ui
- 🟥 src/hooks/ui/useInput.js 
- 🟥 src/hooks/ui/useModal.js 
- 🟥 src/hooks/ui/usePagination.js 
### utils
- 🟥 src/hooks/utils/useDebounce.js 
- 🟥 src/hooks/utils/useInput.js 

----------------------------------
## Modules (src/modules)

### Home 
- 🟥 [src/modules/home/pages/HomePage.jsx](../src/modules/home/pages/HomePage.jsx) 
#### components
- 🟥 [src/modules/home/components/CategoriesFilters.jsx](../src/modules/home/components/CategoriesFilters.jsx) 
- 🟥 [src/modules/home/components/ContactSection.jsx](../src/modules/home/components/ContactSection.jsx) 
- 🟥 [src/modules/home/components/HeroSection.jsx](../src/modules/home/components/HeroSection.jsx) 
- 🟥 [src/modules/home/components/ProductsSection.jsx](../src/modules/home/components/ProductsSection.jsx) 

### Products
#### pages
- 🟥 [src/modules/products/pages/ProductsPage.jsx](../src/modules/products/pages/ProductsPage.jsx) 
- 🟥 [src/modules/products/pages/ProductCategoryPage.jsx](../src/modules/products/pages/ProductCategoryPage.jsx) 
- 🟥 [src/modules/products/pages/ProductDetailPage.jsx](../src/modules/products/pages/ProductDetailPage.jsx) 
#### components
- 🟥 [src/modules/products/components/CategoryFilter.jsx](../src/modules/products/components/CategoryFilter.jsx) 
- 🟥 [src/modules/products/components/ProductFilters.jsx](../src/modules/products/components/ProductFilters.jsx) 
- 🟥 [src/modules/products/components/ProductGallery.jsx](../src/modules/products/components/ProductGallery.jsx) 
- 🟥 [src/modules/products/components/QuickViewModal.jsx](../src/modules/products/components/QuickViewModal.jsx) 

### Cart
#### pages
- 🟥 [src/modules/cart/pages/CartPage.jsx](../src/modules/cart/pages/CartPage.jsx) 
- 🟥 [src/modules/cart/pages/CheckoutPage.jsx](../src/modules/cart/pages/CheckoutPage.jsx) 
#### components
- 🟥 [src/modules/cart/components/AddToCartButton.jsx](../src/modules/cart/components/AddToCartButton.jsx) 
- 🟥 [src/modules/cart/components/CartDrawer.jsx](../src/modules/cart/components/CartDrawer.jsx) 

### Auth
#### pages
- 🟥 [src/modules/auth/pages/LoginPage.jsx](../src/modules/auth/pages/LoginPage.jsx) 
- 🟥 [src/modules/auth/pages/RegisterPage.jsx](../src/modules/auth/pages/RegisterPage.jsx) 
- 🟥 [src/modules/auth/pages/ForgotPasswordPage.jsx](../src/modules/auth/pages/ForgotPasswordPage.jsx) 
- 🟥 [src/modules/auth/pages/ResetPasswordPage.jsx](../src/modules/auth/pages/ResetPasswordPage.jsx) 
#### hook
- 🟥 [src/modules/auth/hook/useAuth.js](../src/modules/auth/hook/useAuth.js)  //Maneja sesión (login, logout, isAuth, user)
#### context
- 🟥 [src/modules/auth/context/AuthAccess.js](../src/modules/auth/context/AuthAccess.js) 
#### services
- 🟥 [src/modules/auth/services/auth.api.js](../src/modules/auth/services/auth.api.js) 

### Profile
- 🟥 [src/modules/profile/pages/ProfilePage.jsx](../src/modules/profile/pages/ProfilePage.jsx) 
- 🟥 [src/modules/profile/pages/OrdersPage.jsx](../src/modules/profile/pages/OrdersPage.jsx) 
- 🟥 [src/modules/profile/pages/OrderDetailPage.jsx](../src/modules/profile/pages/OrderDetailPage.jsx) 
- 🟥 [src/modules/profile/pages/WishlistPage.jsx](../src/modules/profile/pages/WishlistPage.jsx) 

### Admin
- 🟥 [src/modules/admin/pages/AdminDashboardPage.jsx](../src/modules/admin/pages/AdminDashboardPage.jsx) 

### Support/
- 🟥 [src/modules/support/pages/ContactPage.jsx](../src/modules/support/pages/ContactPage.jsx) 
- 🟥 [src/modules/support/pages/FAQPage.jsx](../src/modules/support/pages/FAQPage.jsx) 
- 🟥 [src/modules/support/pages/NotFoundPage.jsx](../src/modules/support/pages/NotFoundPage.jsx) 
- 🟥 [src/modules/support/pages/PrivacyPage.jsx](../src/modules/support/pages/PrivacyPage.jsx) 
- 🟥 [src/modules/support/pages/TermsPage.jsx](../src/modules/support/pages/TermsPage.jsx)

### Others/ 
- 🟥 src/pages/search/SearchResultsPage.jsx 

----------------------------------
## Routes (src/routes)
- 🟥 src/routes/auth.route.js 
- 🟥 src/routes/checkout.route.js 

----------------------------------
## Services (src/services)
- 🟨 src/services/api.js [ Pitu ]

----------------------------------
## Styles (src/styles)
- 🟨 [src/styles/global.css](../src/styles/global.css) 
- 🟥 [src/styles/tokens.css](../src/styles/tokens.css) 

----------------------------------
## Utils (src/utils)
- 🟦 src/utils/currency.js [ Pitu ]
- 🟦 src/utils/date.js [ Pitu ]
- 🟦 src/utils/validators.js [ Pitu ]

----------------------------------
## Public (public)
- 🟥 [public/favicon.ico](../public/favicon.ico) 


--------------------------------------------------------------------------------------------------
## Potenciales
### App (src/app)
- 🟥 src/app/routes.jsx  //Potencial

### Components/Layout (src/components/layout)
- 🟥 src/components/layout/Hero.jsx  //Potencial

### Components/UI (src/components/ui)
- 🟥 src/components/ui/Checkbox.jsx  //Potencial
- 🟥 [src/components/ui/Icon.jsx](../src/components/ui/Icon.jsx)  //Potencial
- 🟥 src/components/ui/Loader.jsx  //Potencial
- 🟥 src/components/ui/Popover.jsx  //Potencial
- 🟥 src/components/ui/Skeleton.jsx  //Potencial
- 🟥 src/components/ui/Switch.jsx  //Potencial
- 🟥 src/components/ui/Tabs.jsx  //Potencial

### Components/Data-Display (src/components/data-display)
- 🟥 src/components/data-display/ProductGrid.jsx  //Potencial
- 🟥 [src/components/data-display/ProductSkeleton.jsx](../src/components/data-display/ProductSkeleton.jsx)  //Potencial
- 🟥 src/components/data-display/Rating.jsx  //Potencial

### Cart (src/modules/cart)
- 🟥 src/modules/cart/components/CartSummary.jsx  //Potencial

### src/pages
#### home
- 🟥 src/pages/home/HomePage.jsx [ ? ]
#### products
- 🟥 src/pages/products/productsPage.jsx [ ? ]
- 🟥 src/pages/products/ProductDetailPage.jsx [ ? ]
- 🟥 src/pages/products/ProductCategoryPage.jsx [ ? ]
#### cart
- 🟥 src/pages/cart/CartPage.jsx [ ? ]
- 🟥 src/pages/cart/CheckoutPage.jsx [ ? ]
#### auth
- 🟥 src/pages/auth/LoginPage.jsx [ ? ]
- 🟥 src/pages/auth/RegisterPage.jsx [ ? ]
- 🟥 src/pages/auth/*/ForgotPasswordPage.jsx [ ? ]
- 🟥 src/pages/auth/*/ResetPasswordPage.jsx [ ? ]
#### profile
- 🟥 src/pages/profile/ProfilePage.jsx [ ? ]
- 🟥 src/pages/profile/OrdersPage.jsx [ ? ]
- 🟥 src/pages/profile/OrderDetailPage.jsx [ ? ]
- 🟥 src/pages/profile/WishlistPage.jsx [ ? ]
#### admin
- 🟥 src/pages/admin/AdminDashboardPage.jsx [ ? ]
- 🟥 src/pages/admin/products/productsAdminPage.jsx [ ? ]
- 🟥 src/pages/admin/products/NewProductPage.jsx [ ? ]
- 🟥 src/pages/admin/orders/OrdersListPage.jsx [ ? ]
- 🟥 src/pages/admin/orders/OrdersDetailPage.jsx [ ? ]
#### otros
- 🟥 src/pages/search/SearchResuljsPage.jsx [ ? ]
- 🟥 src/pages/ErrorPage.jsx [ ? ]
- 🟥 src/pages/support/PrivacyPage.jsx [ ? ]
- 🟥 src/pages/support/TermsPage.jsx [ ? ]
- 🟥 src/pages/support/ContactPage.jsx [ ? ]

### src/components/layout
- 🟥 src/components/layout/Hero.jsx [ ? ]

### src/components/ui
- 🟥 src/components/ui/Checkbox.jsx [ ? ]
- 🟥 [src/components/ui/Icon.jsx](../src/components/ui/Icon.jsx) [ ? ]
- 🟥 src/components/ui/Loader.jsx [ ? ]
- 🟥 src/components/ui/Popover.jsx [ ? ]
- 🟥 src/components/ui/Skeleton.jsx [ ? ]
- 🟥 src/components/ui/Switch.jsx [ ? ]
- 🟥 src/components/ui/Tabs.jsx [ ? ]

### src/components/data-display
- 🟥 src/components/data-display/ProductGrid.jsx [ ? ]
- 🟥 [src/components/data-display/ProductSkeleton.jsx](../src/components/data-display/ProductSkeleton.jsx) [ ? ]
- 🟥 src/components/data-display/Rating.jsx [ ? ]

### src/modules/cart
- 🟥 src/modules/cart/components/CartSummary.jsx [ ? ]

### src/context
- 🟥 src/context/UIContext.jsx [ ? ]

### src/config
- 🟥 src/config/constant.js [ ? ]

### src/services/http
- 🟥 src/services/http/client.js [ ? ]
- 🟥 src/services/http/interceptors.js [ ? ]

### src/services/repositories
- 🟥 src/services/repositories/auth.repo.js [ ? ]
- 🟥 src/services/repositories/cart.repo.js [ ? ]
- 🟥 src/services/repositories/categories.repo.js [ ? ]
- 🟥 src/services/repositories/orders.repo.js [ ? ]
- 🟥 src/services/repositories/products.repo.js [ ? ]

### src/hooks/state
- 🟥 src/hooks/state/useAuth.js [ ? ] //Maneja sesión (login, logout, isAuth, user)

### src/hooks/ui
- 🟥 src/hooks/ui/useDocumentTitle.js [ ? ]
- 🟥 src/hooks/ui/useIntersectionObserver.js [ ? ]
- 🟥 src/hooks/ui/useOnClickOutside.js [ ? ]

### src/hooks/utils
- 🟥 src/hooks/utils/useEventListener.js [ ? ]
- 🟥 src/hooks/utils/useLocalStorage.js [ ? ]
- 🟥 src/hooks/utils/usePrevious.js [ ? ]
- 🟥 src/hooks/utils/useSessionStorage.js [ ? ]

### src/assets
- 🟥 src/assets/icons/ [ ? ]
- 🟥 src/assets/images/ [ ? ]
- 🟥 src/assets/fonts/ [ ? ]
