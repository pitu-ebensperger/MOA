import { usePersistentState } from "../../../hooks/usePersistentState.js";
import { useAuth } from "../../../context/auth-context.js";
import { useEffect } from "react";
import { wishlistApi } from "@/services/wishlist.api.js";

const WISHLIST_STORAGE_KEY = "wishlist";

export const useWishlist = () => {
  const { token } = useAuth();

  const [wishlist, setWishlist] = usePersistentState(WISHLIST_STORAGE_KEY, {
    initialValue: [],
  });

  useEffect(() => {
    if (!token) return;

    wishlistApi.get()
      .then((data) => {
        if (Array.isArray(data.items)) {
          setWishlist(data.items);
        }
      })
      .catch((err) => console.error("Error cargando wishlist:", err));
  }, [token]);

  const addToWishlist = async (product) => {
    if (!token) return alert("Debes iniciar sesión para usar favoritos ❤️");

    try {
      await wishlistApi.add(product.id);

      setWishlist((prev) => [...prev, { producto_id: product.id, ...product }]);
    } catch (error) {
      console.error("Error wishlist add:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!token) return alert("Debes iniciar sesión");

    try {
      await wishlistApi.remove(productId);

      setWishlist((prev) =>
        prev.filter((item) => item.producto_id !== productId)
      );
    } catch (error) {
      console.error("Error wishlist remove:", error);
    }
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some(
      (item) => item.producto_id === product.id || item.id === product.id
    );

    if (exists) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };
};
