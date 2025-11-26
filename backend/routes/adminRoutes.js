import { Router } from "express";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { deleteProductController } from "../src/controllers/productsController.js";

const router = Router();

// Stubs admin pedidos (frontend ordersApi remoto apunta a /admin/pedidos)
router.get("/admin/pedidos", verifyToken, (req, res) => {
  res.status(501).json({ message: "Listado de pedidos admin no implementado" });
});

router.get("/admin/pedidos/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  res
    .status(501)
    .json({ message: `Detalle de pedido admin ${id} no implementado` });
});

router.delete("/admin/productos/:id", verifyToken, deleteProductController);

export default router;
