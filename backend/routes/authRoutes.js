import { Router } from "express";
import { loginUser, getUser } from "../src/controllers/authController.js";
import { 
  requestPasswordReset, 
  resetPassword 
} from "../src/controllers/passwordResetController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { checkLoginCredentials } from "../src/middleware/credentialsMiddleware.js";

const router = Router();

// Mantiene /login para autenticación
router.post("/login", checkLoginCredentials, loginUser);

// Nuevo endpoint alineado con frontend para perfil autenticado
router.get("/auth/perfil", verifyToken, getUser);

// Alias singular /usuario (más semántico que plural, devuelve 1 usuario)
router.get("/usuario", verifyToken, getUser);

// Password reset endpoints
router.post("/api/auth/request-password-reset", requestPasswordReset);
router.post("/api/auth/reset-password", resetPassword);

export default router;
