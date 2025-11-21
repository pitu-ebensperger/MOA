import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Activity,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  TrendingDown,
  RefreshCw,
  Calendar,
  Truck,
  Eye,
  BarChart3,
} from "@icons/lucide";

import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard.js";
import { Button } from "@/components/ui/Button.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { StatusPill } from "@/components/ui/StatusPill.jsx";
import { LineChart, BarChart, AreaChart, PieChart } from "@/components/charts/index.js";
import { formatCurrencyCLP } from "@/utils/currency.js";
import { formatDate_ddMMyyyy } from "@/utils/date.js";
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";
import { API_PATHS } from "@/config/api-paths.js";

const formatCount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("es-CL");
};

// Metric Card Component
const MetricCard = (props) => {
  const {
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    trendLabel,
    className,
    accentColor,
    loading,
  } = props;
  return (
    <div
      className={`rounded-3xl border border-(--color-border) bg-(--color-neutral1) p-6 shadow-(--shadow-sm) transition-all hover:shadow-(--shadow-md) ${className}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          {subtitle && <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className="rounded-2xl p-3"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-(--text-strong)">{value}</div>

          {trend && trendValue && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-(--color-success)" />
              ) : (
                <TrendingDown className="h-4 w-4 text-(--color-error)" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-(--color-success)" : "text-(--color-error)"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-xs text-neutral-500">{trendLabel || "vs mes anterior"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  trend: PropTypes.string,
  trendValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trendLabel: PropTypes.string,
  className: PropTypes.string,
  accentColor: PropTypes.string,
  loading: PropTypes.bool,
};
MetricCard.defaultProps = {
  subtitle: undefined,
  icon: undefined,
  trend: undefined,
  trendValue: undefined,
  trendLabel: undefined,
  className: "",
  accentColor: "var(--color-primary1)",
  loading: false,
};

// Chart Card Wrapper
const ChartCard = (props) => {
  const { title, subtitle, children, loading, action } = props;
  return (
    <div className="rounded-3xl border border-(--color-border) bg-(--color-neutral1) p-6 shadow-(--shadow-sm)">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-(--text-strong)">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-(--text-secondary1)">{subtitle}</p>}
        </div>
        {action}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-neutral-400" />
            <p className="text-sm text-neutral-500">Cargando datos...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};
ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  loading: PropTypes.bool,
  action: PropTypes.node,
};
ChartCard.defaultProps = {
  subtitle: undefined,
  children: undefined,
  loading: false,
  action: undefined,
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  loading: PropTypes.bool,
  action: PropTypes.node,
};

export default function AdminDashboardPage() {
  const { data: dashboardData, isLoading, isError, refetch } = useAdminDashboard();

  const metrics = useMemo(() => dashboardData?.metrics || {}, [dashboardData]);
  const sales = useMemo(() => dashboardData?.sales || {}, [dashboardData]);
  const conversion = useMemo(() => dashboardData?.conversion || {}, [dashboardData]);
  const stock = useMemo(() => dashboardData?.stock || {}, [dashboardData]);
  const topProducts = useMemo(() => dashboardData?.topProducts || [], [dashboardData]);
  const categories = useMemo(() => dashboardData?.categories || [], [dashboardData]);
  const orderDistribution = useMemo(() => dashboardData?.orderDistribution || [], [dashboardData]);
  const recentOrders = useMemo(() => dashboardData?.recentOrders || [], [dashboardData]);

  // Prepare data for charts
  const revenueChartData = useMemo(() => {
    return (sales.dailyRevenue || []).map(item => ({
      date: new Date(item.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
      revenue: item.revenue || 0,
    }));
  }, [sales.dailyRevenue]);

  const categoryRevenueData = useMemo(() => {
    return categories.slice(0, 6).map(cat => ({
      name: cat.name,
      revenue: cat.revenue || 0,
      orders: cat.orders || 0,
    }));
  }, [categories]);

  const orderDistributionData = useMemo(() => {
    return orderDistribution.map(item => ({
      period: item.period,
      orderCount: item.orders || 0,
      revenue: item.revenue || 0,
    }));
  }, [orderDistribution]);

  const conversionTrendData = useMemo(() => {
    return conversion.monthlyTrend || [];
  }, [conversion.monthlyTrend]);

  const stockPieData = useMemo(() => {
    const total = stock.totalItems || 1;
    const healthy = Math.max(0, total - (stock.lowStockCount || 0) - (stock.outOfStockCount || 0));
    return [
      { name: 'Stock Saludable', value: healthy, percentage: ((healthy / total) * 100).toFixed(1) },
      { name: 'Stock Bajo', value: stock.lowStockCount || 0, percentage: (((stock.lowStockCount || 0) / total) * 100).toFixed(1) },
      { name: 'Sin Stock', value: stock.outOfStockCount || 0, percentage: (((stock.outOfStockCount || 0) / total) * 100).toFixed(1) },
    ].filter(item => item.value > 0);
  }, [stock]);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        actions={
          <Button
            appearance="outline"
            intent="primary"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            leadingIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Actualizar
          </Button>
        }
      />

      {/* Error State */}
      {isError && (
        <div className="rounded-3xl border border-error/30 bg-error/[0.06] p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-error" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-error">Error de conexión</h3>
              <p className="mb-4 text-sm text-error/80">
                No se pudieron cargar algunos datos del panel de control.
              </p>
              <Button appearance="ghost" intent="error" size="sm" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos del mes"
          subtitle="Ventas completadas"
          value={formatCurrencyCLP(metrics.monthlyRevenue || 0)}
          icon={DollarSign}
          trend={metrics.growthPercentage >= 0 ? "up" : "down"}
          trendValue={`${Math.abs(metrics.growthPercentage || 0).toFixed(1)}%`}
          accentColor="var(--color-success)"
          loading={isLoading}
        />

        <MetricCard
          title="Pedidos totales"
          subtitle="Órdenes procesadas"
          value={formatCount(metrics.totalOrders || 0)}
          icon={ShoppingCart}
          accentColor="var(--color-primary1)"
          loading={isLoading}
        />

        <MetricCard
          title="Productos activos"
          subtitle="En catálogo"
          value={formatCount(metrics.totalProducts || 0)}
          icon={Package}
          accentColor="var(--color-secondary1)"
          loading={isLoading}
        />

        <MetricCard
          title="Clientes totales"
          subtitle="Usuarios registrados"
          value={formatCount(metrics.totalCustomers || 0)}
          icon={Users}
          accentColor="var(--color-primary2)"
          loading={isLoading}
        />
      </div>

      {/* Charts Row 1 - Revenue and Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Ingresos diarios"
          subtitle="Últimos 30 días"
          loading={isLoading}
          action={
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Calendar className="h-4 w-4" />
              Mes actual
            </div>
          }
        >
          <AreaChart
            data={revenueChartData}
            areas={[{ dataKey: 'revenue', name: 'Ingresos', fillColor: 'var(--color-primary1)', strokeColor: 'var(--color-primary1)' }]}
            xAxisKey="date"
            height={300}
            tooltipFormatter={(value) => formatCurrencyCLP(value)}
            fillOpacity={0.2}
          />
        </ChartCard>

        <ChartCard
          title="Distribución de pedidos"
          subtitle="Por día de la semana"
          loading={isLoading}
        >
          <BarChart
            data={orderDistributionData}
            bars={[{ dataKey: 'orderCount', name: 'Pedidos', useMultiColors: true }]}
            xAxisKey="period"
            height={300}
            barSize={40}
          />
        </ChartCard>
      </div>

      {/* Charts Row 2 - Categories and Conversion */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Top categorías"
          subtitle="Por ingresos"
          loading={isLoading}
          className="lg:col-span-2"
        >
          <BarChart
            data={categoryRevenueData}
            bars={[{ dataKey: 'revenue', name: 'Ingresos' }]}
            xAxisKey="name"
            height={300}
            layout="horizontal"
            tooltipFormatter={(value) => formatCurrencyCLP(value)}
            colors={['var(--color-primary1)', 'var(--color-secondary1)', 'var(--color-primary2)', 'var(--color-secondary2)', 'var(--color-primary3)', 'var(--color-success)']}
          />
        </ChartCard>

        <ChartCard
          title="Estado del inventario"
          subtitle="Distribución actual"
          loading={isLoading}
        >
          <PieChart
            data={stockPieData}
            height={300}
            innerRadius={60}
            colors={['var(--color-success)', 'var(--color-warning)', 'var(--color-error)']}
            showLegend
            showLabels
          />
        </ChartCard>
      </div>

      {/* Detailed Stats Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversion Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-(--text-strong)">Métricas de Conversión</h3>

          <MetricCard
            title="Tasa de conversión"
            value={`${conversion.overallRate || 0}%`}
            subtitle="Visitantes a compradores"
            icon={TrendingUp}
            accentColor="var(--color-success)"
            loading={isLoading}
          />

          <div className="rounded-2xl border border-(--color-border) bg-(--color-neutral1) p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-(--text-strong)">Visitantes</span>
              <span className="text-lg font-bold text-(--color-primary1)">
                {formatCount(conversion.visitorCount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-(--text-strong)">Compradores</span>
              <span className="text-lg font-bold text-(--color-success)">
                {formatCount(conversion.purchaserCount || 0)}
              </span>
            </div>
          </div>

          {conversionTrendData.length > 0 && (
            <div className="rounded-3xl border border-(--color-border) bg-(--color-neutral1) p-4">
              <h4 className="mb-3 text-sm font-semibold text-(--text-strong)">Tendencia mensual</h4>
              <LineChart
                data={conversionTrendData}
                lines={[{ dataKey: 'rate', name: 'Tasa', color: 'var(--color-success)' }]}
                xAxisKey="month"
                height={150}
                showGrid={false}
                tooltipFormatter={(value) => `${value}%`}
                strokeWidth={3}
                dotSize={5}
              />
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-(--text-strong)">Productos Destacados</h3>
            <Button appearance="ghost" intent="primary" size="sm" to={API_PATHS.admin.products}>
              Ver todos
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`skeleton-${i}`} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary1/30 hover:bg-primary4/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary1/10 font-bold text-primary1">
                    #{index + 1}
                  </div>

                  {product.image ? (
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-neutral-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-200">
                      <Package className="h-6 w-6 text-neutral-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-semibold text-(--text-strong)">{product.name}</h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-(--text-secondary1)">
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {product.sales} ventas
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {product.views} vistas
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-(--color-primary1)">
                      {formatCurrencyCLP(product.revenue)}
                    </p>
                    <p className="text-xs text-(--color-success)">
                      {product.conversionRate}% conv.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-(--color-border) bg-(--color-neutral2) p-8 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
              <p className="text-neutral-600">No hay productos destacados</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders and Stock Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <ChartCard
          title="Últimos pedidos"
          subtitle="Actividad reciente"
          loading={isLoading}
          action={
            <Button appearance="ghost" intent="primary" size="sm" to={API_PATHS.admin.orders}>
              Ver todos
            </Button>
          }
        >
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id || order.orden_id}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:bg-neutral-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary4">
                    <Truck className="h-5 w-5 text-primary1" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800">
                      Pedido #{order.orderCode || order.order_code || order.number || order.id}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {formatDate_ddMMyyyy(order.createdAt || order.creado_en, "—")} ·{" "}
                      {formatCurrencyCLP(order.total || (order.total_cents ? order.total_cents / 100 : 0))}
                    </p>
                  </div>
                  <StatusPill status={order.estado_pago || order.status || "pending"} domain="order" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-(--color-border) bg-(--color-neutral2) p-8 text-center">
              <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
              <p className="text-neutral-600">No hay pedidos recientes</p>
            </div>
          )}
        </ChartCard>

        {/* Stock Alerts */}
        <ChartCard title="Alertas de inventario" subtitle="Requieren atención" loading={isLoading}>
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span className="text-sm font-medium text-warning">Stock Bajo</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-warning">
                  {formatCount(stock.lowStockCount || 0)}
                </p>
                <p className="mt-1 text-xs text-warning/70">productos</p>
              </div>

              <div className="rounded-2xl border border-error/30 bg-error/10 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-error" />
                  <span className="text-sm font-medium text-error">Sin Stock</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-error">
                  {formatCount(stock.outOfStockCount || 0)}
                </p>
                <p className="mt-1 text-xs text-error/70">productos</p>
              </div>
            </div>

            {/* Low Stock Products List */}
            {(stock.lowStockProducts?.length > 0 || stock.outOfStockProducts?.length > 0) && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-(--text-strong)">
                  Productos críticos
                </h4>
                <div className="space-y-2">
                  {[...(stock.outOfStockProducts || []).slice(0, 3), ...(stock.lowStockProducts || []).slice(0, 2)].map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-xl bg-white p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-(--text-strong)">
                          {product.name}
                        </p>
                        <p className="text-xs text-(--text-secondary1)">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            product.currentStock === 0 ? "text-error" : "text-warning"
                          }`}
                        >
                          {product.currentStock} unidades
                        </p>
                        <p className="text-xs text-(--text-muted)">
                          {product.status === "out_of_stock" ? "Sin stock" : "Stock bajo"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ticket promedio"
          value={formatCurrencyCLP(sales.averageOrderValue || 0)}
          subtitle="Por pedido"
          icon={BarChart3}
          accentColor="var(--color-primary2)"
          loading={isLoading}
        />

        <MetricCard
          title="Transacciones totales"
          value={formatCount(sales.totalTransactions || 0)}
          subtitle="Este mes"
          icon={Activity}
          accentColor="var(--color-secondary2)"
          loading={isLoading}
        />

        <MetricCard
          title="Productos vendidos"
          value={formatCount(topProducts.reduce((sum, p) => sum + (p.sales || 0), 0))}
          subtitle="Top 5 productos"
          icon={Package}
          accentColor="var(--color-success)"
          loading={isLoading}
        />

        <MetricCard
          title="Categorías activas"
          value={formatCount(categories.length)}
          subtitle="Con ventas"
          icon={TrendingUp}
          accentColor="var(--color-warning)"
          loading={isLoading}
        />
      </div>
    </section>
  );
}
