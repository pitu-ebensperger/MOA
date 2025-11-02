# 🗂️ Estado de archivos (Frontend)

**Leyenda** 
ESTADO = 🟥 Pendiente / 🟨 En Proceso / 🟦 Listo /  ✅ Revisado / ⚠️ Corregir / ⬛ Cerrado

--------------------------------------------------------------------------------------------------
## App (src/app)
- 🟨 src/app/App.jsx 
- 🟨 src/app/main.jsx 

----------------------------------
## Components (src/components)

### Data-display
- 🟦 [src/components/data-display/Price.jsx](../src/components/data-display/Price.jsx) 
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
- 🟦 [src/components/layout/Navbar.jsx](../src/components/layout/Navbar.jsx) 

### UI
- 🟥 [src/components/ui/Badge.jsx](../src/components/ui/Badge.jsx) 
- 🟦 [src/components/ui/Button.jsx](../src/components/ui/Button.jsx) 
- 🟥 [src/components/ui/DropdownMenu.jsx](../src/components/ui/DropdownMenu.jsx) 
- 🟥 [src/components/ui/Input.jsx](../src/components/ui/Input.jsx) 
- 🟥 [src/components/ui/Modal.jsx](../src/components/ui/Modal.jsx) 
- 🟥 [src/components/ui/Pagination.jsx](../src/components/ui/Pagination.jsx) 
- 🟥 [src/components/ui/Select.jsx](../src/components/ui/Select.jsx) 
- 🟥 [src/components/ui/Tooltip.jsx](../src/components/ui/Tooltip.jsx) 

----------------------------------
## Config (src/config)
- 🟨 [src/config/api-paths.js](../src/config/api-paths.js) 
- 🟨 [env.js](../src/config/env.js) 

----------------------------------
## Context (src/context)
- 🟥 [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) 
- 🟥 [src/context/cartContext.jsx](../src/context/cartContext.jsx) 

----------------------------------
## Hooks (src/hooks)
### state
- 🟥 src/hooks/state/useCart.js 
- 🟥 src/hooks/state/useCategories.js  
- 🟥 src/hooks/state/useOrders.js 
- 🟥 src/hooks/state/useProducts.js 
- 🟥 src/hooks/state/useUser.js
- 🟥 src/hooks/state/useWishlist.js 
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
- 🟥 [src/pages/search/SearchResultsPage.jsx](../src/modules/products/pages/SearchResultsPage.jsx)
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
- 🟦 [src/modules/auth/pages/LoginPage.jsx](../src/modules/auth/pages/LoginPage.jsx) 
- 🟥 [src/modules/auth/pages/RegisterPage.jsx](../src/modules/auth/pages/RegisterPage.jsx) 
- 🟥 [src/modules/auth/pages/ForgotPasswordPage.jsx](../src/modules/auth/pages/ForgotPasswordPage.jsx) 
- 🟥 [src/modules/auth/pages/ResetPasswordPage.jsx](../src/modules/auth/pages/ResetPasswordPage.jsx) 
#### hook
- 🟦 [src/modules/auth/hook/useAuth.js](../src/modules/auth/hook/useAuth.js)  //Maneja sesión (login, logout, isAuth, user)
#### context
- 🟦 [src/modules/auth/context/AuthContext.js](../src/modules/auth/context/AuthContext.js) 
#### services
- 🟦 [src/modules/auth/services/auth.api.js](../src/modules/auth/services/auth.api.js) 

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


----------------------------------
## Routes (src/routes)
- 🟨 src/routes/auth.route.js 
- 🟥 src/routes/checkout.route.js 

----------------------------------
## Services (src/services)
- 🟨 src/services/api.js 

----------------------------------
## Styles (src/styles)
- 🟨 [src/styles/global.css](../src/styles/global.css) 
- 🟨 [src/styles/tokens.css](../src/styles/tokens.css) 
- 🟨 [src/styles/motion.css](../src/styles/motion.css) 
- 🟦 [src/styles/components/button.css](../src/styles/components/button.css) 

----------------------------------
## Utils (src/utils)
- 🟦 src/utils/currency.js 
- 🟦 src/utils/date.js 
- 🟦 src/utils/validators.js 

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