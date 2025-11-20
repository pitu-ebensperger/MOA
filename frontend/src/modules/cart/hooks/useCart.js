import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState.js";
import { useAuth } from "@/context/auth-context.js";
import { cartApi } from "@/services/cart.api.js";

const CART_STORAGE_KEY = "cart";

const normalizeCartItem = (item) => {
  const quantity = Number(item?.quantity ?? item?.cantidad ?? 0) || 0;
  const price =
    Number(
      item?.price ??
        item?.precio ??
        item?.precio_unit ??
        item?.unitPrice ??
        item?.valor ??
        item?.precio_total ??
        0,
    ) || 0;
  return {
    ...item,
    id: item?.id ?? item?.itemId ?? item?.productId,
    productId:
      item?.productId ?? item?.product_id ?? item?.producto_id ?? item?.sku,
    quantity,
    price,
  };
};

const buildPayload = (product, quantity = 1) => {
  if (!product) return null;
  const productId = product?.id ?? product?.productId ?? product?.producto_id;
  if (!productId) return null;
  return {
    productId,
    quantity,
    price:
      Number(
        product?.price ?? product?.precio ?? product?.precio_unit ?? product?.valor,
      ) || 0,
    name: product?.name ?? product?.titulo ?? product?.nombre,
    image: product?.image ?? product?.thumbnail ?? product?.imgUrl,
  };
};

export const useCart = () => {
  const { user, token, status } = useAuth();
  const userId = user?.id ?? user?.userId;
  const [cartItems, setCartItems] = usePersistentState(CART_STORAGE_KEY, {
    initialValue: [],
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isSessionReady =
    Boolean(token) && status === "authenticated" && Boolean(userId);

  const ensureAuthenticated = useCallback(() => {
    if (isSessionReady) return true;
    alert(
      "Debes iniciar sesión y esperar a que tu sesión se confirme para usar el carrito",
    );
    return false;
  }, [isSessionReady]);

  const syncCart = useCallback(
    (cart) => {
      const items = Array.isArray(cart?.items) ? cart.items : [];
      if (!items.length) {
        setCartItems([]);
        return;
      }
      setCartItems(items.map(normalizeCartItem));
    },
    [setCartItems],
  );

  useEffect(() => {
    if (!isSessionReady) {
      setCartItems([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const cart = await cartApi.getCart(userId);
        if (cancelled) return;
        syncCart(cart);
      } catch (err) {
        console.error("Error cargando carrito:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSessionReady, userId, setCartItems, syncCart]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!ensureAuthenticated()) return;
      const payload = buildPayload(product, quantity);
      if (!payload) return;
      try {
        const cart = await cartApi.addItem(userId, payload);
        syncCart(cart);
      } catch (err) {
        console.error("Error addToCart:", err);
      }
    },
    [ensureAuthenticated, syncCart, userId],
  );

  const executeRemoveFromCart = useCallback(
    async (itemId) => {
      try {
        const cart = await cartApi.removeItem(userId, itemId);
        if (cart) {
          syncCart(cart);
        } else {
          setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        }
      } catch (err) {
        console.error("Error removeFromCart:", err);
      }
    },
    [syncCart, userId, setCartItems],
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      if (!ensureAuthenticated()) return;
      await executeRemoveFromCart(itemId);
    },
    [ensureAuthenticated, executeRemoveFromCart],
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (!ensureAuthenticated()) return;
      if (quantity <= 0) {
        await executeRemoveFromCart(itemId);
        return;
      }
      try {
        const cart = await cartApi.updateItem(userId, itemId, quantity);
        if (cart) {
          syncCart(cart);
        } else {
          setCartItems((prevCart) =>
            prevCart.map((item) =>
              item.id === itemId ? { ...item, quantity } : item,
            ),
          );
        }
      } catch (err) {
        console.error("Error updateQuantity:", err);
      }
    },
    [ensureAuthenticated, executeRemoveFromCart, setCartItems, syncCart, userId],
  );

  const clearCart = useCallback(async () => {
    if (!ensureAuthenticated()) return;
    try {
      const cart = await cartApi.clearCart(userId);
      if (cart) {
        syncCart(cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error clearCart:", err);
    }
  }, [ensureAuthenticated, setCartItems, syncCart, userId]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const total = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 0),
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
