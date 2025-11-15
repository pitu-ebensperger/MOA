import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/ui/Button.jsx";
import { LayoutDashboard, Package, Warehouse, Users, Settings, LogOut, Store, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { API_PATHS } from "../../../config/api-paths.js";

const navItems = [
  { label: "Resumen", to: API_PATHS.admin.dashboard, icon: LayoutDashboard },
  { label: "Pedidos", to: API_PATHS.admin.orders, icon: Package },
  { label: "Productos", to: API_PATHS.admin.products, icon: Warehouse },
  { label: "Colecciones", to: API_PATHS.admin.collections, icon: Layers },
  { label: "Clientes", to: API_PATHS.admin.customers, icon: Users },
  { label: "Ajustes", to: API_PATHS.admin.settings, icon: Settings },
];


export default function EntornoAdmin({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isExpanded, setIsExpanded] = useState(false);

  // Cargar preferencia desde localStorage
  useEffect(() => {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      const raw = globalThis.localStorage.getItem("moa.admin.sidebarExpanded");
      if (raw != null) setIsExpanded(raw === "true");
    }
  }, []);

  // Persistir preferencia
  useEffect(() => {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      globalThis.localStorage.setItem("moa.admin.sidebarExpanded", String(isExpanded));
    }
  }, [isExpanded]);

 

  return (
  <div className="admin-shell min-h-screen bg-white text-body">
      <header className="h-0" />

      <div className="flex min-h-screen overflow-hidden">
        <aside
          className={`${isExpanded ? "w-56" : "w-16"} sticky top-0 h-screen overflow-y-auto flex flex-col items-center bg-white border-r border-neutral-100 py-5 px-2.5 transition-[width,padding] duration-400 ease-in-out`}
        >
          {/* Brand y toggle */}
          <div className="mb-5 w-full flex items-center justify-between">
            <a href={API_PATHS.admin.dashboard} className="flex items-center gap-2">
              <span className="title-serif text-primary text-lg font-normal tracking-tight">MOA</span>
              {isExpanded && (
                <span className="text-[0.625rem] uppercase tracking-[0.25em] text-secondary">Admin</span>
              )}
            </a>
            <Button
              appearance="ghost"
              size="sm"
              onClick={() => setIsExpanded((v) => !v)}
              title={isExpanded ? "Contraer" : "Expandir"}
              className="rounded-lg p-1.5 hover:bg-neutral-100"
            >
              {isExpanded ? (
                <ChevronLeft className="h-3.5 w-3.5 text-primary" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-primary" />
              )}
            </Button>
          </div>

          {/* Navegación principal */}
          <nav className="flex flex-col gap-1 mb-3 items-stretch w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.startsWith(item.to);
              return (
                <Button
                  key={item.to}
                  appearance="ghost"
                  size="sm"
                  as={Link}
                  to={item.to}
                  className={`sidebar-link w-full rounded-lg ${isExpanded ? "px-3 py-2.5 flex-row justify-start gap-3" : "px-2 py-2.5 flex-col justify-center items-center"} text-xs font-medium transition-all duration-200 ${isActive ? "text-white bg-primary hover:bg-primary/90 shadow-sm" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"}`}
                  title={item.label}
                >
                  {Icon && (
                    <Icon className={`h-4 w-4 stroke-[1.5] shrink-0 ${isActive ? "text-white" : "text-primary"}`} aria-hidden />
                  )}
                  {isExpanded ? <span className="text-xs font-medium">{item.label}</span> : null}
                </Button>
              );
            })}
          </nav>
          {/* Separador con espacio visual */}
          <div className="my-4 h-px w-full bg-neutral-200" />

          {/* Acciones secundarias */}
          <div className="mt-auto w-full flex flex-col gap-1 pb-3">
            <Button
              appearance="ghost"
              size="sm"
              as={Link}
              to={API_PATHS.home.landing}
              className={`sidebar-link w-full rounded-lg ${isExpanded ? "px-3 py-2.5 flex-row justify-start gap-3" : "px-2 py-2.5 flex-col justify-center items-center"} text-xs font-medium transition-all duration-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50`}
              title="Visitar tienda"
            >
              <Store className="h-4 w-4 stroke-[1.5] shrink-0 text-neutral-500" aria-hidden />
              {isExpanded ? <span className="text-xs font-medium">Visitar tienda</span> : null}
            </Button>

            <div className="my-2 h-px w-full bg-neutral-200" />

            <Button
              appearance="ghost"
              size="sm"
              className={`sidebar-link w-full rounded-lg ${isExpanded ? "px-3 py-2.5 flex-row justify-start gap-3" : "px-2 py-2.5 flex-col justify-center items-center"} text-xs font-medium transition-all duration-200 text-neutral-600 hover:text-red-600 hover:bg-red-50`}
              title="Cerrar sesión"
              onClick={() => {
                if (typeof globalThis !== "undefined" && globalThis.localStorage) {
                  globalThis.localStorage.removeItem('moa.accessToken');
                  globalThis.localStorage.removeItem('moa.user');
                  globalThis.location.href = API_PATHS.auth.login;
                }
              }}
            >
              <LogOut className="h-4 w-4 stroke-[1.5] shrink-0 text-neutral-500" aria-hidden />
              {isExpanded ? <span className="text-xs font-medium">Cerrar sesión</span> : null}
            </Button>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-8 bg-neutral-50">{children}</main>
      </div>
    </div>
  );
}

EntornoAdmin.propTypes = {
  children: PropTypes.node,
};
