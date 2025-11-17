import { Router } from "express";
import orderController from "../src/controllers/orderController.js";
import orderAdminController from "../src/controllers/orderAdminController.js";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { asyncHandler } from "../src/utils/error.utils.js";

const router = Router();

router.post("/api/checkout", verifyToken, orderController.createOrderFromCart);
router.get("/api/orders", verifyToken, orderController.getUserOrders);
router.get("/api/orders/:id", verifyToken, orderController.getOrderById);
router.post("/api/orders/:id/payment", verifyToken, orderController.processPayment);
router.delete("/api/orders/:id", verifyToken, orderController.cancelOrder);

router.put(
  "/api/admin/orders/:id/status",
  verifyAdmin,
  asyncHandler(orderAdminController.updateOrderStatus)
);

export default router;
