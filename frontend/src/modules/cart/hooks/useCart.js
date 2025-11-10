import { useState, useEffect, useMemo, useCallback } from "react";

export const useCart = () => {
  //  Inicializar el carrito desde localStorage 
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  //  Persistir carrito cada vez que cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  //  Agregar un producto
  const addToCart = (product, options = {}) => {
    if (!product) return;
    const normalizedQuantity =
      Number.isFinite(Number(options.quantity)) && Number(options.quantity) > 0
        ? Number(options.quantity)
        : 1;
    const quantityToAdd = Math.max(1, Math.floor(normalizedQuantity));
    setCartItems((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity ?? 0) + quantityToAdd }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: quantityToAdd }];
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
    localStorage.removeItem("cart");
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const total = useMemo(
    () => cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity ?? 0), 0),
    [cartItems],
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  return {
    cartItems,
    total,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};
