import { useEffect, useMemo } from "react";
import { usePersistentState } from "../../../hooks/usePersistentState.js";
import { useAuth } from "../../../context/auth-context.js";
import { cartApi } from "../../../services/cart.api.js";

const CART_STORAGE_KEY = "cart";

export const useCart = () => {
  const { token, status } = useAuth();

  const [cartItems, setCartItems] = usePersistentState(CART_STORAGE_KEY, {
    initialValue: [],
  });

  const isSessionReady = Boolean(token) && status === "authenticated";

  const ensureAuthenticated = () => {
    if (isSessionReady) return true;
    alert("Debes iniciar sesión y esperar a que tu sesión se confirme para usar el carrito");
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
      setCartItems([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await cartApi.getCart();
        if (cancelled) return;

        if (Array.isArray(data?.items)) {
          const normalized = data.items.map(normalizeCartItem);
          setCartItems(normalized);
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
    if (!productId) return;

    try {
      const response = await cartApi.addToCart(productId, 1);
      const normalized = response?.item ? normalizeCartItem(response.item) : null;

      setCartItems((prevCart) => {
        const existing = prevCart.find((item) => item.id === productId);
        if (normalized && existing) {
          return prevCart.map((item) =>
            item.id === productId
              ? { ...item, quantity: normalized.quantity }
              : item
          );
        }

        const baseItem = normalized ?? { ...product, id: productId, quantity: 1 };
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
      await cartApi.removeFromCart(productId);
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
      await cartApi.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error("Error clearCart:", err);
    }
  };

  const total = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) =>
          acc +
          (Number(item.price) || Number(item.precio_unit) || 0) * item.quantity,
        0
      ),
    [cartItems]
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
