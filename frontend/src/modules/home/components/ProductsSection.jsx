
const ProductsSection = ({ products = [] }) => {
  const items = products.slice(0, 4);

  return (
    <section className="container-px mx-auto py-12">
      <header className="mb-6 flex items-baseline justify-between">
        <h2 className="title-serif text-2xl sm:text-3xl">Productos destacados</h2>
        <span className="ui-sans text-sm text-[var(--text-weak)]">
          Explora nuestra selección basada en tus categorías favoritas.
        </span>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <article
            key={product.id}
            className="rounded-lg border border-[var(--line)] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-[var(--card)]">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--text-weak)]">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="ui-sans space-y-2 p-4">
              <h3 className="text-base font-medium text-[var(--text)]">{product.name}</h3>
              <p className="text-sm text-[var(--text-weak)] line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="font-semibold text-[var(--brand)]">
                  ${product.price.toLocaleString("es-AR")}
                </span>
                <span className="rounded-full bg-[var(--card)] px-2 py-1 text-xs text-[var(--text-weak)]">
                  {product.category}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;
