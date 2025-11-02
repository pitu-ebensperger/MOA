import React from "react";

const CategoriesFilters = () => {
  const categories = ["Todos", "Categoría 1", "Categoría 2", "Categoría 3"];

  return (
    <section className="py-12 bg-light text-center">
      <h2 className="font-italiana text-4xl text-dark mb-2">Productos</h2>
      <p className="font-garamond text-secondary1 mb-8">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
        quidem.
      </p>

      <div className="flex justify-center flex-wrap gap-4">
        {categories.map((cat, i) => (
          <button
            key={i}
            className="px-6 py-2 border border-secondary2 rounded-md font-garamond text-dark hover:bg-primary1 hover:text-light transition"
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoriesFilters;
