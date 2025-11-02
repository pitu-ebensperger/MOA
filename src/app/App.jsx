import { Routes, Route } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar.jsx'
import { Footer } from '../components/layout/Footer.jsx'
import { HomePage } from '../modules/home/pages/HomePage.jsx'
import { CartPage } from '../modules/cart/pages/CartPage.jsx'
import { CheckoutPage } from '../modules/cart/pages/CheckoutPage.jsx'
import { NotFoundPage } from '../modules/support/pages/NotFoundPage.jsx'
import LoginPage from '../modules/auth/pages/LoginPage.jsx'
import RegisterPage from '../modules/auth/pages/RegisterPage.jsx'
import { ProductDetailPage } from '../modules/products/pages/ProductDetailPage.jsx'
import ProductsPage from '../modules/products/pages/ProductsPage.jsx'
import { ProfilePage } from '../modules/profile/pages/ProfilePage.jsx'
import WishlistPage from '../modules/profile/pages/WishlistPage.jsx'

import '../styles/global.css'
import '../styles/tokens.css'
import '../styles/motion.css'
import '../styles/components/buttons.css'


export const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='*' element={<NotFoundPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/product-detail' element={<ProductDetailPage />} />
        <Route path='/products' element={<ProductsPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
      </Routes>
      <Footer />
    </div>
  )
}
