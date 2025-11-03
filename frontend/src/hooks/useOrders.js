import { useState, useEffect } from "react";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  Obtener todas las órdenes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.example.com/orders");
      if (!response.ok) throw new Error("Error al obtener las órdenes");
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear una nueva orden
  const createOrder = async (newOrder) => {
    try {
      setLoading(true);
      const response = await fetch("https://api.eejemplo.com/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (!response.ok) throw new Error("Error al crear la orden");
      const created = await response.json();
      setOrders((prev) => [...prev, created]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
  };
};
