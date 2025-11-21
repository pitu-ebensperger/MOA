import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import { Navbar } from '@/components/layout/Navbar.jsx'
import { Footer } from '@/components/layout/Footer.jsx'
import { API_PATHS } from '@/config/api-paths.js'
import { AddressProvider } from '@/context/AddressContext.jsx'
import ErrorBoundary from '@/components/error/ErrorBoundary.jsx'
import { ScrollToTop } from '@/components/layout/ScrollToTop.jsx'
import { AdminRoute, ProtectedRoute } from '@/modules/auth/hooks/useAuth.jsx'

// Eager load - Componentes críticos que se cargan inmediatamente
import { HomePage } from '@/modules/home/pages/HomePage.jsx'
import { CartDrawer } from '@/modules/cart/components/CartDrawer.jsx'

// Lazy load - Páginas principales
const CategoriesPage = lazy(() => import('@/modules/categories/pages/CategoriesPage.jsx'))
const ProductsPage = lazy(() => import('@/modules/products/pages/ProductsPage.jsx'))
const ProductDetailPage = lazy(() => import('@/modules/products/pages/ProductDetailPage.jsx'))
const CartPage = lazy(() => import('@/modules/cart/pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('@/modules/cart/pages/CheckoutPage.jsx'))

// Lazy load - Autenticación
const RegisterPage = lazy(() => import('@/modules/auth/pages/RegisterPage.jsx'))
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage.jsx'))
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('@/modules/auth/pages/ResetPasswordPage.jsx'))

// Lazy load - Perfil de usuario
const ProfilePage = lazy(() => import('@/modules/profile/pages/ProfilePage.jsx'))
const WishlistPage = lazy(() => import('@/modules/profile/pages/WishlistPage.jsx'))
const MyOrdersPage = lazy(() => import('@/modules/profile/pages/MyOrdersPage.jsx'))
const OrderConfirmationPage = lazy(() => import('@/modules/orders/pages/OrderConfirmationPage.jsx'))

// Lazy load - Soporte
const ContactPage = lazy(() => import('@/modules/support/pages/ContactPage.jsx'))
const FAQPage = lazy(() => import('@/modules/support/pages/FAQPage.jsx'))
const PrivacyPage = lazy(() => import('@/modules/support/pages/PrivacyPage.jsx'))
const TermsPage = lazy(() => import('@/modules/support/pages/TermsPage.jsx'))
const ReturnsAndExchangesPage = lazy(() => import('@/modules/support/pages/ReturnsAndExchangesPage.jsx'))
const NotFoundPage = lazy(() => import('@/modules/support/pages/NotFoundPage.jsx'))
const ServerErrorPage = lazy(() => import('@/modules/support/pages/ServerErrorPage.jsx'))

// Lazy load - Admin (chunk separado grande)
const EntornoAdmin = lazy(() => import('@/modules/admin/components/EntornoAdmin.jsx'))
const AdminDashboardPage = lazy(() => import('@/modules/admin/pages/AdminDashboardPage.jsx'))
const OrdersAdminPage = lazy(() => import('@/modules/admin/pages/orders/OrdersAdminPageV2.jsx'))
const OrderDetailPage = lazy(() => import('@/modules/admin/pages/orders/OrderDetailPage.jsx'))
const AdminProductsPage = lazy(() => import('@/modules/admin/pages/AdminProductsPage.jsx'))
const AdminCategoriesPage = lazy(() => import('@/modules/admin/pages/AdminCategoriesPage.jsx'))
const CustomersPage = lazy(() => import('@/modules/admin/pages/CustomersPage.jsx'))
const StoreSettingsPage = lazy(() => import('@/modules/admin/pages/StoreSettingsPage.jsx'))

// Lazy load - Style guide (solo desarrollo)
const StyleGuidePage = lazy(() => import('@/modules/styleguide/pages/StyleGuidePage.jsx'))

import '@/styles/global.css'
import '@/styles/tokens.css'
import '@/styles/components/buttons.css'
import '@/styles/sweetalert.css'

// Componente de loading para páginas
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="text-center space-y-4">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-(--color-primary1,#6B5444)"></div>
      <p className="text-sm text-(--text-weak)">Cargando...</p>
    </div>
  </div>
)

export const App = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const { home, auth, products, support, admin } = API_PATHS

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <AddressProvider>
          <div className="min-h-screen w-full overflow-x-hidden bg-(--color-light)">
            {!isAdminRoute && <Navbar />}
            {!isAdminRoute && <CartDrawer />}
            <ScrollToTop />
            <main className='main w-full'>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path={home.landing} element={<HomePage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path={products.categories} element={<CategoriesPage />} />
              <Route path={products.products} element={<ProductsPage />} />
              <Route path={products.productDetail(':id')} element={<ProductDetailPage />} />
              <Route path={auth.login} element={<LoginPage />} />
              <Route path={auth.register} element={<RegisterPage />} />
              <Route path={auth.forgot} element={<ForgotPasswordPage />} />
              <Route path={auth.reset} element={<ResetPasswordPage />} />
              <Route path='/order-confirmation/:orderId' element={<OrderConfirmationPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path={auth.profile} element={<ProfilePage />} />
                <Route path='/profile' element={<ProfilePage />} />
                <Route path='/wishlist' element={<WishlistPage />} />
                <Route path='/myorders' element={<MyOrdersPage />} />
              </Route>
              <Route path={support.contact} element={<ContactPage />} /> 
              <Route path={support.privacy} element={<PrivacyPage />} /> 
              <Route path={support.terms} element={<TermsPage />} /> 
              <Route path={support.faq} element={<FAQPage />} /> 
              <Route path={support.returns} element={<ReturnsAndExchangesPage />} /> 
              <Route path='*' element={<NotFoundPage />} />

              <Route element={<AdminRoute />}>
                <Route path={admin.dashboard} element={<EntornoAdmin><AdminDashboardPage /></EntornoAdmin>} />
                <Route path={admin.orders} element={<EntornoAdmin><OrdersAdminPage /></EntornoAdmin>} />
                <Route path="/admin/orders/:orderId" element={<EntornoAdmin><OrderDetailPage /></EntornoAdmin>} />
                <Route path={admin.products} element={<EntornoAdmin><AdminProductsPage /></EntornoAdmin>} />
                <Route path={admin.categories} element={<EntornoAdmin><AdminCategoriesPage /></EntornoAdmin>} />
                <Route path={admin.customers} element={<EntornoAdmin><CustomersPage /></EntornoAdmin>} />
                <Route path={admin.settings} element={<EntornoAdmin><StoreSettingsPage /></EntornoAdmin>} />
              </Route>

              <Route path='/style-guide/*' element={<StyleGuidePage />} />
            
            {/* Error Routes */}
              <Route path="/error/500" element={<ServerErrorPage statusCode={500} />} />
              <Route path="/error/502" element={<ServerErrorPage statusCode={502} />} />
              <Route path="/error/503" element={<ServerErrorPage statusCode={503} />} />
              <Route path="/error/504" element={<ServerErrorPage statusCode={504} />} />
            </Routes>
          </Suspense>
        </main>
            {!isAdminRoute && <Footer />}
          </div>
        </AddressProvider>
    </ErrorBoundary>
  )
}
