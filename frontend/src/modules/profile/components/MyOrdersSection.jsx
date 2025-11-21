import PropTypes from "prop-types";
import { formatCurrencyCLP } from "@/utils/currency.js";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

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
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-primary">Mis Compras</h2>
        <p className="text-sm text-text-secondary mt-1">Historial de pedidos recientes</p>
      </div>

      {/* Content */}
      <div className="bg-surface rounded-2xl shadow-sm border border-neutral-200 p-6">
        {isLoading && (
          <p className="text-center text-sm text-text-secondary py-8">Cargando tus órdenes...</p>
        )}
        {!isLoading && error && (
          <div className="text-center py-8">
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          </div>
        )}
        {!isLoading && !error && hasOrders ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/order-confirmation/${order.id}`)}
                className="group rounded-xl border border-neutral-200 bg-white p-5 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-primary">Orden #{order.orderCode}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-text-muted">
                      {order.itemsCount} {order.itemsCount === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-primary">
                      {formatCurrencyCLP(order.totalCents / 100)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                  <span>Ver detalles</span>
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        ) : null}
        {!isLoading && !error && !hasOrders && (
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary-soft/10 p-12 text-center">
            <p className="text-sm text-text-secondary">Aún no tienes órdenes registradas.</p>
            <Link to="/productos" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
              Comenzar a comprar
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

OrderSection.propTypes = {
  orders: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
};

export default OrderSection;
