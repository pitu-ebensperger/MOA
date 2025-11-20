import PropTypes from 'prop-types';
import { ShoppingCart, Menu, User, X, Search, LogOut, Heart, Package, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context.js'
import { SearchBar } from '@/components/ui/SearchBar.jsx'
import { SearchBarEmergency } from '@/components/ui/SearchBarEmergency.jsx'
import { API_PATHS } from '@/config/api-paths.js'

const NAV_ITEMS = [
  { label: 'Inicio', href: API_PATHS.home.landing, match: ['/', API_PATHS.home.landing] },
  { label: 'Categorías', href: API_PATHS.products.categories },
  { label: 'Productos', href: API_PATHS.products.products },
  { label: 'Contacto', href: API_PATHS.support.contact },
];

const getPathname = (href = "") => {
  if (!href) return "/";
  const [path] = href.split("#");
  return path || "/";
};

export function Navbar({ onNavigate, cartItemCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  // Close search when location changes
  useEffect(() => {
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close search bar with Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
        setSearchQuery(''); // Limpiar también la query
      }
      
      // EMERGENCY: Force close search with Ctrl/Cmd + Escape
      if ((event.ctrlKey || event.metaKey) && event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
        console.log('Cierre forzado');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detectar scroll para cambiar opacidad del navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 80; // Después de 80px de scroll
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (item) => {
    const targets = Array.isArray(item.match) ? item.match : [item.match ?? getPathname(item.href)];
    return targets.some((target) => {
      if (!target) return false;
      if (target === "/") {
        return location.pathname === "/" || location.pathname === "/home";
      }
      return location.pathname === target || location.pathname.startsWith(`${target}/`);
    });
  };

  const handleNavigate = (page) => {
    onNavigate?.(page);
    setIsMenuOpen(false);
  };

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setIsMenuOpen(false);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`${API_PATHS.products.products}?search=${encodeURIComponent(trimmed)}`);
    handleNavigate("products");
    handleSearchClose();
  };

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const profileMenuItems = [
    {
      icon: User,
      label: 'Mi Perfil',
      href: API_PATHS.auth.profile,
    },
    {
      icon: Package,
      label: 'Mis Pedidos',
      href: API_PATHS.auth.profile,
    },
    {
      icon: Heart,
      label: 'Lista de Deseos',
      href: '/wishlist',
    },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate(API_PATHS.home.landing);
  };

  const handleProfileMenuClick = (item) => {
    const navigationOptions = item.state ? { state: item.state } : undefined;
    navigate(item.href, navigationOptions);
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <div className={`nav-container shadow-md fixed top-0 left-0 right-0 z-50 border-b animate-slide-down transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-lg shadow-xl scrolled' : 'backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
          {/* Brand */}
          <Link
            to={API_PATHS.home.landing}
            className="cursor-pointer transition-transform hover:scale-105"
            aria-label="Ir al inicio"
            onClick={() => handleNavigate('home')}
          >
            <div className="brand">MOA</div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className={[
                    'nav-items',
                    active
                      ? 'text-(--color-secondary1) underline underline-offset-4'
                      : '',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones / Iconos (derecha) */}
          <div className="flex items-center gap-2">
            {/* No logeado (desktop) */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <Link to={API_PATHS.auth.register} className="nav-items nav-btn">Registrarme</Link>
                <Link to={API_PATHS.auth.login} className="nav-items nav-btn nav-btn-primary">Iniciar sesión</Link>
              </div>
            )}

            {/* Logeado */}
            {isAuthenticated && (
              <>
                {isAdmin ? (
                  // ADMIN: Dashboard + Logout
                  <>
                    <Link
                      aria-label="Dashboard admin"
                      to={API_PATHS.admin.dashboard}
                      className="nav-btn nav-btn-primary flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="nav-icon-bg text-red-600 transition-all hover:scale-105 active:scale-95"
                      aria-label="Cerrar sesión"
                    >
                      <LogOut className="nav-icon" />
                    </button>
                  </>
                ) : (
                  // USER: Perfil + Carrito
                  <>
                    {/* Dropdown de Perfil */}
                    <div className="relative profile-dropdown">
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="nav-icon-bg transition-all hover:scale-105 active:scale-95 relative"
                        aria-label="Menú de perfil"
                      >
                        <User className="nav-icon" />
                      </button>

                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg z-50 py-2">
                          {profileMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.label}
                                onClick={() => handleProfileMenuClick(item.href)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                              >
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

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
                    <button
                      onClick={handleLogout}
                      className="nav-icon-bg text-red-600 transition-all hover:scale-105 active:scale-95"
                      aria-label="Cerrar sesión"
                    >
                      <LogOut className="nav-icon" />
                    </button>
                  </>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleToggleSearch}
              className="nav-icon-bg transition-all hover:scale-105 active:scale-95"
              aria-label={isSearchOpen ? "Cerrar buscador" : "Abrir buscador"}
            >
              <Search className="nav-icon" />
            </button>

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

        {/* Menú móvil */}
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
                aria-current={isActive(item) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Bloque auth en móvil */}
            {!isAuthenticated ? (
              // No logeado
              <div className="flex flex-col gap-3 w-full animate-fade-in-up">
                <div className="divider-horizontal my-2" />
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Link
                    to={API_PATHS.auth.register}
                    className="nav-btn text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarme
                  </Link>
                  <Link
                    to={API_PATHS.auth.login}
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
                  <div className="flex items-center gap-3 w-full">
                    <Link
                      to={API_PATHS.admin.dashboard}
                      className="nav-btn nav-btn-primary flex-1 text-center flex items-center justify-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="nav-icon-bg text-red-600"
                      aria-label="Cerrar sesión"
                    >
                      <LogOut className="nav-icon" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative profile-dropdown flex-1">
                        <button
                          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                          className="nav-icon-bg w-full flex items-center justify-center gap-2 py-2"
                          aria-label="Menú de perfil"
                        >
                          <User className="nav-icon" />
                          <span className="text-sm">Perfil</span>
                        </button>

                        {isProfileDropdownOpen && (
                          <div className="mt-2 rounded-xl border border-neutral-200 bg-white shadow-lg py-2">
                            {profileMenuItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.label}
                                  onClick={() => {
                                    handleProfileMenuClick(item);
                                    setIsMenuOpen(false);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                >
                                  <Icon className="h-4 w-4" />
                                  {item.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
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
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="nav-icon-bg text-red-600"
                        aria-label="Cerrar sesión"
                      >
                        <LogOut className="nav-icon" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
    <SearchBarEmergency
      isOpen={isSearchOpen}
      value={searchQuery}
      onChange={handleSearchChange}
      onSubmit={handleSearchSubmit}
      onClose={handleSearchClose}
    />
    </>
  );
}

Navbar.propTypes = {
  onNavigate: PropTypes.func,
  cartItemCount: PropTypes.number,
};
