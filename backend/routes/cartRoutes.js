import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  emptyCart,
} from "../src/controllers/cartController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();
router.get("/cart", verifyToken, getCart);
router.post("/cart/add", verifyToken, addToCart);
router.delete("/cart/remove/:productId", verifyToken, removeFromCart);
router.delete("/cart/clear", verifyToken, emptyCart);
export default router;
