import { useState, useEffect } from "react";

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState(() => {
    // Recupera los favoritos 
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  Obtener wishlist 
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.ejemplo.com/wishlist");
      if (!response.ok) throw new Error("Error al obtener wishlist");
      const data = await response.json();
      setWishlist(data);
      localStorage.setItem("wishlist", JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //  Agregar producto a favoritos
  const addToWishlist = (product) => {
    const exists = wishlist.find((item) => item.id === product.id);
    if (!exists) {
      const updated = [...wishlist, product];
      setWishlist(updated);
      localStorage.setItem("wishlist", JSON.stringify(updated));
    }
  };

  //  Eliminar producto de favoritos
  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  // Verificar si un producto ya está en la lista
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  //  Sincroniza automáticamente los cambios con localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  return {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
};
