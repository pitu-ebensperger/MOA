import { useMemo } from "react";
import { usePersistentState } from "../../../hooks/usePersistentState.js";

const CART_STORAGE_KEY = "cart";

export const useCart = () => {
  const [cartItems, setCartItems] = usePersistentState(CART_STORAGE_KEY, {
    initialValue: [],
  });

  //  Agregar un producto
  const addToCart = (product) => {
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
  };

  //  Quitar producto
  const removeFromCart = (productId) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  //  Actualizar cantidad
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCartItems((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  //  Vaciar carrito
  const clearCart = () => {
    setCartItems([]);
  };

  const total = useMemo(
    () => cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity ?? 0), 0),
    [cartItems],
  );

  return {
    cartItems,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};
