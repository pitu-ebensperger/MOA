import { Router } from "express";
import { getProducts } from "../src/controllers/productsController.js";
import { getProductById } from "../src/controllers/productsController.js";
import { createProduct } from "../src/controllers/productsController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { deleteProductController } from "../src/controllers/productsController.js";

const router = Router();

router.get("/productos", getProducts);
router.get("/producto/:slug", getProductById);
router.post("/productos", createProduct);
router.delete("/admin/productos/:id", verifyToken, deleteProductController);

export default router;
