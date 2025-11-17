import { useMemo } from "react";
import { Activity, Layers, Package, Settings, TrendingUp, Users, Warehouse, AlertTriangle, Truck } from "lucide-react";

import { useAdminOrders } from "../hooks/useAdminOrders.js";
import { useAdminProducts } from "../hooks/useAdminProducts.js";

import { Button } from "../../../components/ui/Button.jsx";
import { StatusPill } from "../../../components/ui/StatusPill.jsx";
import { formatCurrencyCLP } from "../../../utils/currency.js";
import { formatDate_ddMMyyyy, relativeTime } from "../../../utils/date.js";
import { ORDER_STATUS_MAP } from "../../../config/status-maps.js";
import { API_PATHS } from "../../../config/api-paths.js";

const SUMMARY_ORDER_LIMIT = 500;

const formatCount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("es-CL");
};

export default function AdminDashboardPage() {
  const {
    items: orders = [],
    total: totalOrdersRaw,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useAdminOrders({ page: 1, limit: SUMMARY_ORDER_LIMIT });

  const {
    total: totalProductsRaw,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useAdminProducts({ page: 1, limit: 1 });

  const totalOrders = Number.isFinite(Number(totalOrdersRaw)) ? Number(totalOrdersRaw) : orders.length;
  const totalProducts = Number.isFinite(Number(totalProductsRaw)) ? Number(totalProductsRaw) : 0;

  const dashboardData = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    const uniqueCustomers = new Set(
      orders
        .map((order) => String(order.userId ?? order.userEmail ?? "")) // fallback for anonymous
        .filter(Boolean),
    ).size;

    const statusCounts = orders.reduce((acc, order) => {
      const key = String(order.status ?? "pending").toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    // Simulamos productos con stock bajo (esto debería venir del backend)
    const lowStockItems = 8; // Productos con stock menor a 5 unidades
    const outOfStockItems = 3; // Productos sin stock

    return {
      revenue,
      uniqueCustomers,
      statusCounts,
      lowStockItems,
      outOfStockItems,
      latestOrders: orders.slice(0, 4),
    };
  }, [orders]);

  const statusEntries = Object.entries(ORDER_STATUS_MAP).map(([status, config]) => ({
    status,
    label: config.label,
    variant: config.variant,
    count: dashboardData.statusCounts[status] ?? 0,
  }));

  const totalStatusCount = statusEntries.reduce((sum, entry) => sum + entry.count, 0);

  const statsCards = [
    {
      label: "Productos en catálogo",
      helper: "Muebles y decoración",
      icon: Warehouse,
      value: productsLoading ? "…" : formatCount(totalProducts),
    },
    {
      label: "Ingresos del mes",
      helper: "Ventas completadas",
      icon: TrendingUp,
      value: ordersLoading ? "..." : formatCurrencyCLP(dashboardData.revenue),
    },
    {
      label: "Pedidos totales",
      helper: "Órdenes procesadas",
      icon: Package,
      value: ordersLoading ? "…" : formatCount(totalOrders),
    },
    {
      label: "Stock bajo",
      helper: "Requieren reposición",
      icon: AlertTriangle,
      value: ordersLoading ? "…" : formatCount(dashboardData.lowStockItems),
    },
  ];

  const quickActions = [
    { label: "Gestión Productos", to: API_PATHS.admin.products, icon: Layers },
    { label: "Pedidos & Envíos", to: API_PATHS.admin.orders, icon: Truck },
    { label: "Stock & Inventario", to: API_PATHS.admin.products, icon: Warehouse },
    { label: "Configuración", to: API_PATHS.admin.settings, icon: Settings },
  ];

  const handleRefresh = () => {
    refetchOrders?.();
    refetchProducts?.();
  };

  const isLoading = ordersLoading || productsLoading;
  const hasError = Boolean(ordersError || productsError);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">MOA Administración</p>
        <h1 className="text-3xl font-semibold text-primary">Centro de Control</h1>
        <p className="text-sm text-neutral-500">Gestión integral de productos, pedidos y operaciones MOA.</p>
      </header>

      {hasError && (
        <div className="rounded-3xl border border-error/30 bg-error/[0.06] p-5 text-sm text-error">
          <p>No se pudo cargar la información del panel.</p>
          <Button appearance="ghost" intent="neutral" size="sm" className="mt-3" onClick={handleRefresh}>
            Reintentar
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="flex flex-col gap-3 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 text-sm text-neutral-500">
                <span>{card.label}</span>
                <Icon className="h-4 w-4 text-(--color-secondary1)" aria-hidden />
              </div>
              <p className="text-3xl font-semibold tracking-tight text-(--text-strong)">{card.value}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">{card.helper}</p>
            </article>
          )
        })}
      </div>

      {/* Alertas de inventario específicas para MOA */}
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 mb-2">Alertas de Inventario</h3>
            <div className="space-y-2 text-sm text-amber-700">
              <p>• {dashboardData.outOfStockItems} productos sin stock disponible</p>
              <p>• {dashboardData.lowStockItems} productos con stock bajo (menos de 5 unidades)</p>
              <p>• 2 productos requieren reposición urgente</p>
            </div>
            <div className="mt-4 flex gap-3">
              <Button appearance="ghost" intent="warning" size="sm">
                Ver productos sin stock
              </Button>
              <Button appearance="ghost" intent="warning" size="sm">
                Generar orden de compra
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de distribución operativa */}
      <article className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Estados de pedidos</p>
            <h2 className="text-xl font-semibold text-primary">Distribución operativa</h2>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            {totalStatusCount ? `${totalStatusCount} pedidos activos` : "Sin actividad"}
          </span>
        </div>
        {totalStatusCount ? (
          <div className="space-y-4 mb-6">
            {statusEntries.map((entry) => (
              <div key={entry.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm font-medium text-neutral-600">
                  <span className="flex items-center gap-2">
                    <StatusPill status={entry.status} domain="order" className="text-[10px]" />
                    {entry.label}
                  </span>
                  <span className="text-xs font-semibold text-(--text-strong)">{entry.count}</span>
                </div>
                <div className="h-2 rounded-full bg-(--surface-subtle)">
                  <div
                    className="h-full rounded-full bg-(--color-primary1)"
                    style={{
                      width: `${Math.max(4, Math.round((entry.count / totalStatusCount) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-6">
            <Activity className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">Los pedidos se registran aquí en cuanto haya actividad.</p>
            <p className="text-xs text-neutral-400 mt-1">El flujo operativo aparecerá cuando los clientes realicen compras.</p>
          </div>
        )}
        <div className="border-t border-neutral-100 pt-4">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-3">Acciones rápidas</p>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  appearance="ghost"
                  intent="primary"
                  size="sm"
                  to={action.to}
                  leadingIcon={<Icon className="h-4 w-4" aria-hidden />}
                >
                  {action.label}
                </Button>
              )
            })}
          </div>
        </div>
      </article>

      {/* Últimos pedidos y widget lateral */}
      <div className="grid gap-6 lg:grid-cols-4">
        <article className="lg:col-span-3 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Pedidos recientes</p>
              <h2 className="text-xl font-semibold text-primary">Últimos pedidos de muebles</h2>
            </div>
            <Button 
              appearance="solid" 
              intent="primary" 
              size="sm" 
              onClick={handleRefresh}
              className="bg-(--color-primary1) hover:shadow-sm transition-shadow"
            >
              Actualizar
            </Button>
          </header>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-neutral-500">Cargando pedidos...</div>
          ) : dashboardData.latestOrders.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dashboardData.latestOrders.map((order) => (
                <div
                  key={order.id ?? order.number}
                  className="flex flex-col gap-3 rounded-2xl border border-neutral-100 p-4 shadow-[0_5px_12px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-(--text-strong)">Pedido #{order.number}</p>
                      <p className="text-xs text-neutral-500">
                        {formatDate_ddMMyyyy(order.createdAt, "—")}
                      </p>
                    </div>
                    <StatusPill status={order.status} domain="order" />
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-neutral-500">Total</span>
                    <strong className="text-(--text-strong)">{formatCurrencyCLP(order.total)}</strong>
                  </div>
                  <p className="text-xs text-neutral-400">{relativeTime(order.createdAt, new Date(), "—")}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-500 mb-2">Aún no hay pedidos de muebles registrados</p>
              <p className="text-sm text-neutral-400">Los pedidos aparecerán aquí cuando los clientes compren productos</p>
            </div>
          )}
        </article>

        {/* Widget lateral */}
        <article className="lg:col-span-1 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">Rendimiento</p>
              <h3 className="text-lg font-semibold text-primary">Métricas del día</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Conversión</p>
                    <p className="text-lg font-bold text-blue-800">2.4%</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-linear-to-br from-green-50 to-green-100 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Visitantes</p>
                    <p className="text-lg font-bold text-green-800">127</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500 text-white">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Actividad</p>
                    <p className="text-lg font-bold text-purple-800">84%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <Button 
                appearance="ghost" 
                intent="primary" 
                size="sm" 
                className="w-full"
              >
                Ver más métricas
              </Button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
