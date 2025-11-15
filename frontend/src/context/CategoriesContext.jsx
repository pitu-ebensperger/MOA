import { createContext, useEffect, useState } from "react";
import { productsApi } from "../services/products.api.js";

const CategoriesContext = createContext([]);

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productsApi.listCategories().then(setCategories).catch(console.error);
  }, []);

  return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
};
