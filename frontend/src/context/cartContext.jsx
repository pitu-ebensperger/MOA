import { createContext, useContext } from "react";
import { useCart } from "../modules/cart/hooks/useCart";



const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const cartState = useCart();
  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
