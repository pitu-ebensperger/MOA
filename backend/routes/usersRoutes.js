import { Router } from "express";
import { registerUser } from "../src/controllers/usersController.js";
import { checkRegisterCredentials } from "../src/middleware/credentialsMiddleware.js";

const router = Router();

router.post("/registro", checkRegisterCredentials, registerUser);

export default router;
