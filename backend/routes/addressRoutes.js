import { Router } from "express";
import {
  getUserAddresses,
  getAddressById,
  getDefaultAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} from "../src/controllers/addressController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

// Todas las rutas de direcciones requieren autenticación

// Obtener todas las direcciones del usuario
router.get("/api/direcciones", verifyToken, getUserAddresses);

// Obtener dirección predeterminada
router.get("/api/direcciones/predeterminada", verifyToken, getDefaultAddress);

// Obtener dirección por ID
router.get("/api/direcciones/:id", verifyToken, getAddressById);

// Crear nueva dirección
router.post("/api/direcciones", verifyToken, createAddress);

// Actualizar dirección existente
router.patch("/api/direcciones/:id", verifyToken, updateAddress);

// Establecer dirección como predeterminada
router.patch("/api/direcciones/:id/predeterminada", verifyToken, setDefaultAddress);

// Eliminar dirección
router.delete("/api/direcciones/:id", verifyToken, deleteAddress);

export default router;
