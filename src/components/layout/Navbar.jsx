import { ShoppingCart, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Items del navbar
const NAV_ITEMS = [
  { label: 'Inicio', href: '/home' },
  { label: 'Categorías', href: '/categories' },
  { label: 'Productos', href: '/products' },
  { label: 'Contacto', href: '/contactus' },
];


export function Navbar({ currentPage = 'home', onNavigate, cartItemCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation(); 

  const handleNavigate = (page) => {  // cerrar menú móvil
    onNavigate?.(page);
    setIsMenuOpen(false);
  };

  const isActive = (href) => location.pathname.startsWith(href); // identifica tab activa por path

  return (
    <div className="nav-container fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b animate-slide-down">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/*---------------- Brand ----------------*/}
          <Link
            to="/home"
            className="cursor-pointer transition-transform hover:scale-105"
            aria-label="Ir al inicio"
            onClick={() => handleNavigate('home')}
          >
            <div className="brand">MOA</div>
          </Link>

          {/*-------- Desktop Navigation -----------*/}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className={`nav-items transition-colors animate-fade-in-up ${isActive(item.href) ? 'aria-[current=page]:font-semibold' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }} 
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          


          {/*---------------- Auth//Iconos ----------------*/}
          <div className="flex items-center gap-2">
             {/* bloque desktop cuando NO hay login */}
            {!isLoggedIn && (
                  <div className="hidden md:flex items-center gap-2">
                    <Link to="/register" className="nav-items nav-btn">
                      Registrarme
                    </Link>
                    <Link to="/login" className="nav-items nav-btn nav-btn-primary">
                      Iniciar sesión
                    </Link>
                  </div>
                )}

             {/* bloque desktop cuando HAY login */}
             {isLoggedIn && (
              <>
                <button
                  aria-label="Perfil"
                  className="nav-icon-bg transition-all hover:scale-105 active:scale-95 relative"
                  onClick={() => handleNavigate('profile')}
                >
                  <User className="nav-icon" />
                </button>

                <button
                  aria-label="Ver carrito"
                  className="nav-icon-bg transition-all hover:scale-105 active:scale-95 relative"
                  onClick={() => handleNavigate('cart')}
                >
                  <ShoppingCart className="nav-icon" />
                  {cartItemCount > 0 && <span className="cart-badge absolute">{cartItemCount}</span>}
                </button>
              </>
            )}

            {/* Toggle Menú Móvil--------------------------------------- */}
            <button
              aria-label="Abrir menú"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden nav-icon-bg transition-colors"
            >
              {isMenuOpen ? <X className="nav-icon" /> : <Menu className="nav-icon" />}
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        <nav
          id="mobile-menu"
          className={[
            'md:hidden overflow-hidden transition-[max-height,opacity] duration-300',
            isMenuOpen ? 'max-h-64 opacity-100 mt-4 pb-4' : 'max-h-0 opacity-0',
          ].join(' ')}
        >
          <div className="flex flex-col gap-4 items-center">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="nav-items"
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}

             {/* móvil cuando NO hay login */}
            {!isLoggedIn && (
                <div className="flex flex-col items-stretch gap-3 w-full px-2 animate-fade-in-up mt-2">
                  <div className="flex flex-cols-3 gap-2 w-fit justify-center items-center mx-auto">
                    <Link to="/register" className="nav-btn text-secondary text-center w-fit">
                      Registrarme
                    </Link>
                    <div className='divider-vertical opacity-30'></div>
                    <Link to="/login" className="nav-btn text-secondary text-center w-fit">
                      Iniciar sesión
                    </Link>
                  </div>
                </div>
              )}
          </div>
        </nav>
      </div>
    </div>
  );
}