import { useState, useEffect } from "react";

export const useOrders = () => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  // Crear  nueva orden
  const createOrder = (orderData) => {
    const newOrder = {
      id: Date.now(), // ID único (temporal)
      date: new Date().toISOString(),
      ...orderData, // { productos, total, etc. }
    };

    setOrders((prev) => {
      const updated = [...prev, newOrder];
      localStorage.setItem("orders", JSON.stringify(updated));
      return updated;
    });

    return newOrder;
  };

  // Obtener una orden específica
  const getOrderById = (id) => orders.find((o) => o.id === id);

  // Borrar  órdenes 
  const clearOrders = () => {
    localStorage.removeItem("orders");
    setOrders([]);
  };

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  return { orders, createOrder, getOrderById, clearOrders };
};
