// Carga y filtra productos desde la API.

import { useState, useEffect } from "react";

export const useProducts = (selectedCategory) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "https://api.ejemplo.com/products";
        if (selectedCategory && selectedCategory !== "Todos") {
          url += `?category=${selectedCategory}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  return { products };
};
