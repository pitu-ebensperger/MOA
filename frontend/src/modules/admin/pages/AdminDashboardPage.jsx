<<<<<<< HEAD
import { UserCog } from 'lucide-react';


export default function AdminDashboardPage() {
    return (
        <div className="admin-dashboard-page max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center mb-8">
                <UserCog className="icon-admin-dashboard size-8 mr-4 text-primary-600" />
                <h1 className="text-3xl font-semibold">Panel de Administración</h1>
            </div>
            <p className="text-lg text-gray-700">
                Bienvenido al panel de administración. Aquí puedes gestionar usuarios, productos, pedidos y más.
            </p>
        </div>
    );
}
=======
import { Box, ClipboardList, DollarSign, Package, Users } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import { customersDb } from "../../../mocks/database/customers.js";
import { ordersDb } from "../../../mocks/database/orders.js";
import { PRODUCTS } from "../../../mocks/database/products.js";

const STATUS_BADGES = {
  fulfilled: { label: "Completado", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  processing: { label: "En preparación", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  pending: { label: "Pendiente", badge: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  canceled: { label: "Cancelado", badge: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  delivered: { label: "Despachado", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const DEFAULT_STATUS_BADGE = {
  label: "Pendiente",
  badge: "bg-neutral-100 text-neutral-700",
  dot: "bg-neutral-400",
};

const formatCurrency = (value = 0) => {
  const cleaned = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(cleaned);
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
};

const getStatusBadge = (status) => STATUS_BADGES[status] ?? DEFAULT_STATUS_BADGE;

export default function AdminDashboardPage() {
  const orders = ordersDb?.orders ?? [];
  const orderItems = ordersDb?.orderItems ?? [];
  const customers = customersDb?.users ?? [];
  const shippingMap = Object.fromEntries((ordersDb?.shipping ?? []).map((shipment) => [shipment.id, shipment]));

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const criticalProducts = PRODUCTS.filter(
    (product) => typeof product.stock === "number" && product.stock <= 8,
  );

  const lowStockProducts = [...PRODUCTS]
    .filter((product) => typeof product.stock === "number")
    .sort((a, b) => (a.stock ?? Infinity) - (b.stock ?? Infinity))
    .slice(0, 4);

  const latestOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const latestCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const orderItemsMap = orderItems.reduce((map, item) => {
    if (!map[item.orderId]) {
      map[item.orderId] = [];
    }
    map[item.orderId].push(item);
    return map;
  }, {});

  const orderStatusCounts = orders.reduce((acc, order) => {
    const status = order.status ?? "pending";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const orderStatusBreakdown = Object.entries(orderStatusCounts);

  const summaryMetrics = [
    {
      label: "Ventas totales",
      value: formatCurrency(totalRevenue),
      helper: averageOrderValue
        ? `Promedio ${formatCurrency(averageOrderValue)}`
        : "Sin datos por ahora",
      icon: <DollarSign className="size-5 text-neutral-500" aria-hidden />,
    },
    {
      label: "Pedidos procesados",
      value: `${totalOrders}`,
      helper: "Últimos 30 días",
      icon: <Package className="size-5 text-neutral-500" aria-hidden />,
    },
    {
      label: "Clientes registrados",
      value: `${customers.length}`,
      helper: "Base autenticada",
      icon: <Users className="size-5 text-neutral-500" aria-hidden />,
    },
    {
      label: "Stock crítico",
      value: `${criticalProducts.length}`,
      helper: `${lowStockProducts.length} productos monitoreados`,
      icon: <Box className="size-5 text-neutral-500" aria-hidden />,
    },
  ];

  const quickActions = [
    {
      label: "Agregar producto",
      description: "Registrar una nueva referencia en el catálogo.",
      icon: <Box className="size-4 text-neutral-500" aria-hidden />,
      variant: "primary",
      cta: "Abrir",
    },
    {
      label: "Revisar pedidos",
      description: "Abrir la lista completa de pedidos y filtros.",
      icon: <ClipboardList className="size-4 text-neutral-500" aria-hidden />,
      variant: "ghost",
      cta: "Revisar",
    },
    {
      label: "Contactar clientes VIP",
      description: "Enviar comunicación a los contactos destacados.",
      icon: <Users className="size-4 text-neutral-500" aria-hidden />,
      variant: "ghost",
      cta: "Contactar",
    },
  ];

  return (
    <main className="admin-dashboard-page min-h-full bg-[var(--color-light)] pt-[5.5rem] pb-16">
      <div className="mx-auto max-w-7xl space-y-8 px-6">
        <section className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-[0_20px_45px_rgba(68,49,20,0.07)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">Administración</p>
            <h1 className="text-3xl font-semibold text-neutral-900">Panel de inteligencia</h1>
            <p className="text-sm text-neutral-500">
              Monitorea ventas, inventario y clientes en un mismo tablero. Los datos provienen directamente del
              entorno de simulación.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" className="uppercase tracking-wide">
              Exportar
            </Button>
            <Button variant="primary" size="sm" className="uppercase tracking-wide">
              Nuevo reporte
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-3xl bg-white p-5 shadow-[0_15px_30px_rgba(68,49,20,0.05)]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-neutral-100 p-2">{metric.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Hoy</span>
              </div>
              <p className="mt-6 text-3xl font-semibold text-neutral-900">{metric.value}</p>
              <p className="text-sm text-neutral-500">{metric.label}</p>
              <p className="mt-1 text-xs text-neutral-400">{metric.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
          <article className="rounded-3xl bg-white p-6 shadow-[0_20px_40px_rgba(68,49,20,0.08)]">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Pedidos recientes</p>
                <h2 className="text-xl font-semibold text-neutral-900">Actividad destacada</h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Últimos 3</span>
            </header>

            <div className="space-y-4">
              {latestOrders.length > 0 ? (
                latestOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const items = orderItemsMap[order.id] ?? [];
                  const itemLabel = items.length
                    ? items.map((item) => `${item.quantity}× ${item.name}`).join(", ")
                    : "Sin detalle de artículos.";
                  const shipment = shippingMap[order.shipmentId ?? ""];

                  return (
                    <div
                      key={order.id}
                      className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-[var(--color-lightest2)]/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{order.number}</p>
                        <p className="text-xs text-neutral-500">
                          {formatDate(order.createdAt)} · {shipment?.carrier ?? "Logística interna"}
                        </p>
                        <p className="mt-2 text-xs text-neutral-500">{itemLabel}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-lg font-semibold text-neutral-900">{formatCurrency(order.total)}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.badge}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-neutral-500">No hay pedidos para mostrar.</p>
              )}
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-neutral-400">
              Última sincronización: {formatDate(orders[0]?.updatedAt)}
            </p>
          </article>

          <article className="flex flex-col rounded-3xl bg-white p-6 shadow-[0_20px_40px_rgba(68,49,20,0.08)]">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Resumen</p>
                <h2 className="text-xl font-semibold text-neutral-900">Operaciones en curso</h2>
              </div>
              <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-500">
                {totalOrders} pedidos
              </span>
            </header>

            <div className="mt-6 space-y-4">
              {orderStatusBreakdown.length > 0 ? (
                orderStatusBreakdown.map(([status, count]) => {
                  const badge = getStatusBadge(status);
                  const percentage = totalOrders ? Math.round((count / totalOrders) * 100) : 0;
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between gap-3 border-b border-dashed border-neutral-200 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                        <span className={`h-2 w-2 rounded-full ${badge.dot}`} aria-hidden />
                        <span>{badge.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-neutral-900">{count}</span>
                        <span className="text-xs text-neutral-400">{percentage}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-neutral-500">Sin actividad registrada todavía.</p>
              )}
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Clientes recientes</p>
              <div className="mt-3 space-y-3">
                {latestCustomers.length > 0 ? (
                  latestCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">{customer.email}</p>
                      </div>
                      <span className="text-xs text-neutral-400">{formatDate(customer.createdAt)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">Sin clientes nuevos.</p>
                )}
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 shadow-[0_20px_40px_rgba(68,49,20,0.08)]">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Inventario</p>
                <h2 className="text-xl font-semibold text-neutral-900">Productos con stock más bajo</h2>
              </div>
              <span className="text-xs text-neutral-500">{criticalProducts.length} críticos</span>
            </header>

            <ul className="mt-5 space-y-4">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-rose-600">{product.stock} uds</p>
                    <p className="text-xs text-neutral-400">Actualizado {formatDate(product.updatedAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-[0_20px_40px_rgba(68,49,20,0.08)]">
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Acciones rápidas</p>
              <h2 className="text-xl font-semibold text-neutral-900">Mantén todo al día</h2>
            </header>

            <div className="mt-6 space-y-5">
              {quickActions.map((action) => (
                <div key={action.label} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                      {action.icon}
                      <span>{action.label}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{action.description}</p>
                  </div>
                  <Button variant={action.variant} size="sm" className="uppercase tracking-wide">
                    {action.cta}
                  </Button>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
>>>>>>> parent of c47310b... admin y carro
