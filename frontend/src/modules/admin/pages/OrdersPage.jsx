import { formatCurrencyCLP } from "../../../utils/currency.js";
import { formatDate_ddMMyyyy } from "../../../utils/date.js";
import { ordersDb } from "../../../mocks/database/orders.js";

const STATUS_BADGES = {
  fulfilled: { label: "Completado", classes: "text-emerald-600 bg-emerald-50" },
  processing: { label: "En preparación", classes: "text-amber-600 bg-amber-50" },
  pending: { label: "Pendiente", classes: "text-sky-600 bg-sky-50" },
  canceled: { label: "Cancelado", classes: "text-rose-600 bg-rose-50" },
  delivered: { label: "Despachado", classes: "text-emerald-600 bg-emerald-50" },
};

const getStatusBadge = (status) => STATUS_BADGES[status] ?? { label: "Pendiente", classes: "text-neutral-600 bg-neutral-100" };

export default function OrdersPage() {
  const orders = ordersDb?.orders ?? [];
  const orderItems = ordersDb?.orderItems ?? [];
  const shipping = ordersDb?.shipping ?? [];

  const orderItemsMap = orderItems.reduce((map, item) => {
    if (!map[item.orderId]) map[item.orderId] = [];
    map[item.orderId].push(item);
    return map;
  }, {});

  const shippingMap = shipping.reduce((map, shipment) => {
    map[shipment.id] = shipment;
    return map;
  }, {});

  const revenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(0,0,0,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Pedidos</p>
        <h1 className="text-2xl font-semibold text-neutral-900">Revisión rápida</h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Pedidos registrados</p>
            <p className="text-3xl font-semibold text-neutral-900">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Ingresos</p>
            <p className="text-3xl font-semibold text-neutral-900">{formatCurrencyCLP(revenue)}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Última actualización</p>
            <p className="text-3xl font-semibold text-neutral-900">
              {formatDate_ddMMyyyy(orders[0]?.updatedAt, "-")}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Lista</p>
          <h2 className="text-xl font-semibold text-neutral-900">Pedidos recientes</h2>
        </header>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-500">No hay pedidos registrados.</p>
          ) : (
            orders.map((order) => {
              const badge = getStatusBadge(order.status);
              const items = orderItemsMap[order.id] ?? [];
              const shipment = shippingMap[order.shipmentId];

              return (
                <article
                  key={order.id}
                  className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{order.number}</p>
                      <p className="text-xs text-neutral-500">
                        {formatDate_ddMMyyyy(order.createdAt, "-")} · {order.currency}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-neutral-500 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Total</p>
                      <p className="text-lg font-semibold text-neutral-900">{formatCurrencyCLP(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Envío</p>
                      <p>{shipment?.carrier ?? "Logística interna"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Items</p>
                      <p>{items.length} artículo(s)</p>
                    </div>
                  </div>
                  {items.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                      {items.map((item) => (
                        <li key={`${order.id}-${item.productId}`} className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-xs text-neutral-400">{item.quantity}×</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
