import { ProductCard } from '../../../components/products/ProductCard.jsx';

const ProductsSection = ({ products = [] }) => {
  const items = products.slice(0, 4);

  return (
    <section className="page container-px mx-auto py-12">
      <header className="mb-6 flex items-baseline justify-between">
        <h2 className="title-serif text-2xl sm:text-3xl">Productos destacados</h2>
        <span className="ui-sans text-sm text-[var(--text-weak)]">
          Explora nuestra selección basada en tus categorías favoritas.
        </span>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;

              