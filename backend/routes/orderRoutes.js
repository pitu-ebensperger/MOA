import { Router } from "express";
import orderController from "../src/controllers/orderController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

// Rutas de órdenes para usuarios
router.post("/api/checkout", verifyToken, orderController.createOrderFromCart);
router.get("/api/orders", verifyToken, orderController.getUserOrders);
router.get("/api/orders/:id", verifyToken, orderController.getOrderById);
router.delete("/api/orders/:id", verifyToken, orderController.cancelOrder);

// Nota: Las rutas admin de órdenes están en adminRoutes.js para evitar duplicación

export default router;
