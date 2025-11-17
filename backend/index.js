import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

let PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

/* ----------------------------------------------------------------------------------------------------------- */

import categoriesRouter from "./routes/categoriesRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./src/utils/error.utils.js";
import home from "./routes/homeRoutes.js";

app.use(categoriesRouter);
app.use(productsRouter);
app.use(userRoutes);
app.use(authRoutes);

app.use(errorHandler);
app.use(home);
