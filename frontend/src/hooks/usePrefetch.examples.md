# Ejemplos de uso del hook usePrefetch

> Ejemplos de cómo usar el hook `usePrefetch` para optimizar la navegación en la aplicación MOA

## Uso básico

```jsx
import { usePrefetch } from '@/hooks/usePrefetch'
import { Link } from 'react-router-dom'

// ============================================================
// Ejemplo 1: Prefetch en Navbar (rutas principales)
// ============================================================

export const NavbarExample = () => {
  const prefetch = usePrefetch()

  return (
    <nav>
      <Link 
        to="/productos" 
        onMouseEnter={() => prefetch(() => import('@/modules/products/pages/ProductsPage.jsx'))}
      >
        Productos
      </Link>
      
      <Link 
        to="/categorias" 
        onMouseEnter={() => prefetch(() => import('@/modules/categories/pages/CategoriesPage.jsx'))}
      >
        Categorías
      </Link>
      
      <Link 
        to="/cart" 
        onMouseEnter={() => prefetch(() => import('@/modules/cart/pages/CartPage.jsx'))}
      >
        Carrito
      </Link>
    </nav>
  )
}

// ============================================================
// Ejemplo 2: Prefetch en Product Card (detalles de producto)
// ============================================================

export const ProductCardExample = ({ product }) => {
  const prefetch = usePrefetch()

  return (
    <div 
      className="product-card"
      onMouseEnter={() => prefetch(() => import('@/modules/products/pages/ProductDetailPage.jsx'))}
    >
      <Link to={`/producto/${product.slug}`}>
        <img src={product.imgUrl} alt={product.name} />
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </Link>
    </div>
  )
}

// ============================================================
// Ejemplo 3: Prefetch condicional (solo desktop)
// ============================================================

export const ConditionalPrefetchExample = () => {
  const prefetch = usePrefetch()
  const isDesktop = window.innerWidth > 768

  const handleMouseEnter = () => {
    // Solo prefetch en desktop (mejor conexión)
    if (isDesktop) {
      prefetch(() => import('@/modules/checkout/pages/CheckoutPage.jsx'))
    }
  }

  return (
    <button onMouseEnter={handleMouseEnter}>
      Ir al Checkout
    </button>
  )
}

// ============================================================
// Ejemplo 4: Prefetch múltiples rutas relacionadas
// ============================================================

export const MultiplePrefetchExample = () => {
  const prefetch = usePrefetch()

  const prefetchUserSection = () => {
    // Precargar todas las páginas relacionadas con el usuario
    prefetch(() => import('@/modules/profile/pages/ProfilePage.jsx'))
    prefetch(() => import('@/modules/profile/pages/WishlistPage.jsx'))
    prefetch(() => import('@/modules/profile/pages/MyOrdersPage.jsx'))
  }

  return (
    <Link 
      to="/profile" 
      onMouseEnter={prefetchUserSection}
    >
      Mi Perfil
    </Link>
  )
}

// ============================================================
// Ejemplo 5: Prefetch en onClick (navegación táctil)
// ============================================================

import { useNavigate } from 'react-router-dom'

export const TouchPrefetchExample = () => {
  const prefetch = usePrefetch()
  const navigate = useNavigate()

  const handleTouchStart = () => {
    // En móvil, prefetch en touchstart (antes del click)
    prefetch(() => import('@/modules/products/pages/ProductsPage.jsx'))
  }

  return (
    <button 
      onTouchStart={handleTouchStart}
      onClick={() => navigate('/productos')}
    >
      Ver Productos
    </button>
  )
}

// ============================================================
// Ejemplo 6: Prefetch automático desde HomePage
// ============================================================

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const AutoPrefetchExample = () => {
  const prefetch = usePrefetch()
  const location = useLocation()

  useEffect(() => {
    // Prefetch automático de rutas populares desde home
    if (location.pathname === '/') {
      // Esperar 2 segundos después de cargar home
      const timer = setTimeout(() => {
        prefetch(() => import('@/modules/products/pages/ProductsPage.jsx'))
        prefetch(() => import('@/modules/categories/pages/CategoriesPage.jsx'))
        prefetch(() => import('@/modules/cart/pages/CartPage.jsx'))
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [location.pathname, prefetch])

  return <div>Home Page Content</div>
}

// ============================================================
// Ejemplo 7: Prefetch con retry logic (conexiones lentas)
// ============================================================

export const PrefetchWithRetryExample = () => {
  const prefetch = usePrefetch()

  const prefetchWithRetry = (importFn, retries = 2) => {
    return prefetch(() => 
      importFn().catch(error => {
        if (retries > 0) {
          console.log(`Retry prefetch, remaining: ${retries}`)
          return new Promise(resolve => 
            setTimeout(() => 
              resolve(prefetchWithRetry(importFn, retries - 1)), 
              1000
            )
          )
        }
        throw error
      })
    )
  }

  return (
    <Link 
      to="/admin"
      onMouseEnter={() => 
        prefetchWithRetry(() => import('@/modules/admin/pages/AdminDashboardPage.jsx'))
      }
    >
      Admin Dashboard
    </Link>
  )
}

// ============================================================
// Ejemplo 8: Prefetch solo si hay conexión rápida (Network Info API)
// ============================================================

export const NetworkAwarePrefetchExample = () => {
  const prefetch = usePrefetch()

  const smartPrefetch = (importFn) => {
    // Verificar conexión del usuario
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (!connection) {
      // Si no hay info de red, prefetch normal
      prefetch(importFn)
      return
    }

    // Solo prefetch en conexiones rápidas (4g, wifi)
    const fastConnections = ['4g', 'wifi']
    if (fastConnections.includes(connection.effectiveType)) {
      prefetch(importFn)
    } else {
      console.log('Conexión lenta detectada, prefetch deshabilitado')
    }
  }

  return (
    <Link 
      to="/productos"
      onMouseEnter={() => 
        smartPrefetch(() => import('@/modules/products/pages/ProductsPage.jsx'))
      }
    >
      Ver Productos
    </Link>
  )
}

// ============================================================
// Ejemplo 9: Prefetch con analytics tracking
// ============================================================

export const AnalyticsPrefetchExample = () => {
  const prefetch = usePrefetch()

  const trackAndPrefetch = (route, importFn) => {
    // Track que el usuario mostró interés en esta ruta
    console.log(`User interested in: ${route}`)
    // analytics.track('route_hover', { route })
    
    prefetch(importFn)
  }

  return (
    <Link 
      to="/checkout"
      onMouseEnter={() => 
        trackAndPrefetch(
          '/checkout',
          () => import('@/modules/checkout/pages/CheckoutPage.jsx')
        )
      }
    >
      Finalizar Compra
    </Link>
  )
}

// ============================================================
// Ejemplo 10: Prefetch prioritario (intersection observer)
// ============================================================

import { useRef } from 'react'

export const IntersectionPrefetchExample = () => {
  const prefetch = usePrefetch()
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Prefetch cuando el elemento está visible
            prefetch(() => import('@/modules/products/pages/ProductsPage.jsx'))
            observer.disconnect()
          }
        })
      },
      { threshold: 0.5 } // 50% visible
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [prefetch])

  return (
    <div ref={ref}>
      <Link to="/productos">Ver Catálogo Completo</Link>
    </div>
  )
}
