import { ProductCard } from '../../../components/data-display/ProductCard.jsx';

const ProductsSection = ({ products = [] }) => {
  const items = products.slice(0, 4);

  return (
    <section className="bg-[#d2cbc1] page container-px mx-auto py-12">
      <header className="mb-6 text-center">
        <h2 className="title-serif text-2xl sm:text-3xl mb-2">Productos destacados</h2>
        <span className="ui-sans text-sm text-[var(--text-weak)] block">
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
