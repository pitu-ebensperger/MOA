import { createContext, useContext } from "react";
import { useOrders } from "../hooks/state/useOrders";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const orderState = useOrders();
  return (
    <OrderContext.Provider value={orderState}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => useContext(OrderContext);
