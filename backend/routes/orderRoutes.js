import { Router } from "express";
import orderController from "../src/controllers/orderController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

router.post("/api/checkout", verifyToken, orderController.createOrderFromCart);
router.get("/api/orders", verifyToken, orderController.getUserOrders);
router.get("/api/orders/:id", verifyToken, orderController.getOrderById);
router.post("/api/orders/:id/payment", verifyToken, orderController.processPayment);
router.delete("/api/orders/:id", verifyToken, orderController.cancelOrder);

export default router;
