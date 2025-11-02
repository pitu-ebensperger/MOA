import { useCallback, useEffect, useRef, useState } from 'react';
import { productsApi } from '../services/products.api.js';

const normalizeCategories = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export function useCategories({ enabled = true } = {}) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCategories = useCallback(async () => {
    if (!enabled) {
      if (isMountedRef.current) {
        setCategories([]);
        setIsLoading(false);
        setError(null);
      }
      return [];
    }

    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const data = await productsApi.listCategories();
      const next = normalizeCategories(data);
      if (isMountedRef.current) {
        setCategories(next);
      }
      return next;
    } catch (err) {
      if (isMountedRef.current) {
        setCategories([]);
        setError(err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    loadCategories().catch(() => {
    });
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    refresh: loadCategories,
  };
}
