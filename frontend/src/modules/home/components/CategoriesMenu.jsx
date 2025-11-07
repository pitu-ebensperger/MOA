import React, { useState } from "react";

const CategoriesFilters = () => {
  const categories = ["Todos", "Sofás", "Lámparas", "Mesas", "Sillas"];
  const [active, setActive] = useState("Todos");

  return (
    <section className="py-25 bg-light text-center">
      <h2 className="font-italiana text-4xl text-dark mb-2">Productos</h2>
      <p className="font-garamond text-secondary1 mb-10 max-w-md mx-auto text-sm">
Diseñamos con materiales naturales y manos expertas para dar vida a espacios llenos de calidez y autenticidad.      </p>

      {/* Contenedor de pestañas */}
      <div className="flex justify-center border-b border-secondary2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`relative px-6 py-3 mx-10 font-garamond transition-all duration-300 text-base
              ${
                active === cat
                  ? "text-[#5c4532] after:absolute after:left-0 after:bottom-[-1px] after:w-full after:h-[2px] after:bg-[#5c4532]"
                  : "text-secondary1 hover:text-[#5c4532]"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoriesFilters;
