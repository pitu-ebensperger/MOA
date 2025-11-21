import { Router } from "express";
import {
  createOrder,
  getMyOrders,
} from "../src/controllers/ordersController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

router.post("/orders", verifyToken, createOrder);
router.get("/orders/mine", verifyToken, getMyOrders);

export default router;
