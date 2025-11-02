import React, { useState } from "react";

const categories = ["Todos", "Categoría 1", "Categoría 2", "Categoría 3"];

const products = [
  {
    id: 1,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "https://plus.unsplash.com/premium_photo-1676321688606-2f3b026710a5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470",
  },
  {
    id: 2,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "",
  },
  {
    id: 3,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "",
  },
  {
    id: 4,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "",
  },
  {
    id: 5,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "",
  },
  {
    id: 6,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "",
  },
  {
    id: 7,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "",
  },
  {
    id: 8,
    name: "Nombre Producto",
    description: "Neque porro quisquam est qui",
    price: "$50.000",
    image: "",
  },
];

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");

  return (
    <section className="bg-light py-20 px-6 text-center">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <h2 className="font-italiana text-4xl text-dark mb-4">Productos</h2>
        <p className="font-garamond text-secondary1 mb-10 text-lg max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore et.
        </p>

        {/* Filtros */}
        <div className="flex justify-center gap-10 mb-10 border-b border-gray-300">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 font-garamond text-lg transition-all ${
                activeCategory === cat
                  ? "border-b-2 border-dark text-dark"
                  : "text-secondary1 hover:text-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-secondary2 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <div className="h-56 bg-gray-200">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary1 text-sm">
                    <i className="bi bi-image"></i>
                  </div>
                )}
              </div>
              <div className="p-4 text-left">
                <h3 className="font-garamond text-dark text-lg">
                  {product.name}
                </h3>
                <p className="font-garamond text-secondary1 text-sm mb-2">
                  {product.description}
                </p>
                <p className="font-garamond text-dark font-medium">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Ver más */}
        <button className="bg-primary1 text-light px-8 py-3 rounded font-garamond hover:bg-primary2 transition">
          Ver más
        </button>
      </div>
    </section>
  );
};

export default ProductsSection;
