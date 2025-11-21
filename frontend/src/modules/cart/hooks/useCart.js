import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState.js"
import { useAuth } from "@/context/auth-context.js"
import { cartApi } from "@/services/cart.api.js"
import { API_PATHS } from "@/config/api-paths.js"
import { alertAuthRequired, alertError } from '@/utils/alerts.js'
import { productsApi } from "@/services/products.api.js"

const CART_STORAGE_KEY = "cart";
const DEBUG_LOGS = import.meta.env?.VITE_DEBUG_LOGS === 'true' || import.meta.env?.MODE === 'development';
const debugWarn = (...args) => { if (DEBUG_LOGS) console.warn(...args); };
const debugError = (...args) => { if (DEBUG_LOGS) console.error(...args); };

export const useCart = () => {
  const { token, status } = useAuth();
  const isSessionReady = Boolean(token) && status === "authenticated";

  // Solo cargar carrito de localStorage si hay sesión activa
  const [cartItems, setCartItems] = usePersistentState(CART_STORAGE_KEY, {
    initialValue: [],
    enabled: isSessionReady, // Solo persistir si hay sesión
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const ensureAuthenticated = () => {
    if (isSessionReady) return true;
    alertAuthRequired().then(() => {
      window.location.assign(API_PATHS.auth.login);
    });
    return false;
  };

  const normalizeCartItem = (item) => ({
    id: item.producto_id ?? item.product_id ?? item.id,
    quantity: Number(item.cantidad ?? item.quantity ?? 0),
    price: Number(item.precio_unit ?? item.precio ?? item.price ?? 0),
    ...item,
  });

  // Cerrar drawer al desmontar el componente (prevenir memory leaks)
  useEffect(() => {
    return () => {
      setIsDrawerOpen(false);
    };
  }, []);

  useEffect(() => {
    if (!isSessionReady) {
      setCartItems([]);
      setIsDrawerOpen(false); // Cerrar drawer si no hay sesión
      // Limpiar localStorage explícitamente si no hay sesión
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (e) {
        debugWarn('[useCart] No se pudo limpiar carrito del storage', e);
      }
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await cartApi.get();
        if (cancelled) return;

        if (Array.isArray(data?.items)) {
          const normalized = data.items.map(normalizeCartItem);
          // Enriquecer con detalles de producto si faltan name/img
          const enriched = [];
          for (const item of normalized) {
            if (cancelled) break;
            const hasBasicData = item.name && item.imgUrl;
            if (hasBasicData) {
              enriched.push(item);
              continue;
            }
            try {
              const productDetail = await productsApi.getById(item.id);
              enriched.push({ ...item, ...productDetail });
            } catch (e) {
              debugWarn('[useCart] Failed to enrich item id', item.id, e);
              enriched.push(item); // fallback
            }
          }
          setCartItems(enriched);
        }
      } catch (err) {
        debugError("Error cargando carrito:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSessionReady, setCartItems]);

  const addToCart = async (product) => {
    if (!ensureAuthenticated()) return;
    const productId = product?.id ?? product?.producto_id;
    if (!productId) {
      debugWarn('[useCart] addToCart: productId inválido', product);
      return;
    }

    try {
      const response = await cartApi.add(productId, 1);
      const normalized = response?.item ? normalizeCartItem(response.item) : null;

      setCartItems((prevCart) => {
        const existing = prevCart.find((item) => item.id === productId);
        
        if (normalized && existing) {
          const updated = prevCart.map((item) =>
            item.id === productId
              ? { ...item, quantity: normalized.quantity, name: item.name || product.name, imgUrl: item.imgUrl || product.imgUrl }
              : item
          );
          return updated;
        }

        const baseItem = normalized
          ? { ...normalized, name: normalized.name || product.name, imgUrl: normalized.imgUrl || product.imgUrl, slug: normalized.slug || product.slug }
          : { ...product, id: productId, quantity: 1 };
          
        if (existing) {
          const updated = prevCart.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
          return updated;
        }
        
        const newCart = [...prevCart, baseItem];
        return newCart;
      });
    } catch (err) {
      debugError("Error addToCart:", err);
      const errorMsg = err?.response?.data?.message || err?.message || 'No se pudo agregar el producto al carrito';
      alertError(errorMsg);
      throw err;
    }
  };

  const executeRemoveFromCart = async (productId) => {
    try {
      await cartApi.remove(productId);
      setCartItems((prevCart) =>
        prevCart.filter((item) => item.id !== productId)
      );
    } catch (err) {
      debugError("Error removeFromCart:", err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!ensureAuthenticated()) return;
    return executeRemoveFromCart(productId);
  };

  const updateQuantity = async (productId, quantity) => {
    if (!ensureAuthenticated()) return;
    if (quantity <= 0) return executeRemoveFromCart(productId);

    try {
      const response = await cartApi.updateQuantity(productId, quantity);
      const normalized = response?.item ? normalizeCartItem(response.item) : null;

      if (normalized) {
        setCartItems((prevCart) =>
          prevCart.map((item) =>
            item.id === productId ? { ...item, quantity: normalized.quantity } : item
          )
        );
      } else {
        setCartItems((prevCart) =>
          prevCart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      debugError("Error updateQuantity:", err);
    }
  };

  const clearCart = async () => {
    if (!ensureAuthenticated()) return;
    try {
      await cartApi.clear();
      setCartItems([]);
      // Forzar limpieza del localStorage
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      debugError("Error clearCart:", err);
    }
  };

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const total = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) =>
          acc +
          (Number(item.price) || Number(item.precio_unit) || 0) * item.quantity,
        0,
      ),
    [cartItems],
  );

  return {
    cartItems,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
};
