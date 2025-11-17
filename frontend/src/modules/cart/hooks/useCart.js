import { useEffect, useMemo } from "react";
import { usePersistentState } from "../../../hooks/usePersistentState.js";
import { useAuth } from "../../../context/auth-context.js";

const CART_STORAGE_KEY = "cart";

export const useCart = () => {
  const { token } = useAuth();

  const [cartItems, setCartItems] = usePersistentState(CART_STORAGE_KEY, {
    initialValue: [],
  });

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
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
      const res = await fetch("http://localhost:3000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          producto_id: product.id,
          cantidad: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("ERROR al agregar al carrito:", data);
        return;
      }

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
      const res = await fetch(
        `http://localhost:3000/cart/remove/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error("ERROR eliminando");
        return;
      }

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
      const res = await fetch("http://localhost:3000/cart/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          producto_id: productId,
          cantidad: quantity,
        }),
      });

      if (!res.ok) {
        console.error("ERROR actualizando cantidad");
        return;
      }

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
      const res = await fetch("http://localhost:3000/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error limpiando carrito");
        return;
      }

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
