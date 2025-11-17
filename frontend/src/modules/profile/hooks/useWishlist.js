import { usePersistentState } from "../../../hooks/usePersistentState.js";

const WISHLIST_STORAGE_KEY = "wishlist";

export const useWishlist = () => {
  const [wishlist, setWishlist] = usePersistentState(WISHLIST_STORAGE_KEY, {
    initialValue: [],
  });

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev; // evita duplicados

      return [...prev, product];
    });
  };


  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return { wishlist, addToWishlist, removeFromWishlist, clearWishlist };
};
