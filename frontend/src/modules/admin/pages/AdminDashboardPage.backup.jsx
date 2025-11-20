import { useMemo } from "react";
import { Activity, Layers, Package, Settings, TrendingUp, Users, Warehouse, AlertTriangle, Truck, BarChart3, Calendar, ArrowUpRight, ArrowDownRight, PieChart, Star, Heart, Eye, ShoppingCart } from "lucide-react";

import { useAdminOrders } from "@/modules/admin/hooks/useAdminOrders.js"
import { useAdminProducts } from "@/modules/admin/hooks/useAdminProducts.js"

import { Button } from "@/components/ui/Button.jsx"
import { Skeleton } from "@/components/ui/Skeleton.jsx"
import { StatusPill } from "@/components/ui/StatusPill.jsx"
import { formatCurrencyCLP } from "@/utils/currency.js"
import { formatDate_ddMMyyyy, relativeTime } from "@/utils/date.js"
import { ORDER_STATUS_MAP } from "@/config/status-maps.js"
import { API_PATHS } from "@/config/api-paths.js"

const SUMMARY_ORDER_LIMIT = 500;

const formatCount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("es-CL");
};

const categoryAccentColors = [
  "var(--color-primary1)",
  "var(--color-primary3)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-secondary1)",
  "var(--color-secondary2)",
];

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

    // Datos simulados para el reporte de ventas
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonthRevenue = 2450000; // Simulado
    const currentMonthRevenue = revenue;
    const growthPercentage = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    // Top categorías por ventas (simulado)
    const topCategories = [
      { name: "Living", sales: 1200000, orders: 15 },
      { name: "Comedor", sales: 890000, orders: 12 },
      { name: "Dormitorio", sales: 650000, orders: 8 },
      { name: "Iluminación", sales: 350000, orders: 7 },
    ];

    // Datos para el gráfico de distribución semanal (simulado)
    const weeklyDistribution = [
      { day: "Lunes", orders: 12, percentage: 15 },
      { day: "Martes", orders: 18, percentage: 22.5 },
      { day: "Miércoles", orders: 15, percentage: 18.75 },
      { day: "Jueves", orders: 14, percentage: 17.5 },
      { day: "Viernes", orders: 21, percentage: 26.25 },
    ];

    // Productos populares (simulado)
    const popularProducts = [
      {
        id: 1,
        name: "Sofá Modular Arena",
        sku: "MOA-LIV-SOFA-001",
        views: 342,
        sales: 15,
        price: 459990,
        image: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=400",
        conversionRate: 4.4
      },
      {
        id: 2,
        name: "Mesa Roble Extensible",
        sku: "MOA-COM-MESA-045",
        views: 289,
        sales: 12,
        price: 329990,
        image: "https://images.unsplash.com/photo-1583845112239-97ef1341b271?q=80&w=400",
        conversionRate: 4.2
      },
      {
        id: 3,
        name: "Lámpara Industrial Cobre",
        sku: "MOA-ILU-LAMP-023",
        views: 156,
        sales: 8,
        price: 89990,
        image: "https://images.unsplash.com/photo-1606170033648-5d55a3edf314?q=80&w=400",
        conversionRate: 5.1
      }
    ];

    return {
      revenue,
      uniqueCustomers,
      statusCounts,
      lowStockItems,
      outOfStockItems,
      lastMonthRevenue,
      growthPercentage,
      topCategories,
      weeklyDistribution,
      popularProducts,
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

  const isLoading = ordersLoading || productsLoading;

  const statsCards = [
    {
      label: "Productos en catálogo",
      helper: "Muebles y decoración",
      icon: Warehouse,
      renderValue: () => formatCount(totalProducts),
    },
    {
      label: "Ingresos del mes",
      helper: "Ventas completadas",
      icon: TrendingUp,
      renderValue: () => formatCurrencyCLP(dashboardData.revenue),
    },
    {
      label: "Pedidos totales",
      helper: "Órdenes procesadas",
      icon: Package,
      renderValue: () => formatCount(totalOrders),
    },
    {
      label: "Stock bajo",
      helper: "Requieren reposición",
      icon: AlertTriangle,
      renderValue: () => formatCount(dashboardData.lowStockItems),
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
              className="flex flex-col gap-3 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral2)] p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-center justify-between gap-2 text-sm text-neutral-500">
                <span>{card.label}</span>
                <Icon className="h-4 w-4 text-(--color-secondary1)" aria-hidden />
              </div>
              <p className="text-3xl font-semibold tracking-tight text-(--text-strong)">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  card.renderValue()
                )}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">{card.helper}</p>
            </article>
          );
        })}
      </div>

      {/* Alertas de inventario específicas para MOA */}
      <div className="rounded-3xl border border-[color:var(--color-warning)] bg-[color:var(--color-warning)]/10 p-6 text-sm text-[color:var(--color-warning)]">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-[color:var(--color-warning)] mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-[color:var(--color-warning)] mb-2">Alertas de Inventario</h3>
            <div className="space-y-2 text-sm text-[color:var(--color-warning)]">
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

      {/* Widget de Reporte de Ventas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Análisis mensual</p>
              <h2 className="text-xl font-semibold text-primary">Reporte de Ventas</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Calendar className="h-4 w-4" />
              Noviembre 2025
            </div>
          </div>

          <div className="space-y-6">
            {/* Comparación mensual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600">Mes actual</p>
                <p className="text-2xl font-bold text-(--text-strong)">{formatCurrencyCLP(dashboardData.revenue)}</p>
                <div className="flex items-center gap-1 text-sm">
                  {Number(dashboardData.growthPercentage) >= 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-[color:var(--color-success)]" />
                      <span className="text-[color:var(--color-success)]">+{dashboardData.growthPercentage}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-[color:var(--color-error)]" />
                      <span className="text-[color:var(--color-error)]">{dashboardData.growthPercentage}%</span>
                    </>
                  )}
                  <span className="text-neutral-500">vs mes anterior</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600">Mes anterior</p>
                <p className="text-lg font-semibold text-neutral-600">{formatCurrencyCLP(dashboardData.lastMonthRevenue)}</p>
                <p className="text-xs text-neutral-400">Octubre 2025</p>
              </div>
            </div>

            {/* Top categorías */}
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-3">Categorías más vendidas</p>
              <div className="space-y-3">
                {dashboardData.topCategories.map((category, index) => {
                  const dotColor = categoryAccentColors[index % categoryAccentColors.length];
                  return (
                    <div
                      key={category.name}
                      className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral4)] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: dotColor }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-(--text-strong)">{category.name}</p>
                          <p className="text-xs text-neutral-500">{category.orders} pedidos</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-(--text-strong)">{formatCurrencyCLP(category.sales)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[color:var(--color-border)]">
            <Button appearance="ghost" intent="primary" size="sm" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver reporte completo
            </Button>
          </div>
        </article>

        <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Tendencias</p>
              <h2 className="text-xl font-semibold text-primary">Métricas de Rendimiento</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-(--color-secondary1)" />
          </div>

          <div className="space-y-6">
            {/* Métricas clave */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral4)]">
                <p className="text-xs uppercase tracking-wide text-[color:var(--color-secondary1)] font-medium">Ticket promedio</p>
                <p className="text-xl font-bold text-[color:var(--color-primary2)] mt-1">
                  {totalOrders > 0 ? formatCurrencyCLP(Math.round(dashboardData.revenue / totalOrders)) : "$0"}
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)] mt-1">Por pedido</p>
              </div>
              <div className="p-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral4)]">
                <p className="text-xs uppercase tracking-wide text-[color:var(--color-secondary1)] font-medium">Conversión</p>
                <p className="text-xl font-bold text-[color:var(--color-success)] mt-1">2.4%</p>
                <p className="text-xs text-[color:var(--color-text-muted)] mt-1">Visitante a compra</p>
              </div>
            </div>

            {/* Indicadores de actividad */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Productos más vistos</span>
                <span className="text-sm font-semibold text-(--text-strong)">Sofás modulares</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Categoría estrella</span>
                <span className="text-sm font-semibold text-(--text-strong)">Living</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Hora pico de ventas</span>
                <span className="text-sm font-semibold text-(--text-strong)">20:00 - 22:00</span>
              </div>
            </div>

            {/* Progreso del mes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Progreso del mes</span>
                <span className="font-semibold text-(--text-strong)">56%</span>
              </div>
              <div className="h-2 rounded-full bg-[color:var(--color-neutral3)]">
                <div className="h-full w-[56%] rounded-full bg-[color:var(--color-primary1)]"></div>
              </div>
              <p className="text-xs text-neutral-500">17 días de 30 días del mes</p>
            </div>
          </div>
        </article>
      </div>

      {/* Sección de distribución operativa */}
      <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
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
                <div className="h-2 rounded-full bg-[color:var(--color-neutral3)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--color-primary1)]"
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
        <div className="border-t border-[color:var(--color-border)] pt-4">
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

      {/* Widgets adicionales: Conversion Rate y Distribución de Órdenes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Widget de Conversion Rate detallado */}
        <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Rendimiento</p>
              <h2 className="text-xl font-semibold text-primary">Tasa de Conversión</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-(--color-secondary1)" />
          </div>

          <div className="space-y-6">
            {/* Conversión principal */}
            <div
              className="text-center p-6 rounded-2xl border border-[color:var(--color-border)]"
              style={{
                background: "linear-gradient(135deg, var(--color-primary4), color-mix(in srgb, var(--color-primary2) 60%, transparent))",
              }}
            >
              <p className="text-sm font-medium text-[color:var(--color-secondary1)] mb-2">Conversión Global</p>
              <p className="text-4xl font-bold text-[color:var(--color-primary2)]">2.4%</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-[color:var(--color-success)]" />
                <span className="text-sm text-[color:var(--color-success)]">+0.3% vs mes anterior</span>
              </div>
            </div>

            {/* Conversiones por categoría */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-700">Conversión por Categoría</p>
              {dashboardData.topCategories.map((category, index) => {
                const conversionRate = (Math.random() * 2 + 1.5).toFixed(1); // Simulado
                const dotColor = categoryAccentColors[index % categoryAccentColors.length];
                return (
                  <div
                    key={category.name}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral4)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                      <span className="text-sm font-medium text-neutral-700">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold text-(--text-strong)">{conversionRate}%</span>
                  </div>
                );
              })}
            </div>

            {/* Botón de acción */}
            <div className="pt-4 border-t border-[color:var(--color-border)]">
              <Button appearance="ghost" intent="primary" size="sm" className="w-full">
                Optimizar conversión
              </Button>
            </div>
          </div>
        </article>

        {/* Widget de Distribución de Órdenes con Pie Chart */}
        <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Análisis temporal</p>
              <h2 className="text-xl font-semibold text-primary">Distribución de Órdenes</h2>
            </div>
            <PieChart className="h-5 w-5 text-(--color-secondary1)" />
          </div>

          <div className="space-y-6">
            {/* Simulación de pie chart con barras */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-700 mb-4">Distribución Semanal</p>
              {dashboardData.weeklyDistribution.map((day, index) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">{day.day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">{day.orders} órdenes</span>
                      <span className="text-sm font-semibold text-neutral-800">{day.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[color:var(--color-neutral3)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${day.percentage * 4}%`,
                        backgroundColor: categoryAccentColors[index % categoryAccentColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de categorías */}
            <div className="pt-4 border-t border-[color:var(--color-border)]">
              <p className="text-sm font-semibold text-neutral-700 mb-3">Breakdown por Categoría</p>
              <div className="grid grid-cols-2 gap-3">
                {dashboardData.topCategories.slice(0, 4).map((category, index) => (
                  <div
                    key={category.name}
                    className="text-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral4)] p-3"
                  >
                    <span
                      className="w-4 h-4 rounded-full mx-auto mb-2 inline-block"
                      style={{
                        backgroundColor: categoryAccentColors[index % categoryAccentColors.length],
                      }}
                    />
                    <p className="text-xs font-medium text-neutral-600">{category.name}</p>
                    <p className="text-sm font-bold text-neutral-800">{category.orders}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Widget de Productos Populares */}
      <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Top performers</p>
            <h2 className="text-xl font-semibold text-primary">Productos Populares</h2>
          </div>
          <Star className="h-5 w-5 text-(--color-secondary1)" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {dashboardData.popularProducts.map((product, index) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] transition-all hover:shadow-[var(--shadow-md)]"
            >
              {/* Imagen del producto */}
              <div className="relative aspect-4/3 overflow-hidden bg-[color:var(--color-neutral3)]">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-neutral-800">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-neutral-800 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{product.sku}</p>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[color:var(--color-primary2)]">{formatCurrencyCLP(product.price)}</span>
                  <span className="text-[color:var(--color-success)] font-semibold">{product.conversionRate}% conv.</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-neutral-600">
                    <Eye className="h-3 w-3" />
                    <span>{product.views} vistas</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <ShoppingCart className="h-3 w-3" />
                    <span>{product.sales} ventas</span>
                  </div>
                </div>

                {/* Barra de rendimiento */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Rendimiento</span>
                    <span className="font-semibold text-neutral-700">{Math.round((product.sales / product.views) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[color:var(--color-neutral3)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (product.sales / product.views) * 100 * 20)}%`,
                        background: "linear-gradient(90deg, var(--color-primary1), var(--color-primary3))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-[color:var(--color-border)]">
          <Button appearance="ghost" intent="primary" size="sm" className="w-full">
            Ver análisis completo de productos
          </Button>
        </div>
      </article>

      {/* Últimos pedidos y widget lateral */}
      <div className="grid gap-6 lg:grid-cols-4">
        <article className="lg:col-span-3 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={`order-skeleton-${idx}`}
                  className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral2)] p-4 shadow-[0_5px_12px_rgba(15,23,42,0.05)]"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData.latestOrders.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dashboardData.latestOrders.map((order) => (
                <div
                  key={order.id ?? order.number}
                  className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral2)] p-4 shadow-[0_5px_12px_rgba(15,23,42,0.05)]"
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
        <article className="lg:col-span-1 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6 shadow-[var(--shadow-sm)]">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">Rendimiento</p>
              <h3 className="text-lg font-semibold text-primary">Métricas del día</h3>
            </div>
            
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl border border-[color:var(--color-border)]"
                style={{ background: "linear-gradient(135deg, var(--color-primary4), var(--color-primary2))" }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[color:var(--color-primary1)] text-[color:var(--color-white)]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-primary2)]">Conversión</p>
                    <p className="text-lg font-bold text-[color:var(--color-primary2)]">2.4%</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border border-[color:var(--color-border)]"
                style={{ background: "linear-gradient(135deg, var(--color-success), color-mix(in srgb, var(--color-success) 50%, transparent))" }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[color:var(--color-success)] text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Visitantes</p>
                    <p className="text-lg font-bold text-[color:var(--color-primary2)]">127</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border border-[color:var(--color-border)]"
                style={{ background: "linear-gradient(135deg, var(--color-secondary1), color-mix(in srgb, var(--color-secondary2) 60%, transparent))" }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[color:var(--color-secondary2)] text-white">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">Actividad</p>
                    <p className="text-lg font-bold text-[color:var(--color-primary2)]">84%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[color:var(--color-border)]">
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
