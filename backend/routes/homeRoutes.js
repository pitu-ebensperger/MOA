import { Router } from "express";

const router = Router();

// Stub temporal para alinear con frontend (home.landing = /home)
// Devuelve 501 hasta que se implemente contenido real
router.get("/home", (req, res) => {
  res.status(501).json({ message: "Endpoint /home no implementado todavía" });
});

export default router;