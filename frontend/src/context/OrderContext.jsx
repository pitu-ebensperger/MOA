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

// eslint-disable-next-line react-refresh/only-export-components
export const useOrderContext = () => useContext(OrderContext);
