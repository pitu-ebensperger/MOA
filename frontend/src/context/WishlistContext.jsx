import { createContext, useContext } from "react";
import { useWishlist } from "../hooks/state/useWishlist";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const wishlistState = useWishlist();
  return (
    <WishlistContext.Provider value={wishlistState}>
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlistContext = () => useContext(WishlistContext);
