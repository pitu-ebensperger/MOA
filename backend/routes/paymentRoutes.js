import { Router } from "express";
import paymentController from "../src/controllers/paymentController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

router.get("/api/metodos-pago", verifyToken, paymentController.getUserPaymentMethods);
router.get(
  "/api/metodos-pago/:id",
  verifyToken,
  paymentController.getPaymentMethodById
);
router.post("/api/metodos-pago", verifyToken, paymentController.createPaymentMethod);
router.patch("/api/metodos-pago/:id", verifyToken, paymentController.updatePaymentMethod);
router.patch(
  "/api/metodos-pago/:id/predeterminado",
  verifyToken,
  paymentController.setDefaultPaymentMethod
);
router.delete("/api/metodos-pago/:id", verifyToken, paymentController.deletePaymentMethod);

export default router;
