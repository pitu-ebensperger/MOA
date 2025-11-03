// Carga las categorías desde la API y permite seleccionar una para filtrar productos.

import { useState, useEffect } from "react";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.ejemplo.com/categories");
        const data = await res.json();
        setCategories(["Todos", ...data]);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  return { categories, selectedCategory, setSelectedCategory };
};
