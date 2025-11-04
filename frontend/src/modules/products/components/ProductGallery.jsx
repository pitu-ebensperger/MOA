import ProductCard from "./ProductCard";
export default function ProductGallery({ products }) {
    return (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
                <div className="col-span-full rounded-xl border border-black/10 p-6 text-center text-sm text-[var(--text-weak)]">
                    No hay productos que coincidan con los filtros.
                </div>
            )}
        </section>
    );
}
