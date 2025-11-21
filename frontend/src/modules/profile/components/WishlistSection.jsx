import { Link } from "react-router-dom";
import Card from "./Card.jsx";
import { DEFAULT_PLACEHOLDER_IMAGE } from "../../../config/constants.js";

const normalizeWishlistProduct = (product, index) => {
  if (!product || typeof product !== "object") {
    return {
      id: `wishlist-${index}`,
      name: `Producto ${index + 1}`,
      price: 0,
      img: DEFAULT_PLACEHOLDER_IMAGE,
    };
  }

  const price = Number(product.price ?? 0);
  return {
    id: product.id ?? product.slug ?? `wishlist-${index}`,
    name: product.name ?? product.slug ?? `Producto ${index + 1}`,
    price: Number.isFinite(price) ? price : 0,
    img: product.img ?? product.imgUrl ?? product.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE,
  };
};

const WishlistSection = ({ products = [], isLoading = false, error = null }) => {
  const sample = (Array.isArray(products) ? products : []).slice(0, 4).map(normalizeWishlistProduct);
  const hasItems = sample.length > 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-primary">Mis Favoritos</h2>
          <p className="text-sm text-text-secondary mt-1">Productos que te gustan</p>
        </div>
        <Link
          to="/wishlist"
          className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium transition-all hover:bg-primary hover:text-white"
        >
          Ver todo
        </Link>
      </div>

      {/* Content */}
      <div className="bg-surface rounded-2xl shadow-sm border border-neutral-200 p-6">
        {isLoading && (
          <p className="text-center text-sm text-text-secondary py-8">Cargando favoritos...</p>
        )}
        {!isLoading && error && (
          <div className="text-center py-8">
            <p role="alert" className="text-sm text-error">
              No pudimos cargar tus favoritos. Intenta nuevamente.
            </p>
          </div>
        )}
        {!isLoading && !error && hasItems ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sample.map((product) => (
              <Card key={product.id} data={product} />
            ))}
          </div>
        ) : null}
        {!isLoading && !error && !hasItems && (
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary-soft/10 p-12 text-center">
            <p className="text-sm text-text-secondary">Aún no tienes productos guardados en favoritos.</p>
            <Link to="/productos" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
              Explorar productos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistSection;
