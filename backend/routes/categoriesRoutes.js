import { Router } from "express";
import { getCategories } from "../src/controllers/categoriesController.js";

const router = Router();

router.get("/categorias", getCategories);

export default router;
