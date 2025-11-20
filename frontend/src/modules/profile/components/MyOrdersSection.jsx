import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js";
import { formatCurrencyCLP } from "@/utils/currency.js";
import { useNavigate } from "react-router-dom";

const normalizeOrder = (order, index) => {
  if (!order || typeof order !== "object") {
    return {
      id: `order-${index}`,
      orderCode: `N/A`,
      totalCents: 0,
      itemsCount: 0,
      createdAt: new Date().toISOString(),
    };
  }
  return {
    id: order.orden_id ?? order.id ?? `order-${index}`,
    orderCode: order.order_code ?? order.orderCode ?? `N/A`,
    totalCents: order.total_cents ?? order.totalCents ?? 0,
    itemsCount: order.total_items ?? order.items?.length ?? 0,
    createdAt: order.creado_en ?? order.createdAt ?? new Date().toISOString(),
  };
};

const OrderSection = ({ orders = [], isLoading = false, error = null }) => {
  const navigate = useNavigate();
  const recentOrders = (Array.isArray(orders) ? orders : [])
    .slice(0, 4)
    .map(normalizeOrder);
  const hasOrders = recentOrders.length > 0;

  return (
    <>
      <h2 className="font-italiana text-2xl text-dark mt-24 mb-10 flex justify-center">Mis Compras</h2>
      {isLoading && (
        <p className="text-center text-sm text-dark/70">Cargando tus órdenes...</p>
      )}
      {!isLoading && error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}
      {!isLoading && !error && hasOrders ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {recentOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/order/${order.orderCode}`)}
              className="group rounded-lg border border-neutral-200 bg-white p-4 text-left transition-all hover:border-primary1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-dark">Orden #{order.orderCode}</p>
                  <p className="text-xs text-dark/60 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-dark/60 mt-1">
                    {order.itemsCount} {order.itemsCount === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary1">
                    {formatCurrencyCLP(order.totalCents / 100)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
      {!isLoading && !error && !hasOrders && (
        <div className="rounded-xl border border-dashed border-primary2/40 bg-white/60 p-8 text-center text-sm text-dark/70">
          Aún no tienes órdenes registradas.
        </div>
      )}
    </>
  );
};

export default OrderSection;
