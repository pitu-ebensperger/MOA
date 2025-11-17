import { useState } from "react";
import Card from "@/modules/profile/components/Card.jsx"
import OrderStatusTimeline from "@/components/data-display/OrderStatusTimeline.jsx"
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/radix/Dialog.jsx";

const normalizeOrderProduct = (product, index) => {
  if (!product || typeof product !== "object") {
    return {
      id: `order-${index}`,
      name: `Producto ${index + 1}`,
      price: 0,
      img: DEFAULT_PLACEHOLDER_IMAGE,
    };
  }
  const price = Number(product.price ?? 0);
  return {
    id: product.id ?? product.slug ?? `order-${index}`,
    name: product.name ?? product.slug ?? `Producto ${index + 1}`,
    price: Number.isFinite(price) ? price : 0,
    img: product.img ?? product.imgUrl ?? product.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE,
  };
};

const OrderSection = ({ products = [], isLoading = false, error = null }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const recentPurchases = (Array.isArray(products) ? products : [])
    .slice(0, 4)
    .map(normalizeOrderProduct);
  const hasPurchases = recentPurchases.length > 0;

  // Crear órdenes mock para demostración del timeline
  const mockOrders = recentPurchases.map((product, idx) => ({
    id: product.id,
    order_code: `MOA-2024-${1000 + idx}`,
    metodo_despacho: idx === 0 ? 'express' : idx === 1 ? 'retiro' : 'standard',
    creado_en: new Date(Date.now() - (idx * 3 * 24 * 60 * 60 * 1000)).toISOString(),
    fecha_entrega_estimada: new Date(Date.now() + ((5 - idx * 2) * 24 * 60 * 60 * 1000)).toISOString(),
    producto: product,
  }));

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  return (
    <>
      <h2 className="font-italiana text-2xl text-dark mt-24 mb-10 flex justify-center">Mis Compras</h2>
      {isLoading && (
        <p className="text-center text-sm text-dark/70">Cargando tus compras recientes...</p>
      )}
      {!isLoading && error && (
        <p role="alert" className="text-center text-sm text-red-600">
          No pudimos cargar tus compras. Vuelve a intentarlo.
        </p>
      )}
      {!isLoading && !error && hasPurchases ? (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="cursor-pointer" onClick={() => handleOrderClick(order)}>
                <Card data={order.producto} />
                <div className="mt-2 text-center">
                  <p className="text-xs text-dark/60">Orden #{order.order_code}</p>
                  <p className="text-xs font-medium text-primary1">
                    {order.metodo_despacho === 'express' ? 'Express' : 
                     order.metodo_despacho === 'retiro' ? 'Retiro' : 
                     'Standard'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dialog para mostrar el timeline de la orden */}
          <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  Seguimiento de Pedido
                </DialogTitle>
                <DialogDescription>
                  Orden #{selectedOrder?.order_code}
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="mt-4">
                  <OrderStatusTimeline order={selectedOrder} />
                  
                  {/* Detalles del producto */}
                  <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 font-semibold text-dark">Detalles del pedido</h4>
                    <div className="flex items-center gap-4">
                      <img 
                        src={selectedOrder.producto.img} 
                        alt={selectedOrder.producto.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-dark">{selectedOrder.producto.name}</p>
                        <p className="text-sm text-dark/60">
                          ${selectedOrder.producto.price.toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : null}
      {!isLoading && !error && !hasPurchases && (
        <div className="rounded-xl border border-dashed border-primary2/40 bg-white/60 p-8 text-center text-sm text-dark/70">
          Aún no registras compras recientes.
        </div>
      )}
    </>
  );
};

export default OrderSection;
