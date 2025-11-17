import ProductCard from "./ProductCard.jsx";
import { useWishlist } from "../../profile/hooks/useWishlist.js"

export default function ProductGallery({ products = [] }) {
  const { wishlist, toggleWishlist } = useWishlist();

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-center text-sm text-(--text-weak)">
        No hay productos que coincidan con los filtros seleccionados.
      </div>
    );
  }

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const isSaved = wishlist.some(
          (item) =>
            item.producto_id === product.id || item.id === product.id
        );

        return (
          <ProductCard
            key={product.id}
            product={product}
            isInWishlist={isSaved}
            onToggleWishlist={toggleWishlist}
          />
        );
      })}
    </section>
  );
}
