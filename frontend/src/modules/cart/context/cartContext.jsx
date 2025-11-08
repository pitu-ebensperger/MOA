import { createContext, useContext } from "react";
import { useCart } from "../hooks/useCart";



const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const cartState = useCart();
  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCartContext = () => useContext(CartContext);
