import { Router } from "express";

const router = Router();

// Stubs para productos (frontend espera /productos y /producto/:id)
router.get("/productos", (req, res) => {
  res.status(501).json({ message: "Listado de productos no implementado" });
});

router.get("/producto/:id", (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Detalle de producto ${id} no implementado` });
});

export default router;