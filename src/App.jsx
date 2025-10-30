import './App.css'
import { Routes, Route } from 'react-router-dom'
import  { Navbar }  from './components/Navbar'
import  { Footer }  from './components/Footer'
import  { Home }  from './pages/Home'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Error } from './pages/Error'
import { Login } from './pages/Login'
import { NewProduct } from './pages/NewProduct'
import { ProductDetail } from './pages/ProductDetail'
import { Products } from './pages/Products'
import { Profile } from './pages/Profile'
import { Register } from './pages/Register'
import { Wishlist } from './pages/Wishlist'


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