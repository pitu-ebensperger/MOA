import { usePersistentState } from "../../../hooks/usePersistentState.js";
import { useAuth } from "../../../context/auth-context.js";
import { useEffect, useMemo } from "react";

export const useWishlist = () => {
  const { token, user, isAuthenticated } = useAuth();

  const storageKey = useMemo(() => {
    return user ? `wishlist.${user.id}` : "wishlist.anon";
  }, [user]);

  const [wishlist, setWishlist] = usePersistentState(storageKey, {
    initialValue: [],
  });

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      localStorage.removeItem(storageKey);
    }
  }, [user, setWishlist, storageKey]);

  useEffect(() => {
    if (!token || !isAuthenticated || !user) return;

    fetch("http://localhost:3000/wishlist", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items)) {
          setWishlist(data.items);
        }
      })
      .catch(() => {});
  }, [token, isAuthenticated, user, setWishlist]);

  const addToWishlist = async (product) => {
    if (!token) return;

    const realId = product.producto_id ?? product.id;

    try {
      const res = await fetch("http://localhost:3000/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ producto_id: realId }),
      });

      if (!res.ok) return;

      setWishlist((prev) => [...prev, { producto_id: realId, ...product }]);
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:3000/wishlist/remove/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return;

      setWishlist((prev) =>
        prev.filter((item) => item.producto_id !== productId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleWishlist = (product) => {
    const realId = product.producto_id ?? product.id;
    const exists = wishlist.some((item) => item.producto_id === realId);

    if (exists) {
      removeFromWishlist(realId);
    } else {
      addToWishlist(product);
    }
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };
};
