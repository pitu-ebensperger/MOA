import { Routes, Route } from 'react-router-dom'
import  { Navbar }  from '../components/layout/Navbar';
import  { Footer }  from '../components/layout/Footer'
import  { Home }  from '../pages/home/HomePage'
import { Cart } from '../pages/cart/CartPage'
import { Checkout } from '../pages/cart/CheckoutPage'
import { Error } from '../pages/ErrorPage'
import { Login } from '../pages/auth/LoginPage'
import { NewProduct } from '../pages/admin/products/NewProductPage'
import { ProductDetail } from '../pages/products/ProductDetailPage'
import { Products } from '../pages/products/ProductsPage'
import { Profile } from '../pages/profile/ProfilePage'
import { Register } from '../pages/auth/RegisterPage'
import { Wishlist } from '../pages/profile/WishlistPage'


export const App = () => {
  return (
  <>
    <Navbar/>
      <Routes>
        <Route 
          path='/' 
          element={<Home />} 
        />

        <Route 
          path='/cart' 
          element={<Cart />} 
        />

        <Route 
          path='/checkout' 
          element={<Checkout />}
        />

        <Route 
          path='*' 
          element={<Error />}
        />

        <Route 
          path='/login' 
          element={<Login />}
        />

        <Route 
          path='/new-product' 
          element={<NewProduct />} 
        />

        <Route 
          path='/product-detail' 
          element={<ProductDetail />} 
        />

        <Route 
          path='/products' 
          element={<Products />} 
        />

        <Route 
          path='/profile' 
          element={<Profile />} 
        />

        <Route 
          path='/register' 
          element={<Register />} 
        />

        <Route 
          path='/wishlist' 
          element={<Wishlist />} 
        />

      </Routes>
    <Footer />
  </>
  )
}