import { ShoppingCart, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth.jsx';

// Ítems del navbar (rutas públicas principales)
const NAV_ITEMS = [
  { label: 'Inicio', href: '/home' },
  { label: 'Categorías', href: '/categories' },
  { label: 'Productos', href: '/products' },
  { label: 'Contacto', href: '/contactus' },
];

/**
 * @param {string}   currentPage       (opcional, por compatibilidad)
 * @param {function} onNavigate        (opcional, por compatibilidad)
 * @param {number}   cartItemCount     contador del carrito (default 0)
 */
export function Navbar({ currentPage = 'home', onNavigate, cartItemCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  // helper para marcar link activo por path
  const isActive = (href) => location.pathname.startsWith(href);

  // navega (si te pasan handler externo) y cierra menú móvil
  const handleNavigate = (page) => {
    onNavigate?.(page);
    setIsMenuOpen(false);
  };

  return (
    <div className="nav-container shadow-md fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b animate-slide-down">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/home"
            className="cursor-pointer transition-transform hover:scale-105"
            aria-label="Ir al inicio"
            onClick={() => handleNavigate('home')}
          >
            <div className="brand">MOA</div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className="nav-items transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }} // delay incremental
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Acciones / Iconos (derecha) */}
          <div className="flex items-center gap-2">
            {/* No logeado (desktop) */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/register" className="nav-items nav-btn">Registrarme</Link>
                <Link to="/login" className="nav-items nav-btn nav-btn-primary">Iniciar sesión</Link>
              </div>
            )}

            {/* Logeado */}
            {isAuthenticated && (
              <>
                {isAdmin ? (
                  // ADMIN: acceso directo al dashboard
                  <Link
                    aria-label="Dashboard admin"
                    to="/admin/dashboard"
                    className="nav-btn nav-btn-primary"
                  >
                    Dashboard
                  </Link>
                ) : (
                  // USER: Perfil + Carrito
                  <>
                    <Link
                      aria-label="Perfil"
                      to="/profile"
                      className="nav-icon-bg transition-all hover:scale-105 active:scale-95 relative"
                    >
                      <User className="nav-icon" />
                    </Link>

                    <Link
                      aria-label="Ver carrito"
                      to="/cart"
                      className="nav-icon-bg transition-all hover:scale-105 active:scale-95 relative"
                    >
                      <ShoppingCart className="nav-icon" />
                      {cartItemCount > 0 && (
                        <span className="cart-badge absolute">{cartItemCount}</span>
                      )}
                    </Link>
                  </>
                )}

                {/* Logout (discreto en desktop) */}
                <button onClick={logout} className="hidden md:inline nav-items nav-btn">
                  Salir
                </button>
              </>
            )}

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

        {/* Menú móvil (max-height + opacity) */}
        <nav
          id="mobile-menu"
          className={[
            'md:hidden overflow-hidden transition-[max-height,opacity] duration-300',
            isMenuOpen ? 'max-h-64 opacity-100 mt-4 pb-4' : 'max-h-0 opacity-0',
          ].join(' ')}
        >
          <div className="flex flex-col gap-4 items-stretch px-2">
            {/* Enlaces principales */}
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="nav-items"
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)} // cerrar al navegar
              >
                {item.label}e
              </Link>
            ))}

            {/* Bloque auth en móvil */}
            {!isAuthenticated ? (
              // No logeado
              <div className="flex flex-col gap-3 w-full animate-fade-in-up">
                <div className="divider-horizontal my-2" />
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Link
                    to="/register"
                    className="nav-btn text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarme
                  </Link>
                  <Link
                    to="/login"
                    className="nav-btn nav-btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            ) : (
              // Logeado
              <div className="flex items-center justify-between gap-3 animate-fade-in-up">
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    className="nav-btn nav-btn-primary w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="nav-icon-bg"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Perfil"
                    >
                      <User className="nav-icon" />
                    </Link>
                    <Link
                      to="/cart"
                      className="nav-icon-bg relative"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Ver carrito"
                    >
                      <ShoppingCart className="nav-icon" />
                      {cartItemCount > 0 && (
                        <span className="cart-badge absolute">{cartItemCount}</span>
                      )}
                    </Link>
                    <button
                      className="nav-btn"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Salir
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
