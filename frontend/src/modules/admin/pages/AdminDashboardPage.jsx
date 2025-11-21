import { useMemo } from "react";
import { 
  Activity, 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Truck, 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Star, 
  Eye, 
  ShoppingCart,
  Settings,
  Layers,
  Warehouse,
  DollarSign,
  Clock
} from "lucide-react";

import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard.js"
import { useAdminOrders } from "@/modules/admin/hooks/useAdminOrders.js"
import { useAdminProducts } from "@/modules/admin/hooks/useAdminProducts.js"

import { Button } from "@/components/ui/Button.jsx"
import { Skeleton } from "@/components/ui/Skeleton.jsx"
import { StatusPill } from "@/components/ui/StatusPill.jsx"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs.jsx"
import { formatCurrencyCLP } from "@/utils/currency.js"
import { formatDate_ddMMyyyy } from "@/utils/date.js"
import { ORDER_STATUS_MAP } from "@/config/status-maps.js"
import { API_PATHS } from "@/config/api-paths.js"

const formatCount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("es-CL");
};

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  className = "",
  size = "default",
  accentColor = "var(--color-primary1)"
}) => {
  const sizeClasses = {
    small: "p-4",
    default: "p-6", 
    large: "p-8"
  };

  const titleClasses = {
    small: "text-sm",
    default: "text-base",
    large: "text-lg"
  };

  const valueClasses = {
    small: "text-2xl",
    default: "text-3xl",
    large: "text-4xl"
  };

  return (
    <div 
      className={`rounded-3xl border border-(--color-border) bg-(--color-neutral1) shadow-(--shadow-sm) transition-all hover:shadow-(--shadow-md) ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className={`font-medium text-neutral-600 ${titleClasses[size]}`}>{title}</p>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div 
            className="rounded-2xl p-3"
            style={{ 
              backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
            }}
          >
            <Icon 
              className="h-5 w-5" 
              style={{ color: accentColor }}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className={`font-bold text-(--text-strong) ${valueClasses[size]}`}>
          {value}
        </div>
        
        {trend && (
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-(--color-success)" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-(--color-error)" />
            )}
            <span 
              className={`text-sm font-medium ${
                trend === "up" ? "text-(--color-success)" : "text-(--color-error)"
              }`}
            >
              {trendValue}
            </span>
            <span className="text-xs text-neutral-500">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickActionCard = ({ label, description, icon, to, variant = "default" }) => {
  const Icon = icon;
  const variants = {
    default: "border-neutral-200 hover:border-primary1/30 hover:bg-primary4/20",
    primary: "border-primary1/30 bg-primary4/10 hover:bg-primary4/30",
    warning: "border-warning/30 bg-warning/10 hover:bg-warning/20"
  };

  return (
    <Button
      appearance="ghost"
      intent="neutral"
      to={to}
      className={`h-auto p-6 flex-col items-start space-y-3 text-left transition-all ${variants[variant]}`}
    >
      <div className="flex items-center gap-3 w-full">
        {Icon && <Icon className="h-6 w-6 text-primary1" />}
        <div className="flex-1">
          <p className="font-semibold text-neutral-800">{label}</p>
          {description && (
            <p className="text-sm text-neutral-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </Button>
  );
};

export default function AdminDashboardPage() {
  const { data: dashboardData, isLoading, isError, refetch } = useAdminDashboard();

  // Fallback para compatibilidad con el hook anterior
  const {
    items: fallbackOrders = [],
    total: totalOrdersRaw,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useAdminOrders({ page: 1, limit: 4 });

  const {
    total: totalProductsRaw,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useAdminProducts({ page: 1, limit: 1 });

  // Usar datos del dashboard principal o fallback con validaciones seguras
  const metrics = useMemo(() => {
    if (dashboardData?.metrics) return dashboardData.metrics;
    
    return {
      totalProducts: Number.isFinite(Number(totalProductsRaw)) ? Number(totalProductsRaw) : 0,
      totalOrders: Number.isFinite(Number(totalOrdersRaw)) ? Number(totalOrdersRaw) : (Array.isArray(fallbackOrders) ? fallbackOrders.length : 0),
      totalRevenue: Array.isArray(fallbackOrders) ? fallbackOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0) : 0,
      totalCustomers: Array.isArray(fallbackOrders) ? new Set(fallbackOrders.map(o => o.userId || o.userEmail)).size : 0,
      monthlyRevenue: 0,
      previousMonthRevenue: 0,
      growthPercentage: 0,
    };
  }, [dashboardData, totalProductsRaw, totalOrdersRaw, fallbackOrders]);

  const stockData = useMemo(() => {
    return dashboardData?.stock || {
      lowStockItems: 0,
      outOfStockItems: 0,
    };
  }, [dashboardData]);

  const topProducts = useMemo(() => {
    return Array.isArray(dashboardData?.topProducts) ? dashboardData.topProducts : [];
  }, [dashboardData]);

  const categories = useMemo(() => {
    return Array.isArray(dashboardData?.categories) ? dashboardData.categories : [];
  }, [dashboardData]);

  const recentOrders = useMemo(() => {
    if (Array.isArray(dashboardData?.recentOrders)) return dashboardData.recentOrders;
    return Array.isArray(fallbackOrders) ? fallbackOrders.slice(0, 4) : [];
  }, [dashboardData, fallbackOrders]);

  const handleRefresh = () => {
    refetch?.();
    refetchOrders?.();
    refetchProducts?.();
  };

  const hasError = Boolean(isError || ordersError || productsError);
  const loading = isLoading || ordersLoading || productsLoading;

  const quickActions = [
    { 
      label: "Pedidos", 
      description: "Seguimiento de órdenes",
      to: API_PATHS.admin.orders, 
      icon: Truck 
    },
  ];

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-primary1 mb-2">Dashboard</h1>
      </header>

      {hasError && (
        <div className="rounded-3xl border border-error/30 bg-error/[0.06] p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-error mt-1 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-error mb-2">Error de conexión</h3>
              <p className="text-error/80 text-sm mb-4">
                No se pudieron cargar algunos datos del panel de control.
              </p>
              <Button appearance="ghost" intent="error" size="sm" onClick={handleRefresh}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos del mes"
          subtitle="Ventas completadas"
          value={loading ? <Skeleton className="h-8 w-32" /> : formatCurrencyCLP(metrics?.monthlyRevenue || 0)}
          icon={DollarSign}
          trend={(metrics?.growthPercentage || 0) >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(metrics?.growthPercentage || 0).toFixed(1)}%`}
          accentColor="var(--color-success)"
        />
        
        <MetricCard
          title="Pedidos totales"
          subtitle="Órdenes procesadas"
          value={loading ? <Skeleton className="h-8 w-20" /> : formatCount(metrics?.totalOrders || 0)}
          icon={Package}
          accentColor="var(--color-primary1)"
        />
        
        <MetricCard
          title="Productos activos"
          subtitle="En catálogo"
          value={loading ? <Skeleton className="h-8 w-20" /> : formatCount(metrics?.totalProducts || 0)}
          icon={Layers}
          accentColor="var(--color-secondary1)"
        />
        
        <MetricCard
          title="Stock bajo"
          subtitle="Requieren reposición"
          value={loading ? <Skeleton className="h-8 w-16" /> : formatCount(stockData?.lowStockItems || 0)}
          icon={AlertTriangle}
          accentColor={(stockData?.lowStockItems || 0) > 5 ? "var(--color-warning)" : "var(--color-success)"}
        />
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Acciones rápidas */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary1">Acciones Rápidas</h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.label}
                    label={action.label}
                    description={action.description}
                    icon={action.icon}
                    to={action.to}
                    variant={action.variant}
                  />
                ))}
              </div>
            </div>

            {/* Alertas de stock */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary1">Alertas de Inventario</h3>
              <div className="rounded-3xl border border-warning/30 bg-warning/10 p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-warning mt-1 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <h4 className="font-semibold text-warning">Atención requerida</h4>
                    <div className="space-y-2 text-sm text-warning/80">
                      <p>• {stockData?.outOfStockItems || 0} productos sin stock</p>
                      <p>• {stockData?.lowStockItems || 0} productos con stock bajo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas del día */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary1">Hoy</h3>
              <div className="space-y-4">
                <MetricCard
                  title="Visitantes"
                  value="127"
                  icon={Users}
                  size="small"
                  accentColor="var(--color-primary3)"
                />
                <MetricCard
                  title="Conversión"
                  value="2.4%"
                  icon={TrendingUp}
                  size="small"
                  trend="up"
                  trendValue="0.3%"
                  accentColor="var(--color-success)"
                />
                <MetricCard
                  title="Actividad"
                  value="84%"
                  icon={Activity}
                  size="small"
                  accentColor="var(--color-secondary2)"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Ventas */}
        <TabsContent value="sales">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Análisis de ventas */}
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Análisis mensual</p>
                  <h2 className="text-2xl font-semibold text-primary1">Reporte de Ventas</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Calendar className="h-4 w-4" />
                  Noviembre 2025
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <MetricCard
                    title="Mes actual"
                    value={formatCurrencyCLP(metrics.monthlyRevenue)}
                    trend={metrics.growthPercentage >= 0 ? "up" : "down"}
                    trendValue={`${Math.abs(metrics.growthPercentage).toFixed(1)}%`}
                    size="small"
                  />
                  <MetricCard
                    title="Mes anterior"
                    value={formatCurrencyCLP(metrics.previousMonthRevenue)}
                    subtitle="Octubre 2025"
                    size="small"
                  />
                </div>

                {/* Top categorías */}
                <div>
                  <h4 className="font-semibold text-neutral-700 mb-4">Categorías más vendidas</h4>
                  {categories.length > 0 ? (
                    <div className="space-y-3">
                      {categories.slice(0, 4).map((category, index) => (
                        <div
                          key={category.id || index}
                          className="flex items-center justify-between rounded-2xl border border-(--color-border) bg-(--color-neutral4) p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary1 text-xs font-semibold text-white">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-neutral-800">{category.name || 'Sin nombre'}</p>
                              <p className="text-xs text-neutral-500">{category.orders || 0} pedidos</p>
                            </div>
                          </div>
                          <p className="font-semibold text-neutral-800">
                            {formatCurrencyCLP(category.revenue || 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-neutral-500">No hay datos de categorías</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[color:var(--color-border)]">
                <Button appearance="ghost" intent="primary" size="sm" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver reporte completo
                </Button>
              </div>
            </div>

            {/* Métricas de rendimiento */}
            <div className="space-y-6">
              <MetricCard
                title="Ticket promedio"
                subtitle="Por pedido"
                value={
                  (metrics?.totalOrders || 0) > 0 
                    ? formatCurrencyCLP(Math.round((metrics?.totalRevenue || 0) / (metrics?.totalOrders || 1))) 
                    : "$0"
                }
                icon={DollarSign}
                size="large"
                accentColor="var(--color-primary2)"
              />

              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  title="Conversión"
                  value="2.4%"
                  subtitle="Visitante a compra"
                  icon={TrendingUp}
                  size="small"
                  accentColor="var(--color-success)"
                />
                <MetricCard
                  title="Clientes"
                  value={formatCount(metrics?.totalCustomers || 0)}
                  subtitle="Únicos"
                  icon={Users}
                  size="small"
                  accentColor="var(--color-secondary1)"
                />
              </div>

              <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6">
                <h4 className="font-semibold text-neutral-700 mb-4">Progreso del mes</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Meta mensual</span>
                    <span className="font-semibold text-neutral-800">56%</span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-200">
                    <div className="h-full w-[56%] rounded-full bg-primary1"></div>
                  </div>
                  <p className="text-xs text-neutral-500">17 días de 30 días del mes</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Productos */}
        <TabsContent value="products">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-primary1">Productos Destacados</h2>
              <Button appearance="solid" intent="primary" to={API_PATHS.admin.products}>
                Ver todos los productos
              </Button>
            </div>

            {topProducts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id || index}
                    className="group relative overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-neutral1) transition-all hover:shadow-(--shadow-lg)"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name || 'Producto'}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-200">
                          <Package className="h-12 w-12 text-neutral-400" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-neutral-800">
                          <Star className="h-3 w-3" />
                          #{index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-neutral-800 line-clamp-2">
                          {product.name || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">{product.sku || 'N/A'}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary1">
                          {formatCurrencyCLP(product.price || 0)}
                        </span>
                        <span className="text-success font-semibold">
                          {product.conversionRate || 0}% conv.
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Eye className="h-4 w-4" />
                          <span>{product.views || 0} vistas</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <ShoppingCart className="h-4 w-4" />
                          <span>{product.sales || 0} ventas</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500">Rendimiento</span>
                          <span className="font-semibold text-neutral-700">
                            {(product.views || 0) > 0 
                              ? Math.round(((product.sales || 0) / (product.views || 1)) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-neutral-200">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-primary1 to-primary3"
                            style={{
                              width: `${Math.min(100, ((product.sales || 0) / (product.views || 1)) * 100 * 20)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-lg text-neutral-600">No hay productos destacados</p>
                <p className="text-sm text-neutral-500">Los productos más vendidos aparecerán aquí</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Operaciones */}
        <TabsContent value="operations">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pedidos recientes */}
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-primary1">Últimos Pedidos</h2>
                  <p className="text-sm text-neutral-500">Actividad reciente</p>
                </div>
                <Button size="sm" onClick={handleRefresh}>
                  <Clock className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`order-skeleton-${idx}`}
                      className="flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral2)] p-4"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length ? (
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div
                      key={order.id ?? order.number ?? index}
                      className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4 transition-colors hover:bg-(--color-neutral3)"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary4">
                        <Package className="h-5 w-5 text-primary1" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-800">
                          Pedido #{order.number || order.id || 'N/A'}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {formatDate_ddMMyyyy(order.createdAt, "—")} · {formatCurrencyCLP(order.total || 0)}
                        </p>
                      </div>
                      <StatusPill status={order.status || 'pending'} domain="order" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">No hay pedidos recientes</p>
                </div>
              )}
            </div>

            {/* Estado operativo */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral1)] p-6">
                <h3 className="text-lg font-semibold text-primary1 mb-4">Estado Operativo</h3>
                <div className="space-y-4">
                  <MetricCard
                    title="Pedidos activos"
                    value={formatCount(metrics?.totalOrders || 0)}
                    icon={Activity}
                    size="small"
                  />
                  <MetricCard
                    title="Envíos pendientes"
                    value="12"
                    icon={Truck}
                    size="small"
                    accentColor="var(--color-warning)"
                  />
                  <MetricCard
                    title="Stock crítico"
                    value={formatCount(stockData?.lowStockItems || 0)}
                    icon={AlertTriangle}
                    size="small"
                    accentColor="var(--color-error)"
                  />
                </div>
              </div>

            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
