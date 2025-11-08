import ProductCard from "./ProductCard.jsx";

export default function ProductGallery({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-center text-sm text-(--text-weak)">
        No hay productos que coincidan con los filtros seleccionados.
      </div>
    );
  }

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
