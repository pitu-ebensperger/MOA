import { useEffect, useState, useCallback } from "react";
import { productsApi } from "../services/products.api.js";

const initialState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const useProducts = (filters = {}) => {
  const [state, setState] = useState(initialState);

  const fetchProducts = useCallback(async (params = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await productsApi.list(params);
      setState({
        items: response.items ?? [],
        total: response.total ?? response.items?.length ?? 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [fetchProducts, filters]);

  return {
    products: state.items,
    total: state.total,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchProducts,
  };
};
