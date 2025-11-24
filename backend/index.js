import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

/* ---------------------------- Rutas ---------------------------- */
import categoriesRouter from "./routes/categoriesRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import home from "./routes/homeRoutes.js";

import { errorHandler } from "./src/utils/error.utils.js";

// Rutas

app.use(home);
app.use(authRoutes);
app.use(userRoutes);

app.use(categoriesRouter);
app.use(productsRouter);

app.use(wishlistRoutes);
app.use(cartRoutes);


app.use(errorHandler);

export default app;

// Levantar servidor (NO en test)
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}