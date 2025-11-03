import { createContext, useContext } from "react";
import { useCart } from "../hooks/state/useCart";

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


/**  EJEMPLO PIZZERIA DE CARTCONTEXT
 * import { createContext, useState } from "react";
import pizzaCart from "../data/pizzaCart";

export const CartContext = createContext();

const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState(pizzaCart); // Estado inicial carro

  // Función para agregar pizza al carro
  const addToCart = (pizza) => { 
    setCartItems((prevCart) => {
      const exists = prevCart.find((item) => item.id === pizza.id);
      if (exists) {
        return prevCart.map((item) =>
          item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...pizza, quantity: 1 }];
      }
    });
  };
  
  // Funcion para aumentar cant pizzas
   const incrementCount = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Funcion para disminuir cant pizzas
  const decrementCount = (id) => {
  setCartItems((prevItems) =>
    prevItems
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      // Eliminar item < 0
      .filter((item) => item.quantity > 0)  
  );
};

 const clearCartItems = () => {
      setCartItems([]); // Vacía el carrito en React
      localStorage.setItem("cartItems", JSON.stringify([])); // Opcional: limpia el localStorage también
    };
        return (
        <CartContext.Provider value={{ cartItems, incrementCount, decrementCount, addToCart, clearCartItems }}>
        {children}
        </CartContext.Provider>
        );
};
export default CartProvider;
 */