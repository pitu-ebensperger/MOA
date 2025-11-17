import Card from "./Card.jsx";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../config/constants.js";

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
  const recentPurchases = (Array.isArray(products) ? products : [])
    .slice(0, 4)
    .map(normalizeOrderProduct);
  const hasPurchases = recentPurchases.length > 0;

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
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {recentPurchases.map((product) => (
            <Card key={product.id} data={product} />
          ))}
        </div>
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
