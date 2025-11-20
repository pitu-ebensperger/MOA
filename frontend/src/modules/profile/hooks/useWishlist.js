import { useEffect, useState } from "react";
import { usePersistentState } from "../../../hooks/usePersistentState.js";
import { useAuth } from "../../../context/auth-context.js";
import { wishlistApi } from "@/services/wishlist.api.js";

const WISHLIST_STORAGE_KEY = "wishlist";

export const useWishlist = () => {
  const { token, status } = useAuth();
  const [wishlist, setWishlist] = usePersistentState(WISHLIST_STORAGE_KEY, {
    initialValue: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const isSessionReady = Boolean(token) && status === "authenticated";

  const ensureAuthenticated = () => {
    if (isSessionReady) return true;
    alert("Debes iniciar sesión para usar favoritos ❤️");
    return false;
  };

  useEffect(() => {
    if (!isSessionReady) {
      setWishlist([]);
      setIsLoading(false);
      return;
    }

    wishlistApi.get()
      .then((data) => {
        if (Array.isArray(data.items)) {
          setWishlist(data.items);
        }
      })
      .catch((err) => console.error("Error cargando wishlist:", err));
  }, [token, isSessionReady, setWishlist]);

  const addToWishlist = async (product) => {
    if (!ensureAuthenticated()) return;
    const productId = product?.id ?? product?.producto_id;
    if (!productId) return;

    try {
      await wishlistApi.add(product.id);

      setWishlist((prev) => [...prev, { producto_id: product.id, ...product }]);
    } catch (error) {
      console.error("Error wishlist add:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!ensureAuthenticated()) return;

    try {
      await wishlistApi.remove(productId);

      setWishlist((prev) =>
        prev.filter(
          (item) => item.producto_id !== productId && item.id !== productId
        )
      );
    } catch (error) {
      console.error("Error wishlist remove:", error);
    }
  };

  const toggleWishlist = (product) => {
    const currentId = product?.id ?? product?.producto_id;
    if (!currentId) return;

    const exists = wishlist.some(
      (item) => item.producto_id === currentId || item.id === currentId
    );

    if (exists) {
      removeFromWishlist(currentId);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };
};
