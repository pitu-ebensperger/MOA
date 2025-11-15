import { Router } from "express";
import { loginUser, getUser } from "../src/controllers/authController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { checkLoginCredentials } from "../src/middleware/credentialsMiddleware.js";

const router = Router();

router.post("/login", checkLoginCredentials, loginUser);
router.get("/usuarios", verifyToken, getUser);

export default router;
