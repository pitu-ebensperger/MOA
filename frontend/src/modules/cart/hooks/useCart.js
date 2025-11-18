import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState.js"
import { useAuth } from "@/context/auth-context.js"
import { cartApi } from "@/services/cart.api.js"

const CART_STORAGE_KEY = "cart";

export const useCart = () => {
  const { token } = useAuth();

  const [cartItems, setCartItems] = usePersistentState(CART_STORAGE_KEY, {
    initialValue: [],
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    cartApi.get()
      .then((data) => {
        if (Array.isArray(data.items)) {
          const normalized = data.items.map((item) => ({
            id: item.producto_id,
            quantity: item.cantidad,
            price: item.precio_unit,
            ...item,
          }));
          setCartItems(normalized);
        }
      })
      .catch((err) => console.error("Error cargando carrito:", err));
  }, [token]);

  const addToCart = async (product) => {
    if (!token) return alert("Debes iniciar sesión para usar el carrito");

    try {
      await cartApi.add(product.id, 1);

      setCartItems((prevCart) => {
        const existing = prevCart.find((item) => item.id === product.id);
        if (existing) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { ...product, quantity: 1 }];
      });
    } catch (err) {
      console.error("Error addToCart:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartApi.remove(productId);

      setCartItems((prevCart) =>
        prevCart.filter((item) => item.id !== productId)
      );
    } catch (err) {
      console.error("Error removeFromCart:", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);

    try {
      await cartApi.updateQuantity(productId, quantity);

      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Error updateQuantity:", err);
    }
  };

  const clearCart = async () => {
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
