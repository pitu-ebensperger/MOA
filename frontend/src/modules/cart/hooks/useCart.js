import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState.js"
import { useAuth } from "@/context/auth-context.js"
import { cartApi } from "@/services/cart.api.js"
import { API_PATHS } from "@/config/api-paths.js"
import { alertAuthRequired } from '@/utils/alerts.js'
import { productsApi } from "@/services/products.api.js"

const CART_STORAGE_KEY = "cart";

export const useCart = () => {
  const { token, status } = useAuth();

  const [cartItems, setCartItems] = usePersistentState(CART_STORAGE_KEY, {
    initialValue: [],
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isSessionReady = Boolean(token) && status === "authenticated";

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

  useEffect(() => {
    if (!isSessionReady) {
        console.log('[useCart] Session not ready, clearing cart');
      setCartItems([]);
      return;
    }

    let cancelled = false;
  console.log('[useCart] Loading cart from API...');

    (async () => {
      try {
        const data = await cartApi.get();
          console.log('[useCart] Cart data received:', data);
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
              console.warn('[useCart] Failed to enrich item id', item.id, e);
              enriched.push(item); // fallback
            }
          }
          setCartItems(enriched);
        }
      } catch (err) {
        console.error("Error cargando carrito:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSessionReady, setCartItems]);

  const addToCart = async (product) => {
    if (!ensureAuthenticated()) return;
    const productId = product?.id ?? product?.producto_id;
      console.log('[useCart] addToCart called with product:', product, 'productId:', productId);
    if (!productId) return;

    try {
      const response = await cartApi.add(productId, 1);
        console.log('[useCart] API response:', response);
      const normalized = response?.item ? normalizeCartItem(response.item) : null;
  console.log('[useCart] Normalized item:', normalized);

      setCartItems((prevCart) => {
        const existing = prevCart.find((item) => item.id === productId);
        if (normalized && existing) {
          return prevCart.map((item) =>
            item.id === productId
              ? { ...item, quantity: normalized.quantity, name: item.name || product.name, imgUrl: item.imgUrl || product.imgUrl }
              : item
          );
        }

        const baseItem = normalized
          ? { ...normalized, name: normalized.name || product.name, imgUrl: normalized.imgUrl || product.imgUrl, slug: normalized.slug || product.slug }
          : { ...product, id: productId, quantity: 1 };
        if (existing) {
          return prevCart.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, baseItem];
      });
    } catch (err) {
      console.error("Error addToCart:", err);
    }
  };

  const executeRemoveFromCart = async (productId) => {
    try {
      await cartApi.remove(productId);
      setCartItems((prevCart) =>
        prevCart.filter((item) => item.id !== productId)
      );
    } catch (err) {
      console.error("Error removeFromCart:", err);
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
      console.error("Error updateQuantity:", err);
    }
  };

  const clearCart = async () => {
    if (!ensureAuthenticated()) return;
    try {
      await cartApi.clear();
      setCartItems([]);
    } catch (err) {
      console.error("Error clearCart:", err);
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
