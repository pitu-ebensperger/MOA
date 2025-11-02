//src/components/layout/Navbar.jsx
import { ShoppingCart, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Items del navbar
const NAV_ITEMS = [
  { label: 'Inicio', href: '/home' },
  { label: 'Categorías', href: '/categories' },
  { label: 'Productos', href: '/products' },
  { label: 'Contacto', href: '/contactus' },
];

/**
 * Props (JSX, sin TS): usa defaults simples
 * @param {string}   currentPage
 * @param {function} onNavigate
 * @param {number}   cartItemCount
 */
export function Navbar({ currentPage = 'home', onNavigate, cartItemCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // navega y cierra menú móvil
  const handleNavigate = (page) => {
    onNavigate?.(page);
    setIsMenuOpen(false); // cerrar menú móvil si estaba abierto
  };

  return (
    <div className="nav-container fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b animate-slide-down">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/*---------------- Brand ----------------*/}
          <div
            className="cursor-pointer transition-transform hover:scale-105"
            aria-label="Ir al inicio"
            onClick={() => handleNavigate('home')}
          >
            <div className="brand">MOA</div>
          </div>

          {/*-------- Desktop Navigation -----------*/}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className="nav-items transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          


          {/*---------------- Reg-Login//Iconos ----------------*/}
          <div className="flex items-center gap-1 sm:gap-2">
                        <span className="navbar-divider" />

          {isLoggedIn ?
          <div className="flex items-center gap-1 sm:gap-2">
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
              {cartItemCount > 0 && (
                <span className="cart-badge absolute">{cartItemCount}</span>
              )}
            </button></div>
            :
            <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleNavigate('register')}
              className="nav-items nav-btn"
            >
              Registrarme
            </button>
            <button
              onClick={() => handleNavigate('login')}
              className="nav-items nav-btn nav-btn-primary"
            >
              Iniciar sesión
            </button>
          </div>}

            {/* Toggle menú móvil */}
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

        {/* Mobile Menu*/}
        <nav
          id="mobile-menu"
          className={[
            'md:hidden overflow-hidden transition-[max-height,opacity] duration-300',
            isMenuOpen ? 'max-h-64 opacity-100 mt-4 pb-4' : 'max-h-0 opacity-0',
          ].join(' ')}
        >
          <div className="flex flex-col gap-4">
            {/* Acceso también visible en móvil (opcional) */}
            <div className="flex items-center gap-3">
              <button onClick={() => handleNavigate('register')} className="nav-icon-bg">
                Registrarme
              </button>
              <span className="navbar-divider" />
              <button onClick={() => handleNavigate('login')} className="nav-btn-primary">
                Iniciar sesión
              </button>
            </div>

            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="nav-items"
                onClick={() => setIsMenuOpen(false)} // se cierra al navegar
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
