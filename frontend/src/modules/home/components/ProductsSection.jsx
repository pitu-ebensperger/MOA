import ProductCard from "../../products/components/ProductCard.jsx"; 

const FALLBACK_CATEGORIES = [
  { id: "all", name: "Todos" },
  { id: "cat-1", name: "Categoría 1" },
  { id: "cat-2", name: "Categoría 2" },
  { id: "cat-3", name: "Categoría 3" },
];

const normalizeCategory = (cat, index) => {
  if (typeof cat === "string") {
    return { id: `cat-${index}`, name: cat };
  }

  if (cat && (cat.name || cat.slug || cat.id)) {
    return {
      id: cat.id ?? cat.slug ?? `cat-${index}`,
      name: cat.name ?? cat.slug ?? String(cat.id ?? `Categoría ${index + 1}`),
    };
  }

  return { id: `cat-${index}`, name: `Categoría ${index + 1}` };
};

const ProductsSection = ({ products = [], categories = FALLBACK_CATEGORIES }) => {
  const items = products.slice(0, 4);

  const normalizedCategories =
    Array.isArray(categories) && categories.length
      ? categories.map(normalizeCategory)
      : FALLBACK_CATEGORIES;

  return (
    <section className="page container-px mx-auto max-w-7xl">
      <h2 className="font-display text-4xl text-dark mb-2 text-center">Productos</h2>
      <p className="font-sans text-center text-secondary1 mb-8">
        Explora nuestra selección basada en tus categorías favoritas.
      </p>

      <div className="flex justify-center flex-wrap gap-4">
        {normalizedCategories.map((cat) => (
          <button
            key={cat.id}
            className="px-6 py-2 border border-secondary2 rounded-md font-garamond text-dark hover:bg-primary1 hover:text-light transition"
          >
            {cat.name}
          </button>
        ))}
      </div>
      

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;

  
