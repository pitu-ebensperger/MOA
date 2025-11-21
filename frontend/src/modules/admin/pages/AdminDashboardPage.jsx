import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import {
  Activity,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Truck,
  BarChart3,
  Clock,
  Target,
} from "@icons/lucide";

import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard.js";
import { Button } from "@/components/ui/Button.jsx";
import { StatusPill } from "@/components/ui/StatusPill.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs.jsx";
import {
  BarChart,
  AreaChart,
  PieChart,
  AnimatedKPICard,
  SparklineChart,
  ProgressRing,
  HeatMapChart,
  ComparisonCard,
} from "@/components/charts/index.js";
import { formatCurrencyCLP } from "@/utils/currency.js";
import { formatDate_ddMMyyyy } from "@/utils/date.js";
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";

const formatCount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toLocaleString("es-CL");
};

// Componente de Card envolvente para gráficos
const ChartCard = ({ title, subtitle, children, loading, action, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`rounded-3xl border border-(--color-border) bg-(--color-neutral1) p-6 shadow-(--shadow-sm) ${className}`}
  >
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-(--text-strong)">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-(--text-secondary1)">{subtitle}</p>}
      </div>
      {action}
    </div>

    {loading ? (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    ) : (
      children
    )}
  </motion.div>
);

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  loading: PropTypes.bool,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: dashboardData, isLoading, isError, refetch } = useAdminDashboard();

  const metrics = useMemo(() => dashboardData?.metrics || {}, [dashboardData]);
  const sales = useMemo(() => dashboardData?.sales || {}, [dashboardData]);
  const conversion = useMemo(() => dashboardData?.conversion || {}, [dashboardData]);
  const stock = useMemo(() => dashboardData?.stock || {}, [dashboardData]);
  const topProducts = useMemo(() => dashboardData?.topProducts || [], [dashboardData]);
  const categories = useMemo(() => dashboardData?.categories || [], [dashboardData]);
  const orderDistribution = useMemo(() => dashboardData?.orderDistribution || [], [dashboardData]);
  const recentOrders = useMemo(() => dashboardData?.recentOrders || [], [dashboardData]);

  // Prepare chart data
  const revenueChartData = useMemo(() => {
    return (sales.dailyRevenue || []).map((item) => ({
      date: new Date(item.date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" }),
      revenue: item.revenue || 0,
    }));
  }, [sales.dailyRevenue]);

  const categoryRevenueData = useMemo(() => {
    return categories.slice(0, 6).map((cat) => ({
      name: cat.name,
      revenue: cat.revenue || 0,
      orders: cat.orders || 0,
    }));
  }, [categories]);

  const orderDistributionData = useMemo(() => {
    return orderDistribution.map((item) => ({
      period: item.period,
      orderCount: item.orders || 0,
      revenue: item.revenue || 0,
    }));
  }, [orderDistribution]);

  const stockPieData = useMemo(() => {
    const total = stock.totalItems || 1;
    const healthy = Math.max(0, total - (stock.lowStockCount || 0) - (stock.outOfStockCount || 0));
    return [
      { name: "Stock Saludable", value: healthy, percentage: ((healthy / total) * 100).toFixed(1), color: "var(--color-success)" },
      { name: "Stock Bajo", value: stock.lowStockCount || 0, percentage: (((stock.lowStockCount || 0) / total) * 100).toFixed(1), color: "var(--color-warning)" },
      { name: "Sin Stock", value: stock.outOfStockCount || 0, percentage: (((stock.outOfStockCount || 0) / total) * 100).toFixed(1), color: "var(--color-error)" },
    ].filter((item) => item.value > 0);
  }, [stock]);

  // Mock data para heatmap (simulando actividad por día/hora)
  const heatmapData = useMemo(() => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const hours = ["9-12", "12-15", "15-18", "18-21"];
    return days.map(() =>
      hours.map(() => ({
        value: Math.floor(Math.random() * 100),
      }))
    );
  }, []);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        className="gap-4"
        actions={
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="inline-flex w-full flex-wrap gap-2 sm:w-auto">
                <TabsTrigger value="overview">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <Activity className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="products">
                  <Package className="mr-2 h-4 w-4" />
                  Productos
                </TabsTrigger>
                <TabsTrigger value="customers">
                  <Users className="mr-2 h-4 w-4" />
                  Clientes
                </TabsTrigger>
                <TabsTrigger value="operations">
                  <Truck className="mr-2 h-4 w-4" />
                  Operaciones
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              appearance="outline"
              intent="primary"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              leadingIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Actualizar
            </Button>
          </div>
        }
      />

      {/* Error State */}
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-error/30 bg-error/[0.06] p-6"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-error" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-error">Error de conexión</h3>
              <p className="mb-4 text-sm text-error/80">No se pudieron cargar algunos datos del panel de control.</p>
              <Button appearance="ghost" intent="error" size="sm" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <AnimatePresence mode="wait">
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Main Metrics with Animation */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AnimatedKPICard
                  title="Ingresos del mes"
                  value={metrics.monthlyRevenue || 0}
                  previousValue={metrics.previousMonthRevenue || 0}
                  icon={DollarSign}
                  trend
                  prefix="$"
                  color="var(--color-success)"
                  loading={isLoading}
                  delay={0}
                />

                <AnimatedKPICard
                  title="Pedidos totales"
                  value={metrics.totalOrders || 0}
                  icon={ShoppingCart}
                  color="var(--color-primary1)"
                  loading={isLoading}
                  delay={0.1}
                />

                <AnimatedKPICard
                  title="Productos activos"
                  value={metrics.totalProducts || 0}
                  icon={Package}
                  color="var(--color-secondary1)"
                  loading={isLoading}
                  delay={0.2}
                />

                <AnimatedKPICard
                  title="Clientes totales"
                  value={metrics.totalCustomers || 0}
                  icon={Users}
                  color="var(--color-primary2)"
                  loading={isLoading}
                  delay={0.3}
                />
              </div>

              {/* Charts Row 1 */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Ingresos diarios" subtitle="Últimos 30 días" loading={isLoading}>
                  <AreaChart
                    data={revenueChartData}
                    areas={[
                      {
                        dataKey: "revenue",
                        name: "Ingresos",
                        fillColor: "var(--color-primary1)",
                        strokeColor: "var(--color-primary1)",
                      },
                    ]}
                    xAxisKey="date"
                    height={300}
                    tooltipFormatter={(value) => formatCurrencyCLP(value)}
                    fillOpacity={0.2}
                  />
                </ChartCard>

                <ChartCard title="Distribución de pedidos" subtitle="Por día de la semana" loading={isLoading}>
                  <BarChart
                    data={orderDistributionData}
                    bars={[{ dataKey: "orderCount", name: "Pedidos", useMultiColors: true }]}
                    xAxisKey="period"
                    height={300}
                    barSize={40}
                  />
                </ChartCard>
              </div>

              {/* Stock & Categories */}
              <div className="grid gap-6 lg:grid-cols-3">
                <ChartCard title="Top categorías" subtitle="Por ingresos" loading={isLoading} className="lg:col-span-2">
                  <BarChart
                    data={categoryRevenueData}
                    bars={[{ dataKey: "revenue", name: "Ingresos" }]}
                    xAxisKey="name"
                    height={300}
                    layout="horizontal"
                    tooltipFormatter={(value) => formatCurrencyCLP(value)}
                    colors={[
                      "var(--color-primary1)",
                      "var(--color-secondary1)",
                      "var(--color-primary2)",
                      "var(--color-secondary2)",
                      "var(--color-primary3)",
                      "var(--color-success)",
                    ]}
                  />
                </ChartCard>

                <ChartCard title="Estado del inventario" subtitle="Distribución actual" loading={isLoading}>
                  <PieChart
                    data={stockPieData}
                    height={300}
                    innerRadius={60}
                    showLegend
                    showLabels
                  />
                </ChartCard>
              </div>

              {/* Top Products with Sparklines */}
              <ChartCard title="Productos Destacados" loading={isLoading}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topProducts.slice(0, 6).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4 transition-all hover:shadow-(--shadow-md)"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-(--text-strong)">{product.name}</h4>
                          <p className="mt-1 text-xs text-(--text-muted)">{product.sales} ventas</p>
                        </div>
                        <SparklineChart
                          data={[...new Array(7)].map(() => Math.random() * 100 + 50)}
                          width={60}
                          height={30}
                          color="var(--color-primary1)"
                          fillColor="var(--color-primary1)"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-(--color-primary1)">{formatCurrencyCLP(product.revenue)}</span>
                        <span className="text-xs text-(--color-success)">{product.conversionRate}% conv.</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ChartCard>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnimatePresence mode="wait">
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Comparison Cards */}
              <div className="grid gap-6 lg:grid-cols-3">
                <ComparisonCard
                  title="Ingresos"
                  currentValue={metrics.monthlyRevenue || 0}
                  previousValue={metrics.previousMonthRevenue || 0}
                  formatter={formatCurrencyCLP}
                  color="var(--color-success)"
                  delay={0}
                />

                <ComparisonCard
                  title="Pedidos"
                  currentValue={sales.totalTransactions || 0}
                  previousValue={Math.floor((sales.totalTransactions || 0) * 0.85)}
                  color="var(--color-primary1)"
                  delay={0.1}
                />

                <ComparisonCard
                  title="Ticket Promedio"
                  currentValue={sales.averageOrderValue || 0}
                  previousValue={Math.floor((sales.averageOrderValue || 0) * 0.92)}
                  formatter={formatCurrencyCLP}
                  color="var(--color-secondary1)"
                  delay={0.2}
                />
              </div>

              {/* Conversion & Activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Tasa de Conversión" subtitle="Mensual" loading={isLoading}>
                  <div className="flex items-center justify-center py-8">
                    <ProgressRing
                      progress={conversion.overallRate || 0}
                      size={200}
                      strokeWidth={16}
                      color="var(--color-success)"
                      label="Conversión"
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-(--color-neutral2) p-4">
                    <div>
                      <p className="text-sm text-(--text-muted)">Visitantes</p>
                      <p className="mt-1 text-2xl font-bold text-(--text-strong)">{formatCount(conversion.visitorCount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-(--text-muted)">Compradores</p>
                      <p className="mt-1 text-2xl font-bold text-(--color-success)">{formatCount(conversion.purchaserCount || 0)}</p>
                    </div>
                  </div>
                </ChartCard>

                <ChartCard title="Actividad por horario" subtitle="Patrones de compra" loading={isLoading}>
                  <HeatMapChart
                    data={heatmapData}
                    xLabels={["9-12", "12-15", "15-18", "18-21"]}
                    yLabels={["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}
                    showValues
                    cellSize={45}
                  />
                </ChartCard>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <AnimatePresence mode="wait">
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Product Metrics */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AnimatedKPICard
                  title="Productos totales"
                  value={metrics.totalProducts || 0}
                  icon={Package}
                  color="var(--color-primary1)"
                  loading={isLoading}
                />

                <AnimatedKPICard
                  title="Stock saludable"
                  value={stock.totalItems - stock.lowStockCount - stock.outOfStockCount || 0}
                  icon={Target}
                  color="var(--color-success)"
                  loading={isLoading}
                  delay={0.1}
                />

                <AnimatedKPICard
                  title="Stock bajo"
                  value={stock.lowStockCount || 0}
                  icon={AlertTriangle}
                  color="var(--color-warning)"
                  loading={isLoading}
                  delay={0.2}
                />

                <AnimatedKPICard
                  title="Sin stock"
                  value={stock.outOfStockCount || 0}
                  icon={AlertTriangle}
                  color="var(--color-error)"
                  loading={isLoading}
                  delay={0.3}
                />
              </div>

              {/* Product Performance */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Top Productos por Ingresos" loading={isLoading}>
                  <BarChart
                    data={topProducts.slice(0, 8).map((p) => ({ name: p.name, value: p.revenue }))}
                    bars={[{ dataKey: "value", name: "Ingresos" }]}
                    xAxisKey="name"
                    height={350}
                    layout="horizontal"
                    tooltipFormatter={formatCurrencyCLP}
                    colors={["var(--color-primary1)", "var(--color-secondary1)", "var(--color-primary2)"]}
                  />
                </ChartCard>

                <ChartCard title="Categorías Performance" loading={isLoading}>
                  <PieChart
                    data={categories.slice(0, 6).map((cat) => ({
                      name: cat.name,
                      value: cat.revenue,
                      percentage: ((cat.revenue / categories.reduce((sum, c) => sum + c.revenue, 0)) * 100).toFixed(1),
                    }))}
                    height={350}
                    innerRadius={70}
                    showLegend
                    tooltipFormatter={formatCurrencyCLP}
                  />
                </ChartCard>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <AnimatePresence mode="wait">
            <motion.div
              key="customers"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Customer Metrics */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AnimatedKPICard
                  title="Total Clientes"
                  value={metrics.totalCustomers || 0}
                  icon={Users}
                  color="var(--color-primary1)"
                  loading={isLoading}
                />

                <AnimatedKPICard
                  title="Compradores activos"
                  value={conversion.purchaserCount || 0}
                  icon={ShoppingCart}
                  color="var(--color-success)"
                  loading={isLoading}
                  delay={0.1}
                />

                <AnimatedKPICard
                  title="Tasa conversión"
                  value={conversion.overallRate || 0}
                  suffix="%"
                  icon={TrendingUp}
                  color="var(--color-secondary1)"
                  loading={isLoading}
                  delay={0.2}
                />

                <AnimatedKPICard
                  title="Ticket promedio"
                  value={sales.averageOrderValue || 0}
                  prefix="$"
                  icon={DollarSign}
                  color="var(--color-primary2)"
                  loading={isLoading}
                  delay={0.3}
                />
              </div>

              {/* Customer Insights */}
              <div className="grid gap-6 lg:grid-cols-3">
                <ChartCard title="Segmentación de Clientes" loading={isLoading}>
                  <div className="flex flex-col items-center justify-center py-6">
                    <ProgressRing
                      progress={((conversion.purchaserCount || 0) / (metrics.totalCustomers || 1)) * 100}
                      size={180}
                      strokeWidth={14}
                      color="var(--color-primary1)"
                      label="Compradores"
                    />
                    <div className="mt-6 grid w-full grid-cols-2 gap-3">
                      <div className="rounded-xl bg-(--color-primary4)/20 p-3 text-center">
                        <p className="text-xs text-(--text-muted)">Activos</p>
                        <p className="mt-1 text-lg font-bold text-(--color-primary1)">{conversion.purchaserCount || 0}</p>
                      </div>
                      <div className="rounded-xl bg-(--color-neutral3) p-3 text-center">
                        <p className="text-xs text-(--text-muted)">Inactivos</p>
                        <p className="mt-1 text-lg font-bold text-(--text-secondary1)">
                          {(metrics.totalCustomers || 0) - (conversion.purchaserCount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </ChartCard>

                <ChartCard title="Preferencias de Categorías" loading={isLoading} className="lg:col-span-2">
                  <BarChart
                    data={categories.slice(0, 5).map((cat) => ({
                      name: cat.name,
                      ordenes: cat.orders,
                      ingresos: cat.revenue,
                    }))}
                    bars={[
                      { dataKey: "ordenes", name: "Órdenes", color: "var(--color-primary1)" },
                      { dataKey: "ingresos", name: "Ingresos", color: "var(--color-success)" },
                    ]}
                    xAxisKey="name"
                    height={300}
                    showLegend
                  />
                </ChartCard>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations">
          <AnimatePresence mode="wait">
            <motion.div
              key="operations"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Operations Metrics */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AnimatedKPICard
                  title="Órdenes totales"
                  value={metrics.totalOrders || 0}
                  icon={Package}
                  color="var(--color-primary1)"
                  loading={isLoading}
                />

                <AnimatedKPICard
                  title="En proceso"
                  value={metrics.orderStatusCounts?.processing || 0}
                  icon={Clock}
                  color="var(--color-warning)"
                  loading={isLoading}
                  delay={0.1}
                />

                <AnimatedKPICard
                  title="Enviados"
                  value={metrics.orderStatusCounts?.shipped || 0}
                  icon={Truck}
                  color="var(--color-secondary1)"
                  loading={isLoading}
                  delay={0.2}
                />

                <AnimatedKPICard
                  title="Completados"
                  value={metrics.orderStatusCounts?.delivered || 0}
                  icon={Target}
                  color="var(--color-success)"
                  loading={isLoading}
                  delay={0.3}
                />
              </div>

              {/* Recent Orders & Stock Alerts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Últimos pedidos" subtitle="Actividad reciente" loading={isLoading}>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.map((order, index) => (
                        <motion.div
                          key={order.id || order.orden_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary4">
                            <Truck className="h-5 w-5 text-primary1" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-(--text-strong)">
                              Pedido #{order.orderCode || order.order_code || order.number || order.id}
                            </p>
                            <p className="text-sm text-(--text-muted)">
                              {formatDate_ddMMyyyy(order.createdAt || order.creado_en, "—")} · {formatCurrencyCLP(order.total || 0)}
                            </p>
                          </div>
                          <StatusPill status={order.estado_pago || order.status || "pending"} domain="order" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center">
                      <p className="text-(--text-muted)">No hay pedidos recientes</p>
                    </div>
                  )}
                </ChartCard>

                <ChartCard title="Alertas de inventario" subtitle="Requieren atención" loading={isLoading}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl border border-warning/30 bg-warning/10 p-4"
                      >
                        <AlertTriangle className="mb-2 h-6 w-6 text-warning" />
                        <p className="text-2xl font-bold text-warning">{stock.lowStockCount || 0}</p>
                        <p className="text-xs text-warning/70">Stock bajo</p>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-error/30 bg-error/10 p-4"
                      >
                        <AlertTriangle className="mb-2 h-6 w-6 text-error" />
                        <p className="text-2xl font-bold text-error">{stock.outOfStockCount || 0}</p>
                        <p className="text-xs text-error/70">Sin stock</p>
                      </motion.div>
                    </div>

                    {(stock.lowStockProducts?.length > 0 || stock.outOfStockProducts?.length > 0) && (
                      <div className="rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4">
                        <h4 className="mb-3 text-sm font-semibold text-(--text-strong)">Productos críticos</h4>
                        <div className="space-y-2">
                          {[...(stock.outOfStockProducts || []).slice(0, 3), ...(stock.lowStockProducts || []).slice(0, 2)].map(
                            (product, index) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex items-center justify-between rounded-xl bg-white p-3"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-(--text-strong)">{product.name}</p>
                                  <p className="text-xs text-(--text-muted)">{product.sku}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-bold ${product.currentStock === 0 ? "text-error" : "text-warning"}`}>
                                    {product.currentStock} unidades
                                  </p>
                                </div>
                              </motion.div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ChartCard>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </section>
  );
}
