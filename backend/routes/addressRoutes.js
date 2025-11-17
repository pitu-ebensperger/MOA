import { Router } from "express";
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} from "../src/controllers/addressController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

// GET / Obtener todas las direcciones del usuario
router.get("/direcciones", verifyToken, getUserAddresses);

// GET / Obtener una dirección específica
router.get("/direcciones/:id", verifyToken, getAddressById);

// POST / Crear nueva dirección
router.post("/direcciones", verifyToken, createAddress);

// PATCH / Actualizar dirección
router.patch("/direcciones/:id", verifyToken, updateAddress);

// PATCH / Establecer como predeterminada
router.patch("/direcciones/:id/predeterminada", verifyToken, setDefaultAddress);

// DELETE / Eliminar dirección
router.delete("/direcciones/:id", verifyToken, deleteAddress);

export default router;
