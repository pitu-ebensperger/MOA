import { Router } from "express";
import { getCategories } from "../src/controllers/categoriesController.js";

const router = Router();

router.get("/", getCategories);

export default router;
