import { useLocation } from "react-router-dom";
import Button from "../../../components/ui/Button.jsx";
import { LayoutDashboard, Package, Warehouse, Users, Settings, LogOut, Store } from "lucide-react";

const navItems = [
  { label: "Resumen", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pedidos", to: "/admin/orders", icon: Package },
  { label: "Productos", to: "/admin/products", icon: Warehouse },
  { label: "Clientes", to: "/admin/customers", icon: Users },
  { label: "Ajustes", to: "/admin/settings", icon: Settings },
];

export default function EntornoAdmin({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <div className="admin-shell min-h-screen bg-[var(--color-lightest2)] text-neutral-900">
      <header className="flex items-center justify-between px-4 md:px-8 border-b border-neutral-200 py-3 bg-white shadow-sm">
        <a href="/admin/" className="flex items-center gap-3">
          <div className="title-serif text-primary text-2xl ">MOA</div>
          <span className="text-sm font-regular text-secondary uppercase tracking-[0.3em]">Admin</span>
        </a>
        <div className="flex items-center gap-5 text-secondary text-regular">
          <button className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1 text-sm font-medium transition hover:border-neutral-500">
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="sidebar-collapsible group border-r border-neutral-200 bg-white px-5 py-6 w-fit">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.startsWith(item.to);
              return (
                <Button
                  key={item.to}
                  variant="round"
                  size="sm"
                  to={item.to}
                  className={`sidebar-link flex flex-row items-center justify-start gap-3 rounded-2xl px-3 py-3 text-sm font-semibold tracking-wide transition w-fit text-left whitespace-nowrap hover:text-accent ${
                    isActive
                      ? "border-r-4 border-indigo-500 text-indigo-600 shadow-[0_0_0_1px_rgba(99,102,241,0.5)]"
                      : "text-neutral-700 hover:text-indigo-500"
                  }`}
                >
                  <span className="flex flex-row items-center justify-flex-start gap-3">
                    {Icon && <Icon className="h-5 w-5 btn-icon-left stroke-2" aria-hidden />}
                    <span className="sidebar-label">{item.label}</span>
                  </span>
                </Button>
              );
            })}
          </nav>
          <div className="mt-8 border-t  border-neutral-100 pt-6">
            <Button
              variant="secondary"
              size="sm"
              to="/home"
              className="mt-3 w-fit btn-round sidebar-link flex items-center justify-center gap-2"
            >
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4 btn-icon-left" aria-hidden />
                <span className="sidebar-label">Visitar tienda</span>
              </span>
            </Button>

          </div>
        </aside>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
