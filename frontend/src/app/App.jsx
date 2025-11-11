import { Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar.jsx'
import { Footer } from '../components/layout/Footer.jsx'
import { HomePage } from '../modules/home/pages/HomePage.jsx'
import { CartPage } from '../modules/cart/pages/CartPage.jsx'
import { CheckoutPage } from '../modules/cart/pages/CheckoutPage.jsx'
import { CartDrawer } from '../modules/cart/components/CartDrawer.jsx'
import { NotFoundPage } from '../modules/support/pages/NotFoundPage.jsx'
import LoginPage from '../modules/auth/pages/LoginPage.jsx'
import RegisterPage from '../modules/auth/pages/RegisterPage.jsx'
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage.jsx'
import { ProductDetailPage } from '../modules/products/pages/ProductDetailPage.jsx'
import ProductsPage from '../modules/products/pages/ProductsPage.jsx'
import { ProfilePage } from '../modules/profile/pages/ProfilePage.jsx'
import { WishlistPage } from '../modules/profile/pages/WishlistPage.jsx'
import { CategoriesPage } from '../modules/categories/pages/CategoriesPage.jsx'
import { FAQPage } from '../modules/support/pages/FAQPage.jsx'
import ContactPage from '../modules/support/pages/ContactPage.jsx';
import {PrivacyPage} from '../modules/support/pages/PrivacyPage.jsx'
import {TermsPage} from '../modules/support/pages/TermsPage.jsx'
import AdminDashboardPage from '../modules/admin/pages/AdminDashboardPage.jsx'
import OrdersPage from '../modules/admin/pages/OrdersPage.jsx'
import AdminProductsPage from '../modules/admin/pages/AdminProductsPage.jsx'
import CustomersPage from '../modules/admin/pages/CustomersPage.jsx'
import SettingsPage from '../modules/admin/pages/SettingsPage.jsx'
import EntornoAdmin from '../modules/admin/components/EntornoAdmin.jsx'
import { AdminRoute } from '../modules/auth/hooks/useAuth.jsx'
import { ScrollToTop } from '../components/layout/ScrollToTop.jsx'




import '../styles/global.css'
import '../styles/tokens.css'
import '../styles/motion.css'
import '../styles/components/buttons.css'


export const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--color-light)]">
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />}
      <ScrollToTop />
      <main className='main w-full'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/checkout' element={<CheckoutPage />} />
          <Route path='/categories' element={<CategoriesPage />} />
          <Route path='/faq' element={<FAQPage />} /> 
          <Route path='/contact' element={<ContactPage />} /> 
          <Route path='/privacy' element={<PrivacyPage />} /> 
          <Route path='/terms' element={<TermsPage/>} /> 

          <Route element={<AdminRoute />}>
            <Route
              path="/admin/dashboard"
              element={
                <EntornoAdmin>
                  <AdminDashboardPage />
                </EntornoAdmin>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <EntornoAdmin>
                  <OrdersPage />
                </EntornoAdmin>
              }
            />
            <Route
              path="/admin/products"
              element={
                <EntornoAdmin>
                  <AdminProductsPage />
                </EntornoAdmin>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <EntornoAdmin>
                  <CustomersPage />
                </EntornoAdmin>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <EntornoAdmin>
                  <SettingsPage />
                </EntornoAdmin>
              }
            />
          </Route>
          <Route path='*' element={<NotFoundPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path='/products/:id' element={<ProductDetailPage />} />
          <Route path='/products' element={<ProductsPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/wishlist' element={<WishlistPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}
