const FALLBACK_CATEGORIES = [
  { id: "all", name: "Todos los productos" },
  { id: "living", name: "Living" },
  { id: "comedor", name: "Comedor" },
  { id: "dormitorio", name: "Dormitorio" },
];

export default function CategoriesMenu({
  title = "Productos",
  description = "Explora nuestras categorías principales y descubre piezas curadas para cada ambiente.",
  categories = FALLBACK_CATEGORIES,
  onSelectCategory,
}) {
  return (
    <section className="bg-light py-12 text-center">
      <h2 className="font-italiana text-4xl text-dark mb-2">{title}</h2>
      <p className="font-garamond text-secondary1 mb-8 max-w-2xl mx-auto">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {categories.map((category) => (
          <button
            key={category.id ?? category.slug ?? category.name}
            type="button"
            onClick={() => onSelectCategory?.(category)}
            className="px-6 py-2 rounded-full border border-secondary2 font-garamond text-dark transition hover:bg-primary1 hover:text-light"
          >
            {category.name ?? category.title}
          </button>
        ))}
      </div>
    </section>
  );
}
