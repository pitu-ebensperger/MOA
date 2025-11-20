import { Routes, Route, useLocation } from 'react-router-dom'

import { Navbar } from '@/components/layout/Navbar.jsx'
import { Footer } from '@/components/layout/Footer.jsx'
import { API_PATHS } from '@/config/api-paths.js'
import { AddressProvider } from '@/context/AddressContext.jsx'
import { PaymentProvider } from '@/context/PaymentContext.jsx'
import ErrorBoundary from '@/components/error/ErrorBoundary.jsx'

import { HomePage } from '@/modules/home/pages/HomePage.jsx'
import { CategoriesPage } from '@/modules/categories/pages/CategoriesPage.jsx'
import ProductsPage from '@/modules/products/pages/ProductsPage.jsx'
import { ProductDetailPage } from '@/modules/products/pages/ProductDetailPage.jsx'
import { CartPage } from '@/modules/cart/pages/CartPage.jsx'
import { CheckoutPage } from '@/modules/cart/pages/CheckoutPage.jsx'
import { CartDrawer } from '@/modules/cart/components/CartDrawer.jsx'
import RegisterPage from '@/modules/auth/pages/RegisterPage.jsx'
import LoginPage from '@/modules/auth/pages/LoginPage.jsx'
import ForgotPasswordPage from '@/modules/auth/pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from '@/modules/auth/pages/ResetPasswordPage.jsx'

import { ProfilePage } from '@/modules/profile/pages/ProfilePage.jsx'
import { WishlistPage } from '@/modules/profile/pages/WishlistPage.jsx'
import { StyleGuidePage } from '@/modules/styleguide/pages/StyleGuidePage.jsx'
import { OrderConfirmationPage } from '@/modules/orders/pages/OrderConfirmationPage.jsx'

import ContactPage from '@/modules/support/pages/ContactPage.jsx';
import { FAQPage } from '@/modules/support/pages/FAQPage.jsx'
import {PrivacyPage} from '@/modules/support/pages/PrivacyPage.jsx'
import {TermsPage} from '@/modules/support/pages/TermsPage.jsx'
import { ReturnsAndExchangesPage } from '@/modules/support/pages/ReturnsAndExchangesPage.jsx'
import { NotFoundPage } from '@/modules/support/pages/NotFoundPage.jsx'
import { ServerErrorPage } from '@/modules/support/pages/ServerErrorPage.jsx'

import { AdminRoute } from '@/modules/auth/hooks/useAuth.jsx'
import EntornoAdmin from '@/modules/admin/components/EntornoAdmin.jsx'
import AdminDashboardPage from '@/modules/admin/pages/AdminDashboardPage.jsx'
import OrdersAdminPage from '@/modules/admin/pages/orders/OrdersAdminPageV2.jsx'
import AdminProductsPage from '@/modules/admin/pages/AdminProductsPage.jsx'
import AdminCategoriesPage from '@/modules/admin/pages/AdminCategoriesPage.jsx'
import CustomersPage from '@/modules/admin/pages/CustomersPage.jsx'
import AdminSettingsPage from '@/modules/admin/pages/AdminSettingsPage.jsx'

import { ScrollToTop } from '@/components/layout/ScrollToTop.jsx'

import '@/styles/global.css'
import '@/styles/tokens.css'
import '@/styles/components/buttons.css'
import '@/styles/sweetalert.css'

export const App = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const { home, auth, products, support, admin } = API_PATHS

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <PaymentProvider>
        <AddressProvider>
          <div className="min-h-screen w-full overflow-x-hidden bg-(--color-light)">
            {!isAdminRoute && <Navbar />}
            {!isAdminRoute && <CartDrawer />}
            <ScrollToTop />
            <main className='main w-full'>
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
          <Route path='/order-confirmation/:orderCode' element={<OrderConfirmationPage />} />
          <Route path={auth.profile} element={<ProfilePage />} />
          <Route path='/wishlist' element={<WishlistPage />} />         
          <Route path={support.contact} element={<ContactPage />} /> 
          <Route path={support.privacy} element={<PrivacyPage />} /> 
          <Route path={support.terms} element={<TermsPage />} /> 
          <Route path={support.faq} element={<FAQPage />} /> 
          <Route path={support.returns} element={<ReturnsAndExchangesPage />} /> 
          <Route path='*' element={<NotFoundPage />} />

            <Route element={<AdminRoute />}>
              <Route path={admin.dashboard} element={<EntornoAdmin><AdminDashboardPage /></EntornoAdmin>} />
              <Route path={admin.orders} element={<EntornoAdmin><OrdersAdminPage /></EntornoAdmin>} />
              <Route path={admin.products} element={<EntornoAdmin><AdminProductsPage /></EntornoAdmin>} />
              <Route path={admin.categories} element={<EntornoAdmin><AdminCategoriesPage /></EntornoAdmin>} />
              <Route path={admin.customers} element={<EntornoAdmin><CustomersPage /></EntornoAdmin>} />
              <Route path={admin.settings} element={<EntornoAdmin><AdminSettingsPage /></EntornoAdmin>} />
            </Route>

            <Route path='/style-guide/*' element={<StyleGuidePage />} />
            
            {/* Error Routes */}
            <Route path="/error/500" element={<ServerErrorPage statusCode={500} />} />
            <Route path="/error/502" element={<ServerErrorPage statusCode={502} />} />
            <Route path="/error/503" element={<ServerErrorPage statusCode={503} />} />
            <Route path="/error/504" element={<ServerErrorPage statusCode={504} />} />
          </Routes>
        </main>
            {!isAdminRoute && <Footer />}
          </div>
        </AddressProvider>
      </PaymentProvider>
    </ErrorBoundary>
  )
}
