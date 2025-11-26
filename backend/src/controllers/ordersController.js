import { createOrderDB } from "../models/ordersModel.js";
import { ordersModel } from "../models/ordersModel.js";

export const createOrder = async (req, res) => {
  const { items, total_cents, delivery_method, payment_method, notes } =
    req.body;
  const usuario_id = req.user?.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No hay items para crear la orden" });
  }

  try {
    const result = await createOrderDB({
      usuario_id,
      total_cents,
      delivery_method,
      payment_method,
      notes,
      items,
    });

    return res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("🔥 ERROR REAL AL CREAR ORDEN >>>", error.message);

    if (error.message.includes("No hay stock suficiente")) {
      return res.status(400).json({
        error: "stock_insuficiente",
        detail: error.message,
      });
    }

    return res.status(500).json({
      error: "server_error",
      detail: "Error creando orden",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const orders = await ordersModel.findOrdersByUser(usuario_id);

    return res.json(orders);
  } catch (error) {
    console.log("Error listando órdenes:", error);
    return res.status(500).json({ error: "No se pudieron cargar las órdenes" });
  }
};
